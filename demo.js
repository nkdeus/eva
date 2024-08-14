
let body;

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



document.addEventListener('DOMContentLoaded', function() {

    
    randomTitle();
      
    body = document.querySelector('body');

    updateBodyClass();

    setInterval(updateBodyClass, 60000); 

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
          let angle = Math.ceil((self.progress * 360)*100)/100; 

          const poids = Math.ceil((400 + progress * 500)*100)/100; 
          document.documentElement.style.setProperty("--angle", angle.toString());
          nav.style.setProperty("--wght", poids.toString());
     
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