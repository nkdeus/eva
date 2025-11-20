const { spawn } = require('child_process');
const glob = require('glob');
const path = require('path');

// Cherche tous les fichiers SCSS dans projects ET dans styles principal
const projectScssFiles = glob.sync('projects/*/styles/*.scss');
const mainScssExists = require('fs').existsSync('styles/main.scss');

if (projectScssFiles.length === 0 && !mainScssExists) {
  console.log('Aucun fichier SCSS trouvé dans projects/*/styles/*.scss ni styles/main.scss');
  process.exit(0);
}

const processes = [];

// Watch du fichier principal styles/main.scss si il existe
if (mainScssExists) {
  const mainSassArgs = [
    '--watch',
    'styles/main.scss:styles/main.css',
    '--style',
    'expanded',
  ];

  console.log('Watching: styles/main.scss → styles/main.css');
  const mainProc = spawn('npx', ['sass', ...mainSassArgs], { stdio: 'inherit', shell: true });
  processes.push(mainProc);
}

// Watch des fichiers de projets
projectScssFiles.forEach((scssFile) => {
  // Ex: projects/lili/styles/lili.scss => projects/lili/render/lili.css
  const parts = scssFile.split(path.sep);
  const project = parts[1];
  const fileName = path.basename(scssFile, '.scss');
  const outDir = path.join('projects', project, 'render');
  const outFile = path.join(outDir, fileName + '.css');

  // Crée le dossier de sortie s'il n'existe pas
  require('fs').mkdirSync(outDir, { recursive: true });

  const sassArgs = [
    '--watch',
    scssFile + ':' + outFile,
    '--style',
    'expanded',
  ];

  console.log(`Watching: ${scssFile} → ${outFile}`);
  const proc = spawn('npx', ['sass', ...sassArgs], { stdio: 'inherit', shell: true });
  processes.push(proc);
});

// Arrête tous les watchers à la fermeture du script
process.on('SIGINT', () => {
  processes.forEach((proc) => proc.kill());
  process.exit();
}); 