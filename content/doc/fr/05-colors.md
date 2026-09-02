---
title: Couleurs
nav: Couleurs
group: system
eyebrow: Documentation
description: Cinq rôles, trois nombres chacun, et tout le reste recomposé en OKLCH — fondus d'opacité, crans de luminosité, réglage par rôle et mode sombre.
---

EVA ne stocke pas des couleurs. Il stocke **trois nombres par rôle** et recompose tout en OKLCH à l'exécution.

```text
5 rôles × { lightness, chroma, hue }
        ↓
--root-<rôle>              = "L C H"
--<rôle>                   = oklch(L C H)
--<rôle>_ __ ___           = mêmes L C H, à 65% / 35% / 15% d'opacité
--<rôle>-d -b -d_ -b_      = mêmes C H, lightness décalée
```

C'est OKLCH qui rend cela possible : l'espace est perceptuellement uniforme, donc décaler la lightness n'entraîne pas la teinte avec elle. Un orange assombri reste orange. Ce n'est pas vrai en HSL.

## Les cinq rôles {#the-five-roles}

| Rôle | Fonction | Lightness par défaut | Chroma par défaut | Hue par défaut |
|---|---|---|---|---|
| `brand` | Couleur principale | `80%` | `0` | `0` |
| `accent` | Couleur secondaire | `70%` | `0` | `0` |
| `extra` | Couleur tertiaire | `60%` | `0` | `0` |
| `dark` | L'encre | `var(--current-darkness)` | `0.05` | `var(--brand-hue)` |
| `light` | Le fond | `var(--current-lightness)` | `0.1` | `var(--brand-hue)` |

Les valeurs par défaut sont délibérément incolores — c'est le thème qui leur donne une valeur.

> `dark` et `light` héritent de `--brand-hue` et portent un petit chroma. L'encre et le fond sont donc **teintés par la marque**. C'est un choix de design, pas un oubli, et ça surprend : on change `--brand-hue` pour tester un bleu et tous les paragraphes virent avec. Pour s'en affranchir, mettez `--dark-chroma` et `--light-chroma` à `0`, ou posez `--dark-hue` et `--light-hue` explicitement.

## Variantes {#variants}

Chaque rôle produit huit variables. Deux axes indépendants : l'opacité et la luminosité.

| Variable | Signification |
|---|---|
| `var(--brand)` | Le rôle lui-même |
| `var(--brand_)` | 65 % d'opacité |
| `var(--brand__)` | 35 % d'opacité |
| `var(--brand___)` | 15 % d'opacité |
| `var(--brand-d)` | Un cran de contraste en plus |
| `var(--brand-b)` | Un cran de contraste en moins |
| `var(--brand-d_)` | Deux crans de contraste en plus |
| `var(--brand-b_)` | Deux crans de contraste en moins |

Le même schéma vaut pour `accent`, `extra`, `dark` et `light`.

> **Les deux axes ne se croisent pas.** Il n'existe pas de `--brand-d__` — pas de version à 35 % d'un cran de luminosité. Les fondus sont inlinés au build depuis `$fade-values` ; les crans sont recalculés à l'exécution depuis `--<rôle>-lightness`. C'est une limite connue du système, pas un trou de nommage.

## Crans de luminosité {#brightness-steps}

Chaque cran se calcule depuis la lightness du rôle, avec une seule formule :

```text
lightness = base + décalage absolu + (butée − base) × ratio
```

Quatre décalages globaux pilotent les quatre crans, et ils **s'inversent avec le mode** :

| Cran | Token | Mode clair | Mode sombre | Butée (clair) | Butée (sombre) |
|---|---|---|---|---|---|
| `-d` | `--darker` | `-5%` | `10%` | `0%` | `100%` |
| `-b` | `--brighter` | `10%` | `-5%` | `100%` | `0%` |
| `-d_` | `--darker_` | `-15%` | `30%` | `0%` | `100%` |
| `-b_` | `--brighter_` | `30%` | `-15%` | `100%` | `0%` |

Que `--darker` soit *positif* en mode sombre n'est pas un bug. En mode sombre, le rôle encre est clair (95 %), et `-d` veut dire « plus de contraste avec le fond », pas « plus sombre dans l'absolu ». Les crans décrivent une relation. C'est aussi pour cela que les butées s'échangent avec le mode.

### Réglage par rôle (2.4.0+)

Avant 2.4.0, ces quatre décalages étaient globaux : tous les rôles recevaient le même cran. Depuis 2.4.0, chaque rôle peut surcharger le sien, et chaque cran peut prendre une **part proportionnelle de la marge restante** au lieu d'un décalage fixe.

| Forme | Portée | Défaut | Rôle |
|---|---|---|---|
| `--<rôle>-<token>` | un rôle | *non défini* | remplace le décalage absolu global |
| `--<rôle>-<token>-ratio` | un rôle | `0` | part de la marge restante |
| `--<token>-ratio` | global | `0` | idem, pour les cinq rôles |
| `--<rôle>-<token>-bound` | un rôle | *non défini* | vise une autre butée |
| `--<token>-bound` | global | cf. tableau | la limite vers laquelle le cran pousse |

`<rôle>` vaut `brand`, `accent`, `extra`, `dark` ou `light`. `<token>` vaut `darker`, `brighter`, `darker_` ou `brighter_`.

**Pourquoi le ratio existe.** La lightness OKLCH est écrêtée à `0%–100%`. Avec `--light-lightness: 96.4%` :

```text
--light-b  = 96.4% + 10% = 106.4%  ->  100%
--light-b_ = 96.4% + 30% = 126.4%  ->  100%
```

Deux crans, une seule couleur. Et c'est symétrique : en mode sombre, `--dark-d` et `--dark-d_` s'effondrent ensemble sur le noir. Sur chaque neutre, dans chaque mode, deux des quatre crans étaient inutilisables — précisément sur `dark` et `light`, les deux rôles les plus sollicités.

Mesuré au navigateur, en lightness OKLCH, avant et après passage en proportionnel :

| | avant | après |
|---|---|---|
| `--light-b` (mode clair) | `1.0` | `0.9766` |
| `--light-b_` (mode clair) | `1.0` | `0.9892` |
| `--dark-d` (mode sombre) | `1.0` | `0.9675` |
| `--dark-d_` (mode sombre) | `1.0` | `0.985` |

### Recettes

Neutres resserrés, accent large — seul le cran nommé bouge, `--dark-b_` garde la valeur globale :

```css
.current-theme {
  --dark-darker:  -2%;
  --dark-brighter: 4%;
  --accent-brighter_: 12%;
}
```

Des crans qui ne saturent jamais — une part absolue à `0` rend le cran purement proportionnel, et il tient dans les deux modes :

```css
.current-theme {
  --light-brighter:  0%;  --light-brighter-ratio:  .35;
  --light-brighter_: 0%;  --light-brighter_-ratio: .7;
}
```

Les deux termes s'additionnent — un minimum garanti plus une part de ce qui reste :

```css
.current-theme {
  --dark-darker: -2%;
  --dark-darker-ratio: .3;
}
```

Ce sont de simples custom properties. Posez-les sur `.current-theme`, ou sur n'importe quel élément imbriqué portant aussi `.current-theme`, pour prévisualiser une variation sur place.

> Totalement rétrocompatible. Tant qu'un token par rôle n'est pas défini, le repli natif de `var()` retombe sur la valeur globale d'origine, et un ratio non posé vaut `0`, donc son terme s'annule. La montée de version ne change aucune valeur calculée.

## Thèmes {#themes}

Un thème est une classe CSS qui pose les triplets OKLCH. Rien d'autre.

```scss
.theme-monprojet {
  --brand-lightness: 62.8%;
  --brand-chroma: 0.258;
  --brand-hue: 29.23;

  --accent-lightness: 55%;
  --accent-chroma: 0.3;
  --accent-hue: 290;

  --extra-lightness: 62%;
  --extra-chroma: 0.12;
  --extra-hue: 25;

  --light-chroma: 0.005;
  --light-hue: 120;
  --dark-chroma: 0.012;
  --dark-hue: 125;
}
```

```html
<body class="current-theme theme-monprojet">
```

Convertissez votre palette HEX existante avec la [CLI eva-color](doc:cli#convert) :

```bash
npx eva-color convert "#2f6d3b"
# -> oklch(43.3% 0.103 142.5)
```

### Plusieurs thèmes à la fois

Déclarez autant de blocs `.theme-<nom>` que nécessaire et échangez la classe. Palettes saisonnières, variantes de marque, thèmes par client — c'est le même mécanisme.

```scss
.theme-mai {
  --brand-lightness: 70%;  --brand-chroma: 0.09;  --brand-hue: 125;
  --accent-lightness: 78%; --accent-chroma: 0.08; --accent-hue: 80;
  --extra-lightness: 62%;  --extra-chroma: 0.12;  --extra-hue: 25;
  --light-chroma: 0.005;   --light-hue: 120;
  --dark-chroma: 0.012;    --dark-hue: 125;
}

.theme-decembre { /* bleus froids */ }
```

```js
function applyTheme(name) {
  const root = document.documentElement;
  root.classList.add('current-theme');
  for (const t of ALL_THEMES) root.classList.remove('theme-' + t);
  root.classList.add('theme-' + name);
}
```

Deux choses à savoir :

- **Une seule source de vérité par thème.** Ne posez que les triplets. Ne redéclarez jamais `--brand` lui-même ; laissez EVA le dériver.
- **Les échantillons de prévisualisation s'isolent proprement.** Pour montrer la couleur d'un thème non actif, enveloppez l'échantillon dans `<div class="current-theme theme-decembre">` et `background: var(--brand)` résout la couleur de ce thème à l'intérieur de la carte, quel que soit le thème de la page.

Gardez `--light-chroma` bas — autour de `0.005` à `0.015`. Au-delà, ça se lit comme saturé et ça casse l'effet de surface neutre.

## Mode sombre {#dark-mode}

EVA livre le mode sombre. N'en construisez pas un vôtre à coups de classes `.dark` et de surcharges HEX.

Deux variables décident du mode, et c'est le seul endroit où il est décidé :

| Variable | Clair | Sombre |
|---|---|---|
| `--current-lightness` | `96.4%` | `5%` |
| `--current-darkness` | `6.4%` | `95%` |

`light` lit la première, `dark` lit la seconde. Ajouter `.toggle-theme` les échange :

```css
.current-theme.toggle-theme {
  --current-lightness: 5%;
  --current-darkness: 95%;
  --dark-lightness:  var(--current-darkness)  !important;
  --light-lightness: var(--current-lightness) !important;
  --darker: 10%;  --brighter: -5%;
  --darker_: 30%; --brighter_: -15%;
  --darker-bound: 100%;  --brighter-bound: 0%;
  --darker_-bound: 100%; --brighter_-bound: 0%;
}
```

`var(--light)` est clair en mode clair et sombre en mode sombre. `var(--dark)` fait l'inverse. Les deux rôles s'échangent littéralement — c'est toute l'astuce, et c'est pour cela qu'aucune couleur n'a besoin d'être redéfinie.

```html
<body class="current-theme theme-monprojet toggle-theme">
```

```js
function applyMode(mode) {
  const root = document.documentElement;
  const dark = mode === 'dark'
    || (mode === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('toggle-theme', dark);
}

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (currentMode === 'auto') applyMode('auto');
});
```

> Le `!important` sur les deux lignes de lightness signifie que les `--dark-lightness` et `--light-lightness` configurés dans un thème sont **écrasés en mode sombre**. Seuls la hue et le chroma de `dark` et `light` survivent à la bascule. C'est voulu — c'est ce qui garantit le contraste — mais ça surprend ceux qui ont réglé ces valeurs par thème.

### Faire le pont avec vos tokens sémantiques

Si votre base de code a déjà `--color-bg`, `--color-text` et compagnie, aliasez-les sur EVA plutôt que de les remplacer. Ils basculent alors avec `.toggle-theme` et restent teintés par le thème actif, gratuitement.

```scss
.current-theme {
  --color-bg: var(--light);
  --color-surface: oklch(100% var(--light-chroma) var(--light-hue));
  --color-surface-alt: oklch(96% var(--light-chroma) var(--light-hue));

  --color-text: var(--dark);
  --color-text-muted: var(--dark_);
  --color-text-subtle: var(--dark__);
  --color-border: var(--dark___);

  --color-primary: var(--brand);
  --color-primary-ink: var(--brand-d);
  --color-primary-tint: var(--brand___);
}

// Les surfaces figées sur des lightness littérales ne suivent pas
// --current-lightness : il faut les reposer pour le mode sombre.
.current-theme.toggle-theme {
  --color-surface: oklch(8% var(--light-chroma) var(--light-hue));
  --color-surface-alt: oklch(12% var(--light-chroma) var(--light-hue));
}
```

Si l'application démarre côté client et applique les classes de thème après le montage, gardez un repli statique `:root { --color-bg: #fafaf7; }` pour éviter un flash de contenu non thémé au premier rendu.

## Classes utilitaires de couleur

Avec `$build-class: true`, EVA émet 200 classes de couleur — cinq propriétés × cinq rôles × huit variantes.

| Préfixe | Propriété |
|---|---|
| `._c-` | `color` |
| `._bg-` | `background` |
| `._bc-` | `border-color` |
| `._f-` | `fill` (s'applique aussi aux `path` descendants) |
| `._s-` | `stroke` |

```html
<body class="current-theme theme-monprojet _bg-light _c-dark_">
  <span class="_c-brand-d">Texte de marque très contrasté</span>
  <svg class="_f-accent">…</svg>
</body>
```

Les pages [Colors](site:framework/colors.html) et [Auto theme](site:framework/auto-theme.html) permettent de faire glisser la teinte et de voir les 200 se mettre à jour en direct.

Suite : [Dégradés](doc:gradients).
