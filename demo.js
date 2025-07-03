let body;
const updateAngle = true;
const darkModeByHour = false;

// Fonction pour récupérer les paramètres de l'URL
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
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
    
    // Si c'est theme-ghost ou theme-eva, ajouter une hue aléatoire
    if (themeParam === 'theme-ghost' || themeParam === 'theme-eva') {
      const randomHue = Math.floor(Math.random() * 360); // Génère une hue entre 0 et 359
      body.style.setProperty('--brand-hue', randomHue);
    } else {
      body.style.removeProperty('--brand-hue');
    }
  }
}

// Fonction pour appliquer une HUE aléatoire si theme-eva est présent
function applyRandomHueForEva() {
  if (body.classList.contains('theme-eva')) {
    const randomHue = Math.floor(Math.random() * 360); // Génère une hue entre 0 et 359
    body.style.setProperty('--brand-hue', randomHue);
  }
}


function isDayTime() {
  const maintenant = new Date();
  const heure = maintenant.getHours();
  return heure >= 7 && heure < 19; 
}


function updateBodyClass() {
  if (isDayTime()) {
    body.classList.remove('darkMode');
  } else {
    body.classList.add('darkMode');
  }
}


function randomTitle(){

       // Sélectionnez le titre h1
       const titleElement = document.querySelector('.title');

       // Obtenez le texte du titre
       const titleText = titleElement.textContent;

       // Fonction pour générer une classe aléatoire pour fwg
       function getRandomFwgClass() {
           const randomNum = Math.floor(Math.random() * 9) + 1; // Génère un nombre entre 1 et 9
           return `fwg-${randomNum}`;
       }

       // Fonction pour générer une classe aléatoire pour fwd
       function getRandomFwdClass() {
           const randomNum = Math.floor(Math.random() * 16) + 1; // Génère un nombre entre 1 et 16
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

const updateTheme = (e) => {
  if (e.matches) {
      //document.body.classList.add('dark');
  } else {
      //document.body.classList.remove('dark');
  }
};


document.addEventListener('DOMContentLoaded', function() {



    randomTitle();
      
    body = document.querySelector('body');
    
    // Appliquer le thème depuis l'URL
    applyThemeFromUrl();
    
    // Appliquer une HUE aléatoire si theme-eva est présent (même en dur)
    applyRandomHueForEva();

    if(darkModeByHour){
      updateBodyClass();
    }else{
    
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme)
    }


    const nav = document.getElementById('nav');
    gsap.registerPlugin(ScrollTrigger);

    gsap.to("body", {
      scrollTrigger: {
        trigger: "body", 
        start: "top top", 
        end: "bottom bottom", 
        scrub: true, 
        onUpdate: (self) => {
          const progress = self.progress; 

          if(updateAngle){

            let angle = Math.ceil((self.progress * 360)*100)/100; 
            nav.style.setProperty("--angle", angle.toString());
            
          }
     
        }
      }
    });


      const navItems = document.querySelectorAll('#nav-demo li');
      const demo = document.getElementById('demo');
      const demoLines = document.querySelectorAll('.demo-line code span');

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
  
  
    });




    document.addEventListener('DOMContentLoaded', function() {    

      const progress = document.querySelector('.progress');
      const sizeRange = document.getElementById('sizeRange');
      const sizeValue = document.getElementById('sizeValue');
      const demoFrame = document.getElementById('demoFrame');
      const container = document.querySelector('.demo-frame-container');
      
      const minWidth = 360;
      const maxWidth = 1920;
      // Ratios par appareil (width/height)
      const deviceRatios = {
        mobile: 16 / 28,     // Portrait mobile (16:28)
        foldable: 16 / 20,   // Foldable (16:20)
        tablet: 4 / 3,       // Tablet (4:3)
        laptop: 16 / 10,     // Laptop (16:10)
        desktop: 16 / 9      // Desktop (16:9)
      };
      
      // Variables pour gérer l'interaction manuelle
      let isManualInteraction = false;
      let interactionTimeout = null;
      
      // Toujours centrer la frame horizontalement
      demoFrame.style.position = 'absolute';
      demoFrame.style.left = '50%';
      demoFrame.style.top = '50%';
      demoFrame.style.transformOrigin = 'center center';
      
      // Fonction pour mettre à jour la ligne de progression
      function updateProgressBar(percentage) {
        const progressElement = document.querySelector('.progress');
        if (progressElement) {
          const barWidth = progressElement.offsetWidth;
          const thumbWidth = 32; // 2rem en px
          const width = (percentage / 100) * (barWidth - thumbWidth) + thumbWidth / 2;
          progressElement.style.setProperty('--progress-width', width + 'px');
        }
      }
      
      function getMaxWidth() {
        // Largeur du container moins un peu de marge
        return Math.min(1920, container.clientWidth - 40);
      }
      
      function getMaxHeight() {
        // Limite la hauteur à 90vh ou maxHeight, le plus petit des deux
        return Math.min(maxHeight, window.innerHeight * 0.9);
      }
      
      // Fonction pour ajuster la hauteur du container-frame
      function updateContainerHeight(frameHeight) {
          const containerFrame = document.querySelector('.container-frame');
          if (!containerFrame) return;
          
          // Récupérer le scale réellement appliqué depuis la transform
          const transform = demoFrame.style.transform;
          let scale = 1;
          if (transform && transform.includes('scale(')) {
              const scaleMatch = transform.match(/scale\(([^)]+)\)/);
              if (scaleMatch) {
                  scale = parseFloat(scaleMatch[1]);
              }
          }
          
          // Calculer la hauteur réelle de la frame après scale
          const scaledHeight = frameHeight * scale;
          
          // Calculer la hauteur nécessaire avec une marge adaptative
          const margin = Math.max(20, Math.min(50, scaledHeight * 0.1)); // Marge entre 20px et 50px, ou 10% de la hauteur scaled
          const newHeight = scaledHeight + margin;
          
          // Limiter la hauteur minimale et maximale de manière adaptative
          const adaptiveMinHeight = Math.max(200, scaledHeight + 20); // Minimum adaptatif basé sur la frame scaled
          const maxHeight = window.innerHeight * 0.9; // 90% de la hauteur de la fenêtre
          
          const finalHeight = Math.max(adaptiveMinHeight, Math.min(maxHeight, newHeight));
          
          containerFrame.style.height = finalHeight + 'px';
      }
      
      // Fonction pour ajuster le scale du demoFrame dynamiquement
      function adjustScale(currentWidth) {
          const viewportWidth = container.clientWidth;
          // On laisse 32px de marge pour éviter le clipping
          const availableWidth = viewportWidth - 32;
          let scale = 1;
          
          // Calculer le marginFactor basé sur la valeur actuelle du range
          const currentValue = sizeRange.value;
          const marginFactor = 0.6 + (currentValue / 100) * 0.3; // De 0.6 à 0.9
          
          if (currentWidth > availableWidth) {
              scale = (availableWidth / currentWidth) * marginFactor;
          } else {
              scale = marginFactor;
          }
          demoFrame.style.transform = `translateX(-50%) translateY(-50%) scale(${scale})`;
      }
      
      // Fonction pour calculer la valeur du range basée sur la largeur de la fenêtre
      function calculateRangeValue() {
        // Mappe la largeur de la fenêtre de 320 à 1920px sur 0 à 100%
        const w = window.innerWidth;
        let percent = ((w - minWidth) / (maxWidth - minWidth)) * 100;
        percent = Math.max(0, Math.min(100, percent));
        return percent;
      }
      
      function updateDemoFrameSize() {
          if (!demoFrame) {
            console.error('demoFrame introuvable !');
            return;
          }
          const containerW = container.clientWidth;
          // Si pas d'interaction manuelle, utiliser la valeur calculée automatiquement
          let currentValue;
          if (isManualInteraction) {
            currentValue = sizeRange.value;
          } else {
            currentValue = calculateRangeValue();
            sizeRange.value = currentValue;
          }
          // Mettre à jour l'affichage
          sizeValue.textContent = Math.round(currentValue) + '%';

          // Largeur cible de 360 à 1920px
          const t = currentValue / 100;
          const newWidth = minWidth + (maxWidth - minWidth) * t;
          
          // Déterminer le ratio approprié selon le pourcentage
          let ratio;
          if (currentValue <= 20) {
            ratio = deviceRatios.mobile;
          } else if (currentValue <= 40) {
            ratio = deviceRatios.foldable;
          } else if (currentValue <= 60) {
            ratio = deviceRatios.tablet;
          } else if (currentValue <= 80) {
            ratio = deviceRatios.laptop;
          } else {
            ratio = deviceRatios.desktop;
          }
          
          let newHeight = Math.round(newWidth / ratio);

          demoFrame.style.width = newWidth + 'px';
          demoFrame.style.height = newHeight + 'px';

          // Mettre à jour la ligne de progression
          updateProgressBar(currentValue);
          
          // Mettre à jour l'icône active
          updateDeviceIcon(currentValue);
          
          adjustScale(newWidth);
          
          // Ajuster la hauteur du container-frame
          updateContainerHeight(newHeight);
          
          // Mettre à jour la ligne de connexion
          updateConnectionLine();
      }
      
      // Fonction pour mettre à jour l'icône d'appareil active
      function updateDeviceIcon(percentage) {
        const deviceIcons = document.querySelectorAll('.device-icon');
        
        // Retirer la classe active de toutes les icônes et remettre _bg-brand__
        deviceIcons.forEach(icon => {
          icon.classList.remove('active');
          const indicator = icon.querySelector('.size-indicator');
          if (indicator) {
            indicator.classList.remove('_bg-front');
            indicator.classList.add('_bg-brand__');
          }
        });
        
        // Déterminer quelle icône doit être active basée sur le pourcentage
        let activeDevice = 'desktop'; // par défaut
        
        if (percentage <= 20) {
          activeDevice = 'mobile';
        } else if (percentage <= 40) {
          activeDevice = 'foldable';
        } else if (percentage <= 60) {
          activeDevice = 'tablet';
        } else if (percentage <= 80) {
          activeDevice = 'laptop';
        } else {
          activeDevice = 'desktop';
        }
        
        // Ajouter la classe active à l'icône correspondante et changer la classe de l'indicateur
        const activeIcon = document.querySelector(`[data-device="${activeDevice}"]`);
        if (activeIcon) {
          activeIcon.classList.add('active');
          const indicator = activeIcon.querySelector('.size-indicator');
          if (indicator) {
            indicator.classList.remove('_bg-brand__');
            indicator.classList.add('_bg-front');
          }
        }
        
        // Mettre à jour la ligne de connexion
        updateConnectionLine();
      }
      
      // Fonction pour calculer et mettre à jour la ligne de connexion
      function updateConnectionLine() {
        const activeIcon = document.querySelector('.device-icon.active');
        const sizeRange = document.getElementById('sizeRange');
        const connectionPath = document.getElementById('connectionPath');
        
        if (!activeIcon || !sizeRange || !connectionPath) return;
        
        // Obtenir les coordonnées du size-indicator actif
        const indicator = activeIcon.querySelector('.size-indicator');
        const iconRect = activeIcon.getBoundingClientRect();
        const indicatorRect = indicator.getBoundingClientRect();
        
        // Obtenir les coordonnées de l'input range
        const rangeRect = sizeRange.getBoundingClientRect();
        
        // Calculer les positions relatives au container
        const container = document.querySelector('.demo-frame-container');
        const containerRect = container.getBoundingClientRect();
        
        // Position du size-indicator (centre du cercle)
        const startX = indicatorRect.left + indicatorRect.width / 2 - containerRect.left;
        const startY = indicatorRect.top + indicatorRect.height / 2 - containerRect.top;
        
        // Position de l'input range (centre du thumb)
        const rangeProgress = (sizeRange.value - sizeRange.min) / (sizeRange.max - sizeRange.min);
        const thumbWidth = 32; // Largeur du thumb en pixels
        const rangeWidth = rangeRect.width - thumbWidth;
        const thumbX = rangeRect.left + (rangeProgress * rangeWidth) + (thumbWidth / 2) - containerRect.left;
        const thumbY = rangeRect.top + rangeRect.height / 2 - containerRect.top;
        
        // Créer une courbe de Bézier avec plus de courbure
        const controlPoint1X = startX + (thumbX - startX) * 0.2;
        const controlPoint1Y = startY + 40; // Part vers le bas
        const controlPoint2X = startX + (thumbX - startX) * 0.8;
        const controlPoint2Y = thumbY - 40; // Arrive en haut
        
        // Générer le path SVG
        const pathData = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${thumbX} ${thumbY}`;
        
        // Mettre à jour le path
        connectionPath.setAttribute('d', pathData);
      }
      
      // Fonction pour obtenir le pourcentage correspondant à un appareil
      function getPercentageForDevice(device) {
        switch(device) {
          case 'mobile':
            return 10; // Milieu de la plage 0-20%
          case 'foldable':
            return 30; // Milieu de la plage 21-40%
          case 'tablet':
            return 50; // Milieu de la plage 41-60%
          case 'laptop':
            return 70; // Milieu de la plage 61-80%
          case 'desktop':
            return 90; // Milieu de la plage 81-100%
          default:
            return 50;
        }
      }
      
      // Gestion des clics sur les icônes d'appareils
      function setupDeviceIconClicks() {
        const deviceIcons = document.querySelectorAll('.device-icon');
        
        deviceIcons.forEach(icon => {
          icon.addEventListener('click', function() {
            const device = this.getAttribute('data-device');
            const percentage = getPercentageForDevice(device);
            
            // Activer l'interaction manuelle
            isManualInteraction = true;
            
            // Mettre à jour le range
            sizeRange.value = percentage;
            
            // Mettre à jour l'affichage
            sizeValue.textContent = Math.round(percentage) + '%';
            
            // Calculer les nouvelles dimensions
            const t = percentage / 100;
            const newWidth = minWidth + (maxWidth - minWidth) * t;
            
            // Déterminer le ratio approprié selon le pourcentage
            let ratio;
            if (percentage <= 20) {
              ratio = deviceRatios.mobile;
            } else if (percentage <= 40) {
              ratio = deviceRatios.foldable;
            } else if (percentage <= 60) {
              ratio = deviceRatios.tablet;
            } else if (percentage <= 80) {
              ratio = deviceRatios.laptop;
            } else {
              ratio = deviceRatios.desktop;
            }
            
            let newHeight = Math.round(newWidth / ratio);
            
            // Mettre à jour la frame
            demoFrame.style.width = newWidth + 'px';
            demoFrame.style.height = newHeight + 'px';
            
            // Mettre à jour la ligne de progression
            updateProgressBar(percentage);
            
            // Mettre à jour l'icône active
            updateDeviceIcon(percentage);
            
            // Ajuster le scale
            adjustScale(newWidth);
            
            // Ajuster la hauteur du container-frame
            updateContainerHeight(newHeight);
            
            // Mettre à jour la ligne de connexion
            updateConnectionLine();
            
            // Centrer les flèches sur la frame
            centerArrowsOnFrame();
            
            // Réinitialiser l'interaction manuelle après 3 secondes
            if (interactionTimeout) {
              clearTimeout(interactionTimeout);
            }
            interactionTimeout = setTimeout(() => {
              isManualInteraction = false;
            }, 3000);
          });
        });
      }
      
      // Écouter les changements manuels du range
      sizeRange.addEventListener('input', function() {
          isManualInteraction = true;
          
          if (interactionTimeout) {
            clearTimeout(interactionTimeout);
          }
          
          // Réinitialiser l'interaction manuelle après 3 secondes
          interactionTimeout = setTimeout(() => {
            isManualInteraction = false;
          }, 3000);

          // Mise à jour immédiate
          const t = this.value / 100;
          const newWidth = minWidth + (maxWidth - minWidth) * t;
          
          // Déterminer le ratio approprié selon le pourcentage
          let ratio;
          if (this.value <= 20) {
            ratio = deviceRatios.mobile;
          } else if (this.value <= 40) {
            ratio = deviceRatios.foldable;
          } else if (this.value <= 60) {
            ratio = deviceRatios.tablet;
          } else if (this.value <= 80) {
            ratio = deviceRatios.laptop;
          } else {
            ratio = deviceRatios.desktop;
          }
          
          let newHeight = Math.round(newWidth / ratio);

          demoFrame.style.width = newWidth + 'px';
          demoFrame.style.height = newHeight + 'px';
          sizeValue.textContent = this.value + '%';
          
          // Mettre à jour la ligne de progression
          updateProgressBar(this.value);
          
          // Mettre à jour l'icône active
          updateDeviceIcon(this.value);
          
          // Appel direct au lieu de setTimeout
          adjustScale(newWidth);
          
          // Ajuster la hauteur du container-frame
          updateContainerHeight(newHeight);

          // Centrer les flèches sur la frame (avec debounce pour éviter les boucles)
          if (window.centerArrowsTimeout) {
            clearTimeout(window.centerArrowsTimeout);
          }
          window.centerArrowsTimeout = setTimeout(centerArrowsOnFrame, 50);
      });
      
          // Écouter le redimensionnement de la fenêtre avec debounce
    let resizeTimeout;
    let previousWindowWidth = window.innerWidth;
    window.addEventListener('resize', function() {
      const currentWindowWidth = window.innerWidth;
      
      // Vérifier si la largeur a réellement changé
      if (currentWindowWidth === previousWindowWidth) {
        return; // Sortir si la largeur n'a pas changé
      }
      
      // Mettre à jour la largeur précédente
      previousWindowWidth = currentWindowWidth;
      
      // Baisser l'opacité pendant le redimensionnement
      demoFrame.style.opacity = '0.3';
      
      // Annuler le timeout précédent
      clearTimeout(resizeTimeout);
      
      // Déclencher la fonction seulement après que l'utilisateur ait arrêté de redimensionner
      resizeTimeout = setTimeout(() => {
                  // Restaurer l'opacité normale
          demoFrame.style.opacity = '1';
          
          // Si pas d'interaction manuelle, recalculer automatiquement
          if (!isManualInteraction) {
            updateDemoFrameSize();
          }
          
          // Mettre à jour la ligne de connexion après redimensionnement
          updateConnectionLine();
      }, 150); // Délai de 150ms après la fin du redimensionnement
    });
      
      // Initialisation au chargement
      updateDemoFrameSize();
      
      // Configurer les clics sur les icônes d'appareils
      setupDeviceIconClicks();
    });

window.addEventListener('load', function() {
  // Suppression de l'appel redondant car updateDemoFrameSize() est déjà appelé dans DOMContentLoaded
});

// Navigation entre les sites
const sites = [
  { name: "EvaCSS", url: "./index.html?theme=theme-ghost" },
  { name: "SkipCall", url: "https://www.skipcall.io" },
  { name: "Side", url: "https://www.side.xyz" },
  { name: "Florian Ronzi", url: "https://qtradingtheory.com" },
  { name: "YesOrNo", url: "https://www.yesorno-jeu.fr" },
  { name: "Mia", url: "https://www.mia-app.co" }
];

let currentSiteIndex = 0;

// Fonction pour charger un site dans l'iframe
function loadSite(index) {
  // Gestion de la boucle : si index < 0, on va au dernier site
  if (index < 0) {
    index = sites.length - 1;
  }
  // Si index >= sites.length, on va au premier site
  else if (index >= sites.length) {
    index = 0;
  }
  
  currentSiteIndex = index;
  const iframe = document.getElementById('iframe');
  iframe.src = sites[index].url;
  
  // Mettre à jour l'état des boutons
  updateNavigationButtons();
}

// Fonction pour mettre à jour l'état des boutons de navigation
function updateNavigationButtons() {
  const prevBtn = document.getElementById('prevSite');
  const nextBtn = document.getElementById('nextSite');
  
  // Les boutons sont toujours actifs car la navigation boucle
  prevBtn.style.opacity = '1';
  prevBtn.style.cursor = 'pointer';
  nextBtn.style.opacity = '1';
  nextBtn.style.cursor = 'pointer';
}

// Ajouter les event listeners pour les boutons de navigation
document.addEventListener('DOMContentLoaded', function() {
  const prevBtn = document.getElementById('prevSite');
  const nextBtn = document.getElementById('nextSite');
  
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', function() {
      loadSite(currentSiteIndex - 1);
    });
    
    nextBtn.addEventListener('click', function() {
      loadSite(currentSiteIndex + 1);
    });
    
    // Initialiser l'état des boutons
    updateNavigationButtons();
  }
});

// Navigation au clavier (flèches gauche/droite)
document.addEventListener('keydown', function(event) {
  if (event.key === 'ArrowLeft') {
    loadSite(currentSiteIndex - 1);
  } else if (event.key === 'ArrowRight') {
    loadSite(currentSiteIndex + 1);
  }
});

function centerArrowsOnFrame() {
  const container = document.querySelector('.container-frame');
  const frame = document.getElementById('demoFrame');
  const prevBtn = document.getElementById('prevSite');
  const nextBtn = document.getElementById('nextSite');
  if (!container || !frame || !prevBtn || !nextBtn) return;

  const containerRect = container.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();

  // Calcul du centre Y de la frame par rapport au container
  const centerY = frameRect.top - containerRect.top + frameRect.height / 2;
  // Hauteur du bouton (50px)
  const btnHalf = 25;

  // Éviter les mises à jour inutiles
  const currentPrevTop = prevBtn.style.top;
  const currentNextTop = nextBtn.style.top;
  const newTop = (centerY - btnHalf) + 'px';
  
  if (currentPrevTop !== newTop) {
    prevBtn.style.top = newTop;
  }
  if (currentNextTop !== newTop) {
    nextBtn.style.top = newTop;
  }
}

// Debounce pour le resize
let arrowsResizeTimeout;
let previousArrowsWindowWidth = window.innerWidth;
window.addEventListener('resize', function() {
  const currentWindowWidth = window.innerWidth;
  
  // Vérifier si la largeur a réellement changé
  if (currentWindowWidth === previousArrowsWindowWidth) {
    return; // Sortir si la largeur n'a pas changé
  }
  
  // Mettre à jour la largeur précédente
  previousArrowsWindowWidth = currentWindowWidth;
  
  if (arrowsResizeTimeout) {
    clearTimeout(arrowsResizeTimeout);
  }
  arrowsResizeTimeout = setTimeout(centerArrowsOnFrame, 100);
});

document.addEventListener('DOMContentLoaded', centerArrowsOnFrame);
// Appel aussi après chaque resize de frame (si resize dynamique ailleurs)
setTimeout(centerArrowsOnFrame, 300);

// Charger automatiquement le premier site après 1 seconde
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    loadSite(0);
  }, 1000);
});



      