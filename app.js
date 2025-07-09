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
  const titleElement = document.querySelector('.title');
  if (!titleElement) return;

  const titleText = titleElement.textContent;

  // Fonction pour générer une classe aléatoire pour fwg
  function getRandomFwgClass() {
    const randomNum = Math.floor(Math.random() * 9) + 1;
    return `fwg-${randomNum}`;
  }

  // Fonction pour générer une classe aléatoire pour fwd
  function getRandomFwdClass() {
    const randomNum = Math.floor(Math.random() * 16) + 1;
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
}

// Fonction pour mettre à jour le thème selon les préférences système
function updateTheme(e) {
  if (e.matches) {
    // document.body.classList.add('dark');
  } else {
    // document.body.classList.remove('dark');
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
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);
  }

  // Initialiser les animations GSAP
  initGSAPAnimations();

  // Initialiser la navigation de démonstration
  initDemoNavigation();

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



      