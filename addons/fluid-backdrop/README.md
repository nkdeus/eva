# Fluid Backdrop — source de l'addon

Le fond WebGPU d'EVA CSS : une simulation de fluide dont l'encre vient de
`--brand` et `--accent`, avec un étage de filtres et une configuration
exportable.

- **Page publique** — `src/framework/fluid-backdrop.html` → `/framework/fluid-backdrop.html`
- **Moteur** — ce dossier, compilé vers `assets/fluid-backdrop.js`
- **Interface et persistance** — `fluid-backdrop.js`, à la racine
- **Styles** — `styles/custom/_fluid-backdrop.scss`
- **Fond de page** — `src/index.html`, calque `.page-backdrop`
- **Bloc de présentation** — `src/framework.html`, carte `.fb-promo` : l'aperçu
  n'est pas une image, c'est l'addon lui-même qui tourne derrière le texte

## Origine et licence

Le solveur et ses shaders viennent de l'exemple
[Interactive Fluid](https://vgpu.sh/examples/fluid) de
[`vercel-labs/vgpu`](https://github.com/vercel-labs/vgpu) — **MIT, © 2025 Vercel,
Inc.** Le texte complet de la licence est conservé ici, dans `LICENSE.vgpu`.

Le paquet npm `vgpu` (MIT lui aussi) est la seule dépendance d'exécution ; elle
est bundlée dans `assets/fluid-backdrop.js`.

## Compiler

```bash
cd addons/fluid-backdrop
npm install
npm run build     # → assets/fluid-backdrop.js
npm run serve     # sert la racine du dépôt sur http://localhost:4399
```

Le bundle est commité : `npm run build` du site ne le régénère pas. Après une
modification de `src/`, relancer `npm run build` ici.

WebGPU réclame un contexte sécurisé : passer par `localhost`, pas par `file://`.

## Ce qui vient de vgpu, et ce qui a été changé

| Fichier | État |
|---|---|
| `src/pointer-input.ts` | option `surface` : écouter ailleurs que sur le canvas |
| `src/curl.wgsl`, `divergence.wgsl`, `pressure.wgsl`, `project.wgsl` | intacts |
| `src/fluid-common.wgsl` | struct `Input` étendu |
| `src/advect-dye.wgsl`, `advect-velocity.wgsl` | constantes → uniformes, amplitude des émetteurs |
| `src/vorticity.wgsl` | uniforme `params` ajouté (binding 4) |
| `src/display.wgsl` | exposition, vignetage, étage de filtrage, plaque de fond |
| `src/simulation.ts` | `FluidSettings`, `setFluidSettings`, `normalizeSettings` |
| `src/renderer.ts` | expose `setSettings` |
| `src/mount.ts` | remplace `index.tsx` (React) |

`index.tsx` faisait 22 lignes et ne servait qu'à monter un canvas dans un
`useEffect`. `mount.ts` fait la même chose sans React, plus les trois garde-fous
qu'une page publique réclame : support WebGPU, pause hors-écran,
`prefers-reduced-motion`.

## L'API

```js
var controller = EvaFluid.mountFluid(canvas, {
  settings: { plate: 0, filter: 1, filterCell: 16 },
  pauseOffscreen: true,        // défaut
  respectReducedMotion: true,  // défaut
  onStatus: function (s) { /* running | paused | unsupported | reduced-motion | failed */ },
});
controller.start();
controller.setSettings({ vorticity: 30 });
controller.destroy();
```

`EvaFluid` expose aussi `DEFAULT_SETTINGS`, `FILTERS`, `isSupported()`,
`prefersReducedMotion()` et `normalizeSettings(objet)` — ce dernier filtre un
JSON quelconque en un patch sûr : clés inconnues écartées, valeurs bornées, ne
jette jamais. C'est ce qui rend l'import de la page d'addon inoffensif.

**Une surface par canvas.** vgpu refuse un second `mountFluid` sur le même
canvas. Le fond du hero garde donc sa poignée sur `window.evaHeroBackdrop`.

## Les réglages

Les valeurs par défaut sont exactement les constantes de l'exemple d'origine :
repartir de `DEFAULT_SETTINGS` redonne le rendu de vgpu.sh.

| Clé | Constante d'origine | Où |
|---|---|---|
| `vorticity` | `20.0` | `vorticity.wgsl` |
| `dyeDissipation` | `0.97` | `advect-dye.wgsl` |
| `velocityDissipation` | `0.98` | `advect-velocity.wgsl` |
| `pointerForce` | `0.8` | `advect-velocity.wgsl` |
| `splatRadius` | `0.002` | les deux advections |
| `ink` | `0.35` | `advect-dye.wgsl` |
| `emitterGain` | — | nouveau, `0` fige le fluide au repos |
| `emitterSpread` | — | nouveau, dilate l'orbite des émetteurs |
| `pressureIterations` | `3` | boucle JS de `stepFluid` |
| `exposure` | `1.35` | `display.wgsl` |
| `vignette` | `0.32` | `display.wgsl` |
| `plate` | — | nouveau, voir ci-dessous |
| `filter`, `filterCell`, `filterAmount`, `filterLevels` | — | nouveaux |
| `colorA`, `colorB` | couleurs en dur | sRGB 0..1, ou hex à l'import |

### L'amplitude des émetteurs

Les deux sources qui brassent le fluide au repos suivent un chemin de Lissajous
centré. À l'amplitude d'origine (`emitterSpread: 1`) elles balaient 0,22 à 0,78
du cadre : **les bords ne sont jamais ensemencés**, et un fond de page reste vide
dans ses coins. Mesuré sur le hero, 18 s au repos : 25 % de la surface couverte,
alpha moyen 22 sur 255.

`emitterSpread: 1.5` — avec une rémanence d'encre portée à 0,995 — monte à **79 %
de couverture, alpha moyen 87**, sans un seul quartier vide.

L'amplitude vit à deux endroits qui doivent rester d'accord : la position des
sources, en JS dans `idleEmitters()`, et la tangente de ce même chemin, dans
`advect-velocity.wgsl`, qui donne la vitesse injectée. Le même facteur multiplie
les deux — sinon la vitesse ne correspond plus au déplacement de la source.

### La plaque de fond

`plate: 1` est le rendu d'origine : une plaque quasi noire, opaque. `plate: 0`
la retire et sort la teinture en **alpha prémultiplié** — le canvas est déjà
configuré ainsi par vgpu — donc la couleur se compose sur le fond de la page.
C'est ce qui rend l'effet solidaire du thème, en clair comme en sombre, plutôt
que posé dessus. C'est le mode qu'utilise le fond de page.

**En fond de page, `plate: 1` n'est pas une option.** La plaque repeint l'écran
entier en quasi-noir : mesuré à 15/255 de luminance, contre un texte de thème
clair à `oklch(0.064 …)`. Le texte disparaît. Sur le banc d'essai la plaque est
légitime — c'est le fond de la scène, pas celui de la page.

### Les filtres

Un étage de post-traitement dans `display.wgsl`, qui était déjà le passage
fragment couvrant l'écran : le filtrage ne coûte donc aucune passe
supplémentaire.

| Filtre | Principe |
|---|---|
| Pixels | échantillonne au centre de la cellule |
| Triangles | la diagonale coupe la cellule en deux, chaque moitié prend la couleur de son centre de gravité |
| Hexagones | deux grilles décalées d'une demi-cellule, on garde le centre le plus proche |
| Demi-teinte | un disque par cellule, rayon ∝ luminance |
| Contours | gradient de luminance, teinté par la couleur locale |
| Balayage | modulation sinusoïdale sur Y, après le tonemap |
| Postérisation | quantification de la couleur en N paliers |

Les cinq premiers agissent sur l'échantillonnage, avant le tonemap ; les deux
derniers sur la couleur affichée, après.

## Les quatre surprises du portage

**1. Les `.wgsl` ne sont pas du texte.** Ils ont leur propre `import { … } from
"./fluid-common.wgsl"`, résolu au build. Un `--loader:.wgsl=text` d'esbuild
donne `reflectSource() accepts a single raw WGSL string`. vgpu livre un plugin
Vite et un loader Webpack, pas de plugin esbuild — mais `transformWgsl` est
exporté depuis `@vgpu/wgsl/loader-vite`, donc le plugin tient en dix lignes.
Voir `build.mjs`.

**2. `"gpu" in navigator` ne suffit pas.** La propriété peut exister et valoir
`undefined`. Et même truthy, `init()` échoue encore quand aucun adaptateur n'est
disponible : GPU sur liste noire, machine virtuelle, Linux sans flag. En
production, `failed` doit retomber sur le même repli visuel que `unsupported`.

**3. `set({ config })` remplace l'uniforme entier.** La taille de sortie et les
réglages d'affichage doivent donc partir ensemble, sinon le dernier appel remet
l'autre à zéro. D'où `writeDisplayConfig`.

**4. `main.css` amène ses règles d'élément.** Charger la feuille du site sur une
page nue applique aussi ce qui vise les balises — `section { padding-bottom:
var(--156); z-index: 20 }`, `p { width: 100%; max-width: var(--576) }`, et
`.flex.y { align-items: flex-start }` qui empêche les champs d'occuper la
largeur de leur colonne. Sans rapport avec vgpu, mais à savoir.

## Le pointeur sur un fond de page

Un canvas de fond est sous le contenu : le titre, les liens et tout ce qui passe
au-dessus interceptent le pointeur avant lui, et le fluide se fige dès qu'on
survole un texte. `installStirInput` accepte donc une `surface` : l'élément qui
écoute, à la place du canvas. Le fond de page écoute sur le `body`, où les
événements remontent depuis tous les enfants — le geste porte alors sur la page
entière, texte compris, à n'importe quelle position de défilement puisque le
calque est fixe.

Une surface étrangère est seulement **observée** : ni `setPointerCapture`, ni
`touch-action`, ni `preventDefault`. Elle porte aussi les liens de la page et
son défilement, qui doivent continuer de fonctionner. Le canvas, lui, passe en
`pointer-events: none` : il ne peut plus rien intercepter.

## La scène collante

La scène est en `position: sticky` : elle reste sous les yeux pendant qu'on
parcourt les réglages. Deux obstacles ont dû tomber pour ça.

**`eva-css-fluid` pose sur le body `overflow: auto` *et* `container-type:
inline-size`.** La containment empêche la propagation de l'overflow au viewport,
donc le body devient un vrai conteneur de défilement — et `position: sticky` n'a
plus de prise à l'intérieur. On lève l'overflow (`body.fb-page`), pas la
containment : le site a dix règles `@container` qui en dépendent.

**`app.js` reposait `document.body.style.overflow = 'auto'` en style inline** à
chaque fermeture du menu burger — et un `resize` déclenche cette fermeture. Le
style inline écrasait la règle de page à la première variation de largeur.
Corrigé à la source : la fermeture retire la surcharge (`removeProperty`) au
lieu de décider d'une valeur à la place de la feuille de style. Le comportement
des autres pages est inchangé, puisque la valeur qui revient est celle du
framework.

Sous le repli une colonne, chaque élément occupe sa propre rangée : la zone de
grille fait exactement la hauteur de la scène, `sticky` n'a aucune course et
l'effet s'annule de lui-même — ce qui est le bon comportement sur mobile.

## Mesuré

- **Bundle** : ~210 kB minifié, **~64 kB gzip**, vgpu compris. Les 6 Mo du
  paquet npm sont l'adaptateur Node et le serveur MCP ; rien de tout ça n'entre
  dans le bundle navigateur.
- **60 fps** en plein écran, canvas 2854 × 985 (dpr plafonné à 2 par `surface()`).
- **Pause hors-écran**, `reduced-motion`, WebGPU absent, échec renderer : les
  quatre chemins vérifiés.
- **Filtres** vérifiés en lisant les pixels : chacun déplace la sortie de façon
  caractéristique.
- **Configuration** vérifiée de bout en bout : enregistrement, restitution au
  rechargement, export, et import d'un JSON volontairement sale (clés inconnues
  écartées, valeurs hors bornes ramenées, types invalides ignorés).

Note pour toute mesure automatisée : dans un onglet en arrière-plan, Chrome ne
tire aucun `requestAnimationFrame` et bride `setTimeout` à 1 Hz. Le canvas reste
vide et le compteur affiche `0 fps` — ce n'est pas une panne.
