
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




document.addEventListener('DOMContentLoaded', function() {

      
    body = document.querySelector('body');

    updateBodyClass();

    setInterval(updateBodyClass, 60000); 


 gsap.registerPlugin(ScrollTrigger);

    gsap.to("body", {
      scrollTrigger: {
        trigger: "body", 
        start: "top top", 
        end: "bottom bottom", 
        scrub: true, 
        onUpdate: (self) => {
          const progress = self.progress; 
          const poids = 400 + progress * 500; 
          document.documentElement.style.setProperty("--wght", poids.toString());
     
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