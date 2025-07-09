// EVA CSS JavaScript Generator
// Reproduit la logique SCSS en JavaScript pour générer les variables CSS

class EvaCSSGenerator {
  constructor(config = {}) {
    // Configuration par défaut (basée sur main.scss)
    this.config = {
      noFluidSuffix: config.noFluidSuffix ?? false,
      buildClass: config.buildClass ?? false,
      nameBySize: true, // Toujours true dans la version JS
      sizes: config.sizes ?? [4, 8, 12, 20, 32, 34, 52, 84, 136, 220, 356, 576, 712],
      fontSizes: config.fontSizes ?? [12, 16, 18, 24, 36, 52, 72],
      ...config
    };

    // Constantes EVA configurables
    this.max = config.max ?? 1;
    this.phi = config.phi ?? 1.61803398875;
    this.min = config.min ?? 0.5;
    this.ez = config.ez ?? 142.4;
    this.unit = config.unit ?? 1;
    this.unitFluid = config.unitFluid ?? 1;
    this.screen = config.screen ?? 1440;

    // Classes de sizing
    this.sizingClass = ['__', '_', '', '-'];
    if (this.config.noFluidSuffix) {
      this.sizingClass.push('-px', '-rem');
    }

    // Classes de font-size
    this.fontSizeClass = ['__', '_', ''];
    if (this.config.noFluidSuffix) {
      this.fontSizeClass.push('-px', '-rem');
    }

    // Propriétés
    this.properties = {
      w: 'width',
      h: 'height',
      p: 'padding',
      px: 'padding-inline',
      pr: 'padding-right',
      py: 'padding-block',
      br: 'border-radius',
      mb: 'margin-bottom',
      mt: 'margin-top',
      pt: 'padding-top',
      pb: 'padding-bottom',
      g: 'gap',
    };

    this.fontProperties = {
      fs: 'font-size',
    };



    this.generatedCSSVars = {};
    this.generatedClasses = [];
  }



  // Fonctions utilitaires (équivalentes aux fonctions SCSS)
  round2(number) {
    return Math.round(number * 100) / 100;
  }

  getPercent(size, ratio = 100) {
    return this.round2((size / this.screen) * ratio);
  }

  toPx(size) {
    return `${size}px`;
  }

  toRem(size) {
    return `${this.round2(size / 16)}rem`;
  }

  getMinRem(percent) {
    return this.round2(percent * 0.5);
  }

  getMaxRem(percent) {
    return this.round2(percent * this.max);
  }

  getVW(percent) {
    return this.round2(percent * this.unitFluid);
  }

  getFinalMinDiv(size, ratio) {
    return this.round2(size / ratio);
  }

  getFinalMinMulti(size, ratio) {
    return this.round2(size * ratio);
  }

  // Génération des variables CSS pour les tailles
  generateSizingVars() {
    let eva = 0;
    
    this.config.sizes.forEach(size => {
      eva++;
      if (this.config.nameBySize) {
        eva = size;
      }

      const calcPercent = this.getPercent(size);
      const calcPercent_ = this.getPercent(size, this.ez);

      const sizePx = this.toPx(size);
      const sizeRem = this.toRem(size);

      const remMin = this.getMinRem(calcPercent);
      const remMax = this.getMaxRem(calcPercent);

      const vwLight = `${this.round2(this.getVW(calcPercent) / 4)}vw + ${this.round2((size / 16) / 1.33)}rem`;
      const vwMedium = `${this.round2(this.getVW(calcPercent) / 2)}vw + ${this.round2((size / 16) / 2)}rem`;
      const vwStrong = `${this.round2(this.getVW(calcPercent) / 1.33)}vw + ${this.round2((size / 16) / 4)}rem`;
      const vwExtrem = `${this.getVW(calcPercent_)}vw - ${remMin}rem`;

      // Seul le mode "__" utilise la valeur min configurée
      const finalMin__ = this.min;
      // Les autres modes utilisent leurs propres calculs basés sur remMin uniquement
      const finalMin_ = this.getFinalMinDiv(remMin, this.phi);
      const finalMin = this.getFinalMinMulti(remMin, this.phi);

      const cssVars = {
        '__': {
          min: `${finalMin__}rem`, // Utilise la valeur min configurée (0.5rem)
          fluid: vwExtrem,
          max: `${remMax}rem`,
        },
        '_': {
          min: `${finalMin_}rem`, // Calcul indépendant : remMin / phi
          fluid: vwStrong,
          max: `${remMax}rem`,
        },
        '': {
          min: `${remMin}rem`, // Calcul indépendant : remMin calculé
          fluid: vwMedium,
          max: `${remMax}rem`,
        },
        '-': {
          min: `${finalMin}rem`, // Calcul indépendant : remMin * phi
          fluid: vwLight,
          max: `${remMax}rem`,
        },
      };

      if (this.config.noFluidSuffix) {
        cssVars['-px'] = sizePx;
        cssVars['-rem'] = sizeRem;
      }

      // Générer les variables CSS
      Object.entries(cssVars).forEach(([key, prop]) => {
        const varName = `--${eva}${key}`;
        if (typeof prop === 'object') {
          this.generatedCSSVars[varName] = `clamp(${prop.min}, ${prop.fluid}, ${prop.max})`;
        } else {
          this.generatedCSSVars[varName] = prop;
        }
      });
    });
  }

  // Génération des variables CSS pour les font-sizes
  generateFontSizeVars() {
    let eva = 0;
    const min = 0.6;
    const phi = 1.3;
    const fs = 'fs';

    this.config.fontSizes.forEach(size => {
      eva++;
      if (this.config.nameBySize) {
        eva = size;
      }

      const calcPercent = this.getPercent(size);
      const sizePx = this.toPx(size);
      const sizeRem = this.toRem(size);
      const remMin = this.getMinRem(calcPercent);
      const remMax = this.getMaxRem(calcPercent);

      const vwLight = `${this.round2(this.getVW(calcPercent) / 4)}vw + ${this.round2((size / 16) / 1.33)}rem`;
      const vwMedium = `${this.round2(this.getVW(calcPercent) / 2)}vw + ${this.round2((size / 16) / 2)}rem`;
      const vwStrong = `${this.round2(this.getVW(calcPercent) / 1.33)}vw + ${this.round2((size / 16) / 4)}rem`;

      const finalMin__ = this.getFinalMinDiv(remMin, phi);
      const finalMin = this.getFinalMinMulti(remMin, phi);

      const cssFsVars = {
        '__': {
          min: `${finalMin__}rem`,
          fluid: vwStrong,
          max: `${remMax}rem`,
        },
        '_': {
          min: `${remMin}rem`,
          fluid: vwMedium,
          max: `${remMax}rem`,
        },
        '': {
          min: `${finalMin}rem`,
          fluid: vwLight,
          max: `${remMax}rem`,
        },
      };

      if (this.config.noFluidSuffix) {
        cssFsVars['-px'] = sizePx;
        cssFsVars['-rem'] = sizeRem;
      }

      // Générer les variables CSS pour font-size
      Object.entries(cssFsVars).forEach(([key, prop]) => {
        const varName = `--${fs}-${eva}${key}`;
        if (typeof prop === 'object') {
          this.generatedCSSVars[varName] = `clamp(${prop.min}, ${prop.fluid}, ${prop.max})`;
        } else {
          this.generatedCSSVars[varName] = prop;
        }
      });
    });
  }

  // Génération des classes CSS
  generateClasses() {
    // Vider le tableau des classes si buildClass est désactivé
    if (!this.config.buildClass) {
      this.generatedClasses = [];
      return;
    }

    // Classes pour les tailles
    let eva = 0;
    this.config.sizes.forEach(size => {
      eva++;
      if (this.config.nameBySize) {
        eva = size;
      }

      Object.entries(this.properties).forEach(([key, prop]) => {
        this.sizingClass.forEach(classSuffix => {
          this.generatedClasses.push(`.${key}-${eva}${classSuffix} { ${prop}: var(--${eva}${classSuffix}); }`);
        });
      });
    });

    // Classes pour les font-sizes
    eva = 0;
    this.config.fontSizes.forEach(size => {
      eva++;
      if (this.config.nameBySize) {
        eva = size;
      }

      Object.entries(this.fontProperties).forEach(([key, prop]) => {
        this.fontSizeClass.forEach(classSuffix => {
          this.generatedClasses.push(`.${key}-${eva}${classSuffix} { ${prop}: var(--${key}-${eva}${classSuffix}); }`);
        });
      });
    });
  }



  // Générer tout
  generate() {
    this.generateSizingVars();
    this.generateFontSizeVars();
    this.generateClasses();
    return this;
  }

  // Appliquer les variables CSS au document (DÉSACTIVÉ pour éviter les conflits)
  applyToDocument() {
    // Cette fonction est désactivée pour éviter que le configurateur
    // modifie les styles de la page en temps réel
    console.log('🚫 applyToDocument() désactivé - pas d\'application au DOM');
    return this;
  }

  // Générer le CSS complet
  getCSS() {
    let css = ':root {\n';
    
    Object.entries(this.generatedCSSVars).forEach(([varName, value]) => {
      css += `  ${varName}: ${value};\n`;
    });
    
    css += '}\n\n';
    
    if (this.config.buildClass) {
      css += this.generatedClasses.join('\n');
    }
    
    return css;
  }

  // Interface de configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Mettre à jour les constantes si elles sont fournies
    if (newConfig.screen !== undefined) this.screen = newConfig.screen;
    if (newConfig.unitFluid !== undefined) this.unitFluid = newConfig.unitFluid;
    if (newConfig.min !== undefined) this.min = newConfig.min;
    if (newConfig.ez !== undefined) this.ez = newConfig.ez;
    if (newConfig.phi !== undefined) this.phi = newConfig.phi;
    if (newConfig.max !== undefined) this.max = newConfig.max;
    
    this.generatedCSSVars = {};
    this.generatedClasses = [];
    return this;
  }

  // Obtenir les variables générées
  getVariables() {
    return this.generatedCSSVars;
  }

  // Obtenir les classes générées
  getClasses() {
    return this.generatedClasses;
  }
}

// Interface simple pour configurer les variables
class EvaConfigInterface {
  constructor() {
    this.generator = new EvaCSSGenerator();
    this.loadSavedConfig();
    this.createInterface();
    
    // Application initiale avec injection des variables CSS
    setTimeout(() => {
      this.applyConfigurationRealTime();
    }, 200);
  }

  createInterface() {
    // Vérifier s'il y a déjà une interface existante
    const existingInterface = document.getElementById('eva-main-container');
    if (existingInterface) {
      console.log('🔄 Interface already exists, skipping creation');
      return;
    }

    // Créer le conteneur principal
    const mainContainer = document.createElement('div');
    mainContainer.id = 'eva-main-container';
    mainContainer.className = 'por w-full';

    // Interface de configuration
    const configContainer = document.createElement('div');
    configContainer.id = 'eva-config-interface';
    configContainer.className = 'por flex y g-12 w-full _bg-light__  p-12 br-8';
  

    configContainer.innerHTML = `
     
      
      <div class=" flex x start-center w-full">
        <input type="checkbox" id="noFluidSuffix" ${this.generator.config.noFluidSuffix ? 'checked' : ''}>
        <label for="noFluidSuffix" class="_c-dark bold lh-1" style="display: block;">No Fluid Suffix (px & rem):</label>
      </div>

      <div class=" flex x start-center w-full">
        <input type="checkbox" id="buildClass" ${this.generator.config.buildClass ? 'checked' : ''}>
        <label for="buildClass" class="_c-dark bold lh-1" style="display: block;">Build Classes:</label>
      </div>

      <div class="w-full">
        <label class="mb-4 _c-dark bold lh-1" style="display: block;">Sizes (comma separated):</label>
        <textarea id="sizes" class="w-full _p-4" style="height: 40px; resize: none;">${this.generator.config.sizes.join(', ')}</textarea>
      </div>

      <div class=" w-full">
        <label class="mb-4 _c-dark bold" style="display: block;">Font Sizes (comma separated):</label>
        <textarea id="fontSizes" class="w-full _p-4" style="height: 40px; resize: none;">${this.generator.config.fontSizes.join(', ')}</textarea>
      </div>

    

      <div class="w-full">
        <label class="mb-4 _c-dark bold lh-1" style="display: block;">Figma Screen Width (px):</label>
        <input type="number" id="screen" value="${this.generator.screen}" min="320" max="2560" step="1" class="w-full _p-4">
      </div>

      <div class="w-full">
        <label class="mb-4 _c-dark bold lh-1" style="display: block;">Base Ratio (Φ):</label>
        <select id="phi" class="w-full _p-4">
          <option value="1.61803398875" ${this.generator.phi === 1.61803398875 ? 'selected' : ''}>Golden Ratio (1.618)</option>
          <option value="1.5" ${this.generator.phi === 1.5 ? 'selected' : ''}>1.5</option>
          <option value="1.3" ${this.generator.phi === 1.3 ? 'selected' : ''}>1.3</option>
          <option value="1.2" ${this.generator.phi === 1.2 ? 'selected' : ''}>1.2</option>
          <option value="1.1" ${this.generator.phi === 1.1 ? 'selected' : ''}>1.1</option>
          <option value="2" ${this.generator.phi === 2 ? 'selected' : ''}>2.0</option>
        </select>
      </div>


      <div class="w-full">
        <label class="mb-4 _c-dark bold lh-1" style="display: block;">Slow resize:         <span id="unitFluidValue" class="_c-dark" style="display: inline-block">${this.generator.unitFluid}</span></label>
        <input type="range" id="unitFluid" value="${this.generator.unitFluid}" min="0.8" max="1.2" step="0.01" class="w-full">

      </div>

      <div class="w-full">
        <label class="mb-4 _c-dark bold lh-1" style="display: block;">Extrem min: <span id="minValue" class="_c-dark" style="display: inline-block">${this.generator.min}rem</span> </label>
        <input type="range" id="min" value="${this.generator.min}" min="0.5" max="1.5" step="0.1" class="w-full">
        
      </div>

      

   

      <button id="downloadCSS" class="w-full _p-8 _bg-accent _c-light border thin mb-8" style="cursor: pointer;">
        Download CSS
      </button>
         <button id="resetConstants" class="w-full _p-8 _bg-light _c-dark border thin mb-8" style="cursor: pointer;">
        Reset Design System Constants
      </button>
    `;

    // Assembler le layout
    mainContainer.appendChild(configContainer);
    document.getElementById('config-display').appendChild(mainContainer);
    
    this.bindEvents();
    
    // Initialiser l'affichage des sections selon l'état par défaut
    setTimeout(() => {
      this.toggleClassesDisplay();
    }, 100);
  }

  bindEvents() {
    document.getElementById('downloadCSS').addEventListener('click', () => {
      this.downloadCSS();
    });

    // Écouter les changements des checkboxes pour appliquer en temps réel
    document.getElementById('noFluidSuffix').addEventListener('change', () => {
      this.applyConfigurationRealTime();
    });

    document.getElementById('buildClass').addEventListener('change', () => {
      this.applyConfigurationRealTime();
    });

    // Écouter les changements des inputs texte pour appliquer en temps réel
    document.getElementById('sizes').addEventListener('input', () => {
      this.applyConfigurationRealTime();
    });

    document.getElementById('fontSizes').addEventListener('input', () => {
      this.applyConfigurationRealTime();
    });

    document.getElementById('screen').addEventListener('input', () => {
      this.applyConfigurationRealTime();
    });

    document.getElementById('phi').addEventListener('change', () => {
      this.applyConfigurationRealTime();
    });

    // Écouter les changements des range inputs pour mettre à jour les valeurs affichées ET appliquer en temps réel
    document.getElementById('unitFluid').addEventListener('input', (e) => {
      document.getElementById('unitFluidValue').textContent = e.target.value;
      this.applyConfigurationRealTime();
    });

    document.getElementById('min').addEventListener('input', (e) => {
      document.getElementById('minValue').textContent = e.target.value + 'rem';
      this.applyConfigurationRealTime();
    });



    // Écouter le bouton reset
    document.getElementById('resetConstants').addEventListener('click', () => {
      this.resetDesignSystemConstants();
    });
  }

  // Nouvelle méthode pour appliquer en temps réel
  applyConfigurationRealTime() {
    // Validation des entrées pour éviter les erreurs
    const sizesInput = document.getElementById('sizes').value.trim();
    const fontSizesInput = document.getElementById('fontSizes').value.trim();
    
    // Éviter de traiter si les champs critiques sont vides
    if (!sizesInput || !fontSizesInput) {
      return;
    }

    const newConfig = {
      noFluidSuffix: document.getElementById('noFluidSuffix').checked,
      buildClass: document.getElementById('buildClass').checked,
      nameBySize: true, // Toujours true dans la version JS
      sizes: sizesInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)),
      fontSizes: fontSizesInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)),
      // Nouvelles constantes configurables
      screen: parseFloat(document.getElementById('screen').value) || 1440,
      unitFluid: parseFloat(document.getElementById('unitFluid').value) || 1,
      min: parseFloat(document.getElementById('min').value) || 0.5,
      phi: parseFloat(document.getElementById('phi').value) || 1.61803398875,
      max: 1 // Valeur fixe, plus d'interface
    };

    // Éviter de traiter si les arrays sont vides
    if (newConfig.sizes.length === 0 || newConfig.fontSizes.length === 0) {
      return;
    }

    // Mettre à jour les constantes du générateur
    this.generator.screen = newConfig.screen;
    this.generator.unitFluid = newConfig.unitFluid;
    this.generator.min = newConfig.min;
    this.generator.phi = newConfig.phi;
    this.generator.max = newConfig.max;

    this.generator.updateConfig(newConfig).generate();
    
    // Sauvegarder la configuration
    this.saveConfig(newConfig);
    
    // Mettre à jour l'affichage des variables
    this.updateDisplays();
    
    // Injecter les variables CSS dans le conteneur de démonstration
    this.injectCSSVariables();
  }

  // Méthode legacy pour compatibilité
  applyConfiguration() {
    this.applyConfigurationRealTime();
  }

  // Méthode pour mettre à jour les affichages
  updateDisplays() {
    const variablesDisplay = document.getElementById('variables-display');
    const variables = this.generator.getVariables();
    variablesDisplay.innerHTML = Object.entries(variables)
      .map(([name, value]) => `<div style="margin-bottom: 2px;">${name}: ${value};</div>`)
      .join('');
    
    const classesDisplay = document.getElementById('classes-display');
    const classes = this.generator.getClasses();
    classesDisplay.innerHTML = classes
      .slice(0, 100)
      .map(cls => `<div style="margin-bottom: 1px; font-size: 11px;">${cls}</div>`)
      .join('') + (classes.length > 100 ? `<div style="margin-top: 10px; font-style: italic;">... and ${classes.length - 100} more classes</div>` : '');
    
    this.toggleClassesDisplay();
  }

  // Méthode pour injecter les variables CSS dans le conteneur de démonstration
  injectCSSVariables() {
    const demoContainer = document.getElementById('demo-container');
    if (!demoContainer) {
      console.warn('Demo container not found');
      return;
    }

    const variables = this.generator.getVariables();
    
    // Créer le style inline avec toutes les variables générées
    const cssText = Object.entries(variables)
      .map(([name, value]) => `${name}: ${value}`)
      .join('; ');
    
    // Appliquer les variables au conteneur
    demoContainer.style.cssText = demoContainer.style.cssText + '; ' + cssText;
    
    console.log('✨ Variables CSS injectées dans #demo-container:', Object.keys(variables).length);
  }

  updateInterfaceFromConfig() {
    const noFluidSuffix = document.getElementById('noFluidSuffix').checked;
    const buildClass = document.getElementById('buildClass').checked;
    
    // Mettre à jour l'affichage selon la configuration
    this.updateVariablesDisplay(noFluidSuffix, buildClass);
    this.toggleClassesDisplay();
  }

  toggleClassesDisplay() {
    const buildClass = document.getElementById('buildClass').checked;
    const classesSection = document.getElementById('classes-display').parentElement;
    
    if (buildClass) {
      classesSection.style.display = '';
    } else {
      classesSection.style.display = 'none';
    }
  }

  updateVariablesDisplay(noFluidSuffix, buildClass) {
    // Régénérer les variables avec la nouvelle configuration
    this.generator.updateConfig({ noFluidSuffix, buildClass }).generate();
    
    // Mettre à jour l'affichage des variables
    const variablesDisplay = document.getElementById('variables-display');
    const variables = this.generator.getVariables();
    variablesDisplay.innerHTML = Object.entries(variables)
      .map(([name, value]) => `<div>${name}: ${value};</div>`)
      .join('');
    
    // Mettre à jour l'affichage des classes
    const classesDisplay = document.getElementById('classes-display');
    const classes = this.generator.getClasses();
    classesDisplay.innerHTML = classes
      .map(cls => `<div>${cls}</div>`)
      .join('');
      
    // Mettre à jour la visibilité de la section classes
    this.toggleClassesDisplay();
  }



  downloadCSS() {
    const css = this.generator.generate().getCSS();
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eva-generated.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Sauvegarder la configuration en localStorage
  saveConfig(config) {
    try {
      localStorage.setItem('eva-config', JSON.stringify(config));
    } catch (error) {
      console.warn('Impossible de sauvegarder la configuration:', error);
    }
  }

  // Charger la configuration depuis localStorage
  loadSavedConfig() {
    try {
      const savedConfig = localStorage.getItem('eva-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        this.generator.updateConfig(config);
        
        // Mettre à jour les constantes
        if (config.screen !== undefined) this.generator.screen = config.screen;
        if (config.unitFluid !== undefined) this.generator.unitFluid = config.unitFluid;
        if (config.min !== undefined) this.generator.min = config.min;
        if (config.phi !== undefined) this.generator.phi = config.phi;
        if (config.max !== undefined) this.generator.max = config.max;
      }
    } catch (error) {
      console.warn('Impossible de charger la configuration sauvegardée:', error);
    }
  }

  // Réinitialiser les constantes du design system aux valeurs par défaut
  resetDesignSystemConstants() {
    // Valeurs par défaut
    const defaultValues = {
      screen: 1440,
      unitFluid: 1,
      min: 0.5,
      phi: 1.61803398875,
      max: 1
    };

    // Mettre à jour les inputs
    document.getElementById('screen').value = defaultValues.screen;
    document.getElementById('unitFluid').value = defaultValues.unitFluid;
    document.getElementById('unitFluidValue').textContent = defaultValues.unitFluid;
    document.getElementById('min').value = defaultValues.min;
    document.getElementById('minValue').textContent = defaultValues.min + 'rem';
    document.getElementById('phi').value = defaultValues.phi;

    // Appliquer la configuration en temps réel
    this.applyConfigurationRealTime();

    // Feedback visuel
    const button = document.getElementById('resetConstants');
    const originalText = button.textContent;
    button.textContent = 'Reset!';
    button.style.background = '#ffc107';
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
    }, 1000);
  }
}

// Export pour utilisation
window.EvaCSSGenerator = EvaCSSGenerator;
window.EvaConfigInterface = EvaConfigInterface;

// Auto-initialisation si on est sur la page js-calculator.html
// Mais seulement si l'initialisation manuelle n'est pas demandée
if (window.location.pathname.includes('js-calculator.html') && !window.EVA_MANUAL_INIT) {
  document.addEventListener('DOMContentLoaded', () => {
    const interface = new EvaConfigInterface();
    interface.generator.generate();
  });
} 