// Les `.wgsl` de vgpu ne sont pas du texte brut : ils ont leur propre
// `import { … } from "./fluid-common.wgsl"`, resolu au build. vgpu livre un
// plugin Vite et un loader Webpack, pas de plugin esbuild — mais la fonction
// de transformation est exportee, donc le plugin tient en dix lignes.
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { transformWgsl } from '@vgpu/wgsl/loader-vite';

const wgsl = {
  name: 'vgpu-wgsl',
  setup(ctx) {
    ctx.onLoad({ filter: /\.wgsl$/ }, async (args) => {
      const source = await readFile(args.path, 'utf8');
      const { code } = await transformWgsl({ source, id: args.path });
      return { contents: code, loader: 'js' };
    });
  },
};

const result = await build({
  entryPoints: ['src/mount.ts'],
  bundle: true,
  format: 'iife',
  target: 'es2022',
  minify: true,
  outfile: '../../assets/fluid-backdrop.js',
  plugins: [wgsl],
  metafile: true,
});

const bytes = Object.values(result.metafile.outputs)[0].bytes;
console.log(`assets/fluid-backdrop.js — ${(bytes / 1024).toFixed(1)} kB`);
