// Configuration des sites à afficher dans l'iframe
const sitesConfig = [
  { name: "Mon Site", url: "./index.html" },
  { name: "EvaCSS", url: "https://eva-css.netlify.app" },
  { name: "SkipCall", url: "https://www.skipcall.io" },
  { name: "Side", url: "https://www.side.xyz" },
  { name: "Florian Ronzi", url: "https://qtradingtheory.com" },
  { name: "YesOrNo", url: "https://www.yesorno-jeu.fr" },
  { name: "Mia", url: "https://www.mia-app.co" }
];

// Exporter pour utilisation dans demo.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = sitesConfig;
} else {
  window.sitesConfig = sitesConfig;
} 