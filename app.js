// Configuration globale
let body;
const updateAngle = true;
const darkModeByHour = false;

// Fonction pour récupérer les paramètres de l'URL
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Fonction pour définir un cookie
function setCookie(name, value, minutes) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (minutes * 60 * 1000));
  document.cookie = name + "=" + value + ";expires=" + expires.toUTCString() + ";path=/";
}

// Fonction pour récupérer un cookie
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Fonction pour appliquer le thème depuis l'URL
function applyThemeFromUrl() {
  const themeParam = getUrlParameter('theme');
  if (themeParam) {
    // Supprimer toutes les classes de thème existantes
    body.classList.remove('theme-eva');
    
    // Ajouter la nouvelle classe de thème
    body.classList.add(themeParam);
    
    // Mettre à jour la classe current-theme si nécessaire
    body.classList.remove('current-theme');
    body.classList.add('current-theme');
    
    // Si c'est theme-ghost ou theme-eva, gérer la hue
    if (themeParam === 'theme-ghost' || themeParam === 'theme-eva') {
      applyHueFromCookie();
    } else {
      body.style.removeProperty('--brand-hue');
      body.style.removeProperty('--accent-hue');
      body.style.removeProperty('--extra-hue');
    }
  }
}

// Fonction pour appliquer des HUE depuis les cookies ou en générer de nouvelles
function applyHueFromCookie() {
  // Gérer --brand-hue (seule HUE sauvegardée, les autres sont calculées)
  const savedBrandHue = getCookie('eva-brand-hue');
  let brandHue;
  
  if (savedBrandHue) {
    brandHue = parseFloat(savedBrandHue);
  } else {
    brandHue = Math.floor(Math.random() * 360);
    setCookie('eva-brand-hue', brandHue, 10);
  }
  
  // Calculer les HUE harmoniques basées sur la brand-hue (harmonie triadique)
  const accentHue = (brandHue + 120) % 360;
  const extraHue = (brandHue + 240) % 360;
  
  // Appliquer toutes les HUE
  body.style.setProperty('--brand-hue', brandHue);
  body.style.setProperty('--accent-hue', accentHue);
  body.style.setProperty('--extra-hue', extraHue);
}

// Fonction pour appliquer une HUE aléatoire si theme-eva est présent
function applyRandomHueForEva() {
  if (body.classList.contains('theme-eva')) {
    applyHueFromCookie();
  }
}

// Fonction pour initialiser le draggable sur les éléments .ballzzz
function initBallzzzDraggable() {
  // Vérifier que GSAP Draggable est disponible
  if (typeof Draggable === 'undefined') {
    console.warn('GSAP Draggable not loaded');
    return;
  }
  
  const ballzzzElements = document.querySelectorAll('.ballzzz');
  
  if (ballzzzElements.length === 0) {
    console.warn('No .ballzzz elements found');
    return;
  }
  
  ballzzzElements.forEach(element => {
    let startAngle = 0;
    let currentAngle = 0;
    let startBrandHue = 0;
    let currentBrandHue = 0;
    let currentAccentHue = 0;
    let currentExtraHue = 0;
    
    // Créer l'instance Draggable
    Draggable.create(element, {
      type: "x,y",
      bounds: "body",
      inertia: true,
      onDragStart: function() {
        // Ajouter une classe pour l'état de drag
        element.classList.add('dragging');
        // Augmenter légèrement le z-index pendant le drag
        element.style.zIndex = '1000';
        
        // Supprimer #tuto du DOM
        const tutoElement = document.getElementById('tuto');
        if (tutoElement) {
          tutoElement.remove();
        }
        
        // Récupérer l'angle actuel
        const currentAngleValue = getComputedStyle(element).getPropertyValue('--angle') || '0';
        startAngle = parseFloat(currentAngleValue);
        currentAngle = startAngle;
        
        // Récupérer la HUE principale actuelle
        const currentBrandHueValue = getComputedStyle(body).getPropertyValue('--brand-hue') || '169';
        startBrandHue = parseFloat(currentBrandHueValue);
        currentBrandHue = startBrandHue;
      },
      onDrag: function() {
        // Calculer la distance de déplacement
        const deltaX = this.x - this.startX;
        const deltaY = this.y - this.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Calculer l'angle de rotation basé sur la distance
        const rotationSpeed = 0.5;
        const newAngle = startAngle + (distance * rotationSpeed);
        
        // Appliquer la rotation
        element.style.setProperty('--angle', newAngle);
        currentAngle = newAngle;
        
        // Calculer le changement de HUE basé sur la distance
        const hueSpeed = 0.3;
        const hueChange = distance * hueSpeed;
        
        // Appliquer le changement à toutes les HUE
        const newBrandHue = (startBrandHue + hueChange) % 360;
        const newAccentHue = (newBrandHue + 120) % 360;
        const newExtraHue = (newBrandHue + 240) % 360;
        
        // Appliquer les nouvelles HUE
        body.style.setProperty('--brand-hue', newBrandHue);
        body.style.setProperty('--accent-hue', newAccentHue);
        body.style.setProperty('--extra-hue', newExtraHue);
        
        currentBrandHue = newBrandHue;
        currentAccentHue = newAccentHue;
        currentExtraHue = newExtraHue;
      },
      onDragEnd: function() {
        // Retirer la classe de drag
        element.classList.remove('dragging');
        
        // Sauvegarder seulement la brand-hue (les autres sont calculées automatiquement)
        setCookie('eva-brand-hue', Math.round(currentBrandHue), 10);
        
        // Animation de retour à la position initiale
        gsap.to(element, {
          duration: 1.2,
          ease: "elastic.out(1, 0.3)",
          x: 0,
          y: 0,
          onComplete: function() {
            // Réinitialiser le z-index
            element.style.zIndex = '';
          }
        });
        
        // Animation de retour de l'angle à sa valeur initiale
        gsap.to(element, {
          duration: 1.2,
          ease: "elastic.out(1, 0.3)",
          '--angle': startAngle,
          onUpdate: function() {
            // Mettre à jour la variable CSS pendant l'animation
            const progress = this.progress();
            const currentAngleValue = startAngle + (currentAngle - startAngle) * (1 - progress);
            element.style.setProperty('--angle', currentAngleValue);
          },
          onComplete: function() {
            // Supprimer la variable CSS --angle pour permettre la rotation au scroll
            element.style.removeProperty('--angle');
          }
        });
      }
    });
  });
  
  console.log(`Initialized draggable on ${ballzzzElements.length} .ballzzz elements`);
}

// Fonction pour vérifier si c'est le jour
function isDayTime() {
  const maintenant = new Date();
  const heure = maintenant.getHours();
  return heure >= 7 && heure < 19; 
}

// Fonction pour mettre à jour la classe du body selon l'heure
function updateBodyClass() {
  if (isDayTime()) {
    body.classList.remove('darkMode');
  } else {
    body.classList.add('darkMode');
  }
}

// Fonction pour générer un titre avec des classes aléatoires
function randomTitle() {
  const titleElements = document.querySelectorAll('.title');
  if (!titleElements.length) {
    console.warn('⚠️ No .title elements found');
    return;
  }

  console.log(`🎨 Applying random classes to ${titleElements.length} .title elements`);
  
  titleElements.forEach((titleElement, index) => {
    const titleText = titleElement.textContent;
    console.log(`Processing title ${index + 1}: "${titleText}"`);
    
    applyRandomClassesToElement(titleElement, titleText);
  });
}

function applyRandomClassesToElement(titleElement, titleText) {

  // Fonction pour générer une classe aléatoire pour fwg (1-8)
  function getRandomFwgClass() {
    const randomNum = Math.floor(Math.random() * 8) + 1;
    return `fwg-${randomNum}`;
  }

  // Fonction pour générer une classe aléatoire pour fwd (1-13)
  function getRandomFwdClass() {
    const randomNum = Math.floor(Math.random() * 13) + 1;
    return `fwd-${randomNum}`;
  }

  // Initialiser une chaîne pour le nouveau contenu HTML
  let newTitleHTML = '';

  // Boucle à travers chaque caractère du texte du titre
  for (const char of titleText) {
    // Ignore les espaces
    if (char.trim() !== '') {
      // Génère les classes aléatoires pour chaque lettre
      const randomFwgClass = getRandomFwgClass();
      const randomFwdClass = getRandomFwdClass();

      // Crée un span avec les classes aléatoires
      newTitleHTML += `<span class="${randomFwgClass} ${randomFwdClass} f-scale">${char}</span>`;
    } else {
      // Ajouter un espace sous forme de span sans classe
      newTitleHTML += `<span> </span>`;
    }
  }

  // Remplacez le contenu du titre par le nouveau HTML
  titleElement.innerHTML = newTitleHTML;
  console.log(`✅ Applied random classes to: "${titleText}"`);
}

// Fonction pour appliquer le thème initial (priorité aux préférences sauvegardées)
function applyInitialTheme() {
  const savedTheme = getCookie('eva-theme-preference');
  
  if (savedTheme) {
    // Appliquer la préférence sauvegardée (prioritaire)
    if (savedTheme === 'dark') {
      body.classList.add('toggle-theme');
    } else {
      body.classList.remove('toggle-theme');
    }
  } else {
    // Appliquer les préférences système si aucune préférence sauvegardée
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    updateTheme(darkModeMediaQuery);
  }
}

// Fonction pour mettre à jour le thème selon les préférences système
function updateTheme(e) {
  // Ne pas écraser les préférences sauvegardées
  const savedTheme = getCookie('eva-theme-preference');
  if (savedTheme) return;
  
  if (e.matches) {
    // L'utilisateur préfère le mode sombre
    body.classList.add('toggle-theme');
  } else {
    // L'utilisateur ne préfère pas le mode sombre
    body.classList.remove('toggle-theme');
  }
}

// Fonction pour initialiser les animations GSAP
function initGSAPAnimations() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.to("body", {
    scrollTrigger: {
      trigger: "body", 
      start: "top top", 
      end: "bottom bottom", 
      scrub: true, 
      onUpdate: (self) => {
        if (updateAngle) {
          let angle = Math.ceil((self.progress * 360) * 100) / 100; 
          nav.style.setProperty("--angle", angle.toString());
        }
      }
    }
  });
}

// Fonction pour initialiser la navigation de démonstration
function initDemoNavigation() {
  const navItems = document.querySelectorAll('#nav-demo li');
  const demo = document.getElementById('demo');
  const demoLines = document.querySelectorAll('.demo-line code span');

  if (!navItems.length || !demo) return;

  navItems.forEach(item => {
    item.addEventListener('click', function() {
      navItems.forEach(nav => nav.classList.remove('selected'));
      
      this.classList.add('selected');
      
      const dataGetterValue = this.getAttribute('data-getter');
      demo.setAttribute('data-setter', dataGetterValue);
      
      demoLines.forEach(span => {
        span.textContent = dataGetterValue;
      });
    });
  });
}

// Fonction pour initialiser le toggle de thème
function initThemeToggle() {
  const toggleElement = document.querySelector('.dark-light-toggle');
  if (!toggleElement) return;

  toggleElement.addEventListener('click', function(e) {
    e.preventDefault();
    body.classList.toggle('toggle-theme');
    
    // Sauvegarder la préférence utilisateur
    const isDarkMode = body.classList.contains('toggle-theme');
    setCookie('eva-theme-preference', isDarkMode ? 'dark' : 'light', 43200); // 30 jours
  });
}

// Fonction pour initialiser le burger menu
function initBurgerMenu() {
  const burgerButton = document.getElementById('burger-menu');
  const menu = document.getElementById('menu');
  
  if (!burgerButton || !menu) return;

  burgerButton.addEventListener('click', function() {
    // Toggle la classe active sur le bouton burger
    burgerButton.classList.toggle('active');
    
    // Toggle la classe menu-open sur le menu
    menu.classList.toggle('menu-open');
    
    // Optionnel : empêcher le scroll du body quand le menu est ouvert
    if (menu.classList.contains('menu-open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  });
  
  // Fermer le menu quand on clique sur un lien
  const menuLinks = menu.querySelectorAll('a');
  menuLinks.forEach(link => {
    link.addEventListener('click', function() {
      burgerButton.classList.remove('active');
      menu.classList.remove('menu-open');
      document.body.style.overflow = 'auto';
    });
  });
  
  // Fermer le menu quand on redimensionne la fenêtre (responsive)
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      burgerButton.classList.remove('active');
      menu.classList.remove('menu-open');
      document.body.style.overflow = 'auto';
    }
  });
}

// Fonction pour détecter si on est en environnement local
function isLocalEnvironment() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' || 
         window.location.protocol === 'file:' ||
         window.location.hostname.includes('.local');
}

// Fonction pour normaliser les noms de fichiers (avec ou sans .html)
function normalizeFileName(fileName) {
  // Si le fichier a déjà .html, le retourner tel quel
  if (fileName.endsWith('.html')) {
    return fileName;
  }
  // Sinon, ajouter .html
  return fileName + '.html';
}

// Fonction pour obtenir le nom de fichier actuel normalisé
function getCurrentFileName() {
  let fileName = window.location.pathname.split('/').pop();
  
  // Si pas d'extension et pas vide, ajouter .html
  if (fileName && !fileName.includes('.')) {
    fileName += '.html';
  }
  
  // Si vide (racine), c'est index.html
  if (!fileName || fileName === '/') {
    fileName = 'index.html';
  }
  
  return fileName;
}

// Fonction pour générer l'URL correcte selon l'environnement
function generateUrl(targetFile) {
  const isLocal = isLocalEnvironment();
  
  // Déterminer si on est dans un sous-dossier (framework)
  const currentPath = window.location.pathname;
  const isInFramework = currentPath.includes('/framework/');
  
  let url = '';
  
  // Gérer les cas spéciaux
  if (targetFile === 'index.html') {
    url = isInFramework ? '../' : './';
  } else if (targetFile === 'framework.html') {
    url = isInFramework ? '../framework' : './framework';
  } else if (targetFile === 'figma-to-eva.html') {
    url = isInFramework ? '../figma-to-eva' : './figma-to-eva';
  } else {
    // Pages du framework
    const baseName = targetFile.replace('.html', '');
    url = isInFramework ? baseName : `./framework/${baseName}`;
  }
  
  // Ajouter .html seulement en local
  if (isLocal && !url.endsWith('/') && !url.endsWith('.html')) {
    url += '.html';
  }
  
  return url;
}

// Fonction pour initialiser la navigation dynamique "Back to [page]"
function initDynamicBackNavigation() {
  const goBackButton = document.getElementById('goBack');
  const goNextButton = document.getElementById('goNext');

  // Mapping des noms de fichiers vers les objets avec title et goNext
  const pageMapping = {
    'doc.html': {
      title: 'Docs',
      goNext: 'colors.html'
    },
    'framework.html': {
      title: 'Framework',
      goNext: 'doc.html'
    },
    'colors.html': {
      title: 'Colors',
      goNext: 'gradients.html'
    },
    'gradients.html': {
      title: 'Gradients',
      goNext: 'grids.html'
    },
    'grids.html': {
      title: 'Grids',
      goNext: 'flex.html'
    },
    'flex.html': {
      title: 'Flex',
      goNext: 'css-fluid.html'
    },
    'css-fluid.html': {
      title: 'Fluid CSS',
      goNext: 'fonts.html'
    },
    'fonts.html': {
      title: 'Fonts',
      goNext: 'sizes.html'
    },
    'sizes.html': {
      title: 'Sizes',
      goNext: 'auto-theme.html'
    },
    'auto-theme.html': {
      title: 'Auto Theme',
      goNext: 'js-calculator.html'
    },
    'js-calculator.html': {
      title: 'JS Calculator',
      goNext: 'figma-to-eva.html'
    },
    'figma-to-eva.html': {
      title: 'Figma to EVA',
      goNext: 'framework.html'
    },
    'index.html': {
      title: 'Home',
      goNext: 'framework.html'
    }
  };

  // Gestion du bouton goBack
  if (goBackButton) {
    // Obtenir le nom de fichier de la page courante normalisé
    const currentFileName = getCurrentFileName();
    console.log("currentFileName", currentFileName);

    // Obtenir l'URL de la page précédente
    const referrer = document.referrer;
  
    if (referrer) {
      try {
        // Extraire le nom de fichier de l'URL référente
        const referrerUrl = new URL(referrer);
        let fileName = referrerUrl.pathname.split('/').pop();
        fileName = normalizeFileName(fileName);
        
        // Si la page précédente est la même que la page courante, on va vers home
        if (fileName === currentFileName) {
          const spanElement = goBackButton.querySelector('span');
          if (spanElement) {
            spanElement.textContent = 'Back';
          }
          goBackButton.href = generateUrl('index.html');
        }
        // Vérifier si la page précédente est dans notre mapping
        else if (pageMapping[fileName]) {
          const pageName = pageMapping[fileName].title;
          
          // Mettre à jour le texte du bouton
          const spanElement = goBackButton.querySelector('span');
          if (spanElement) {
            spanElement.textContent = `Back to ${pageName}`;
          } 
          
          // Générer l'URL correcte
          goBackButton.href = generateUrl(fileName);
          
          console.log(`Dynamic navigation: Back to ${pageName} (${fileName})`);
        }
        else {
          // Si aucune correspondance trouvée, garder juste "Back"
          const spanElement = goBackButton.querySelector('span');
          if (spanElement) {
            spanElement.textContent = 'Back';
          }
          
          // URL par défaut (retour vers doc.html)
          goBackButton.href = generateUrl('doc.html');
          
          console.log('Dynamic navigation: Using default "Back"');
        }
      } catch (error) {
        console.warn('Error parsing referrer URL:', error);
        // En cas d'erreur, utiliser le fallback
        const spanElement = goBackButton.querySelector('span');
        if (spanElement) {
          spanElement.textContent = 'Back';
        }
        goBackButton.href = generateUrl('doc.html');
      }
    }
    else {
      // Pas de referrer, utiliser le fallback
      const spanElement = goBackButton.querySelector('span');
      if (spanElement) {
        spanElement.textContent = 'Back';
      }
      goBackButton.href = generateUrl('doc.html');
    }
  }

  // Gestion du bouton goNext
  if (goNextButton) {
    const currentFileName = getCurrentFileName();

    if (pageMapping[currentFileName]) {
      const nextPage = pageMapping[currentFileName].goNext;
      const nextPageTitle = pageMapping[nextPage].title;

      const spanElement = goNextButton.querySelector('span');
      if (spanElement) {
        spanElement.textContent = `Go to ${nextPageTitle}`;
      }

      goNextButton.href = generateUrl(nextPage);
    } else {
      const spanElement = goNextButton.querySelector('span');
      if (spanElement) {
        spanElement.textContent = 'Go to Framework';
      }
      goNextButton.href = generateUrl('framework.html');
    }
  }
}

// Fonction pour initialiser la gestion du scroll pour le menu
function initScrollMenuHandler() {
  const innerMenu = document.querySelector('.inner-menu');
  if (!innerMenu) return;

  function handleScroll() {
    if (window.scrollY > 0) {
      innerMenu.classList.add('stack-menu');
    } else {
      innerMenu.classList.remove('stack-menu');
    }
  }

  // Écouter l'événement scroll
  window.addEventListener('scroll', handleScroll);
  
  // Vérifier la position initiale au chargement
  handleScroll();
}

// Fonction principale d'initialisation
function initApp() {
  // Générer le titre aléatoire
  randomTitle();
  
  // Initialiser le body
  body = document.querySelector('body');
  
  // Appliquer le thème depuis l'URL
  applyThemeFromUrl();
  
  // Appliquer une HUE aléatoire si theme-eva est présent
  applyRandomHueForEva();

  // Gérer le mode sombre
  if (darkModeByHour) {
    updateBodyClass();
  } else {
    // Appliquer le thème initial (priorité aux préférences sauvegardées)
    applyInitialTheme();
    
    // Écouter les changements des préférences système
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', updateTheme);
  }

  // Initialiser les animations GSAP
  initGSAPAnimations();

  // Initialiser la navigation de démonstration
  initDemoNavigation();

  // Initialiser le toggle de thème
  initThemeToggle();

  // Initialiser le burger menu
  initBurgerMenu();

  // Initialiser la navigation dynamique "Back to [page]"
  initDynamicBackNavigation();

  // Initialiser la gestion du scroll pour le menu
  initScrollMenuHandler();

  // Initialiser le draggable sur les éléments .ballzzz
  // Attendre un peu que tous les éléments soient bien rendus
  setTimeout(() => {
    initBallzzzDraggable();
  }, 100);
}

// Écouter l'événement DOMContentLoaded
document.addEventListener('DOMContentLoaded', initApp);






window.addEventListener('load', function() {
  // Suppression de l'appel redondant car updateDemoFrameSize() est déjà appelé dans DOMContentLoaded
});



      