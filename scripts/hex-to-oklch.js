// hex-to-oklch.js
import { parse, oklch } from 'culori';

function hexToOklch(hex) {
  const color = parse(hex);
  if (!color) return null;
  const oklchColor = oklch(color);
  if (!oklchColor) {
    console.error(`Conversion échouée pour ${hex}`);
    return null;
  }
  const { l, c, h } = oklchColor;
  // Format pour CSS : oklch(L% C H)
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h !== undefined ? h.toFixed(2) : '0'})`;
}

// Exemple d'utilisation :
console.log(hexToOklch('#ff0000'));
console.log(hexToOklch('#ffe500'));
console.log(hexToOklch('#7300ff'));
console.log(hexToOklch('#f3f3f3'));
console.log(hexToOklch('#252525')); 