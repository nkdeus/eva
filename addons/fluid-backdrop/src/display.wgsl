import { index_of } from "./fluid-common.wgsl";

struct DisplayConfig {
  output_size: vec2f,
  // Ajouts du labo : l'exposition du tonemap et la profondeur du vignetage,
  // qui etaient les constantes `1.35` et `0.32`, puis l'etage de filtrage.
  exposure: f32,
  vignette: f32,
  mode: u32,
  cell: f32,
  amount: f32,
  levels: f32,
  // 1 = la plaque noire d'origine, opaque. 0 = fond transparent : la teinture
  // sort en alpha premultiplie et se compose sur la couleur de la page, donc
  // sur le theme. Le canvas est deja configure en `premultiplied` par vgpu.
  plate: f32,
}
const DYE_SIZE = vec2u(512, 288);
@group(0) @binding(0) var<uniform> config: DisplayConfig;
@group(0) @binding(1) var<storage, read> dye: array<vec4f>;

fn sample_dye(p: vec2f) -> vec3f {
  let grid = clamp(p * vec2f(DYE_SIZE) - 0.5, vec2f(0), vec2f(DYE_SIZE) - 1.0);
  let cell = vec2i(floor(grid));
  let f = fract(grid);
  let bottom = mix(dye[index_of(cell, DYE_SIZE)].rgb, dye[index_of(cell + vec2i(1, 0), DYE_SIZE)].rgb, f.x);
  let top = mix(dye[index_of(cell + vec2i(0, 1), DYE_SIZE)].rgb, dye[index_of(cell + vec2i(1, 1), DYE_SIZE)].rgb, f.x);
  return mix(bottom, top, f.y);
}

fn luminance(c: vec3f) -> f32 {
  return dot(c, vec3f(0.2126, 0.7152, 0.0722));
}

fn tonemap(density: vec3f) -> vec3f {
  return 1.0 - exp(-density * config.exposure);
}

// Pavage hexagonal : deux grilles rectangulaires decalees d'une demi-cellule,
// on garde le centre le plus proche. C'est la version courte, suffisante pour
// une mosaique.
fn hex_center(p: vec2f) -> vec2f {
  let s = vec2f(1.0, 1.7320508);
  let a = (floor(p / s) + 0.5) * s;
  let b = (floor((p - s * 0.5) / s) + 0.5) * s + s * 0.5;
  return select(b, a, distance(p, a) < distance(p, b));
}

@fragment
fn fragment_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
  var uv = position.xy / config.output_size;
  uv.y = 1.0 - uv.y; // WebGPU fragment coordinates start at the top; the solver's +Y points up.

  // Combien de cellules tiennent dans la sortie, pour une cellule de `cell` px.
  let cells = max(config.output_size / max(config.cell, 1.0), vec2f(1.0));
  let plain = sample_dye(uv);
  var density = plain;
  var mask = 1.0;

  switch config.mode {
    // 1 — Pixels : on echantillonne au centre de la cellule.
    case 1u: {
      density = sample_dye((floor(uv * cells) + 0.5) / cells);
    }
    // 2 — Triangles : la diagonale coupe chaque cellule en deux, chaque moitie
    // prend la couleur de son centre de gravite.
    case 2u: {
      let g = uv * cells;
      let base = floor(g);
      let f = g - base;
      let centroid = select(vec2f(2.0 / 3.0), vec2f(1.0 / 3.0), f.x + f.y < 1.0);
      density = sample_dye((base + centroid) / cells);
    }
    // 3 — Hexagones.
    case 3u: {
      density = sample_dye(hex_center(uv * cells) / cells);
    }
    // 4 — Demi-teinte : un disque par cellule, dont le rayon suit la luminance.
    case 4u: {
      let g = uv * cells;
      let base = floor(g);
      let f = g - base - 0.5;
      density = sample_dye((base + 0.5) / cells);
      let radius = sqrt(clamp(luminance(tonemap(density)), 0.0, 1.0)) * 0.62;
      mask = 1.0 - smoothstep(radius - 0.08, radius + 0.02, length(f));
    }
    // 5 — Contours : gradient de luminance, teinte par la couleur locale.
    case 5u: {
      let d = max(config.cell, 1.0) / config.output_size;
      let gx = luminance(sample_dye(uv + vec2f(d.x, 0.0))) - luminance(sample_dye(uv - vec2f(d.x, 0.0)));
      let gy = luminance(sample_dye(uv + vec2f(0.0, d.y))) - luminance(sample_dye(uv - vec2f(0.0, d.y)));
      density = plain * clamp(length(vec2f(gx, gy)) * 6.0, 0.0, 4.0);
    }
    default: {}
  }

  var color = tonemap(density);

  // 6 — Lignes de balayage, 7 — Posterisation : ces deux-la travaillent apres
  // le tonemap, sur la couleur affichee, pas sur la densite.
  if (config.mode == 6u) {
    let period = 3.14159265 / max(config.cell, 1.0);
    color *= 0.55 + 0.45 * sin(uv.y * config.output_size.y * period);
  }
  if (config.mode == 7u) {
    let n = max(config.levels, 2.0);
    color = floor(color * n) / (n - 1.0);
  }

  color *= mask;
  // `amount` fond l'effet vers le rendu d'origine.
  color = mix(tonemap(plain), color, config.amount);

  let vignette = (1.0 - config.vignette)
    + config.vignette * pow(max(0.0, 1.0 - dot(uv - 0.5, uv - 0.5) * 1.9), 1.5);

  let lit = (vec3f(0.003, 0.005, 0.014) * config.plate + color) * vignette;
  // En premultiplie, le rouge/vert/bleu sont deja multiplies par l'alpha : il
  // faut donc alpha >= max(canal). Prendre le canal le plus fort donne
  // exactement « la lumiere de la teinture ajoutee au fond de la page ».
  let alpha = mix(max(max(lit.r, lit.g), lit.b), 1.0, config.plate);
  return vec4f(lit, clamp(alpha, 0.0, 1.0));
}
