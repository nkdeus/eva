---
title: Dégradés
nav: Dégradés
group: system
eyebrow: Documentation
description: Des classes de dégradé composables — un applicateur qui dessine, des setters qui l'alimentent en couleurs, direction, zoom et animation.
---

Un dégradé, dans EVA, ce n'est pas une classe mais une petite pile : un **applicateur** qui le dessine, et des **setters** qui l'alimentent. Tout transite par trois custom properties, donc chaque partie peut être surchargée n'importe où.

```html
<body class="current-theme theme-eva all-grads">
  <div class="grad-linear from-brand to-accent d-br">…</div>
</body>
```

> Le conteneur doit porter `all-grads`. C'est cette classe qui déclare les trois variables ; sans elle, les applicateurs n'ont rien à lire.

## Les trois variables

| Variable | Défaut | Posée par |
|---|---|---|
| `--current-from-color` | `var(--brand)` | `from-*` |
| `--current-to-color` | `var(--accent)` | `to-*` |
| `--current-angle` | `90deg` | `d-*` et `a-*` |

Posez-les à la main quand le vocabulaire de classes ne suffit pas :

```css
.hero {
  --current-from-color: oklch(70% 0.2 300);
  --current-to-color: var(--extra___);
  --current-angle: 17deg;
}
```

## Applicateurs

| Classe | Dessine |
|---|---|
| `grad-linear` | Dégradé linéaire en fond |
| `grad-radial` | Dégradé radial depuis le centre |
| `grad-linear-text` | Dégradé linéaire découpé sur le texte |
| `grad-radial-text` | Dégradé radial découpé sur le texte |
| `grad-linear-border` | Dégradé linéaire en `border-image` |
| `grad-radial-border` | Dégradé radial en `border-image` |

Les variantes `-text` posent `background-clip: text` et un remplissage transparent. Les variantes `-border` passent par `border-image` : l'élément a donc besoin d'un `border-style` et d'un `border-width` pour que quoi que ce soit apparaisse.

## Setters de couleur

`from-*` et `to-*` acceptent tous les rôles de couleur et toutes leurs variantes — le même vocabulaire que le [système de couleurs](doc:colors#variants).

```html
<div class="grad-linear from-brand to-accent">…</div>
<div class="grad-linear from-brand_ to-extra-d">…</div>
<div class="grad-radial from-accent to-transparent">…</div>
```

| Motif | Exemple | Résultat |
|---|---|---|
| `from-<rôle>` | `from-brand` | Départ sur le rôle |
| `from-<rôle>_` | `from-brand_` | Départ à 65 % d'opacité |
| `from-<rôle>-d` | `from-extra-d` | Départ sur le cran assombri |
| `to-transparent` | `to-transparent` | Fondu sortant |
| `from-transparent` | `from-transparent` | Fondu entrant |

Comme les extrémités sont des variables de thème, un dégradé se recompose tout seul au changement de thème et en mode sombre. Rien à redéclarer.

## Direction

Huit raccourcis, et le contrôle d'angle complet au besoin.

| Classe | Direction |
|---|---|
| `d-t` | vers le haut |
| `d-b` | vers le bas |
| `d-l` | vers la gauche |
| `d-r` | vers la droite |
| `d-tl` | vers le haut-gauche |
| `d-tr` | vers le haut-droite |
| `d-bl` | vers le bas-gauche |
| `d-br` | vers le bas-droite |

`a-0` à `a-360` par pas de 5° — 73 classes : `a-45`, `a-90`, `a-135`, `a-215`, `a-360`.

```html
<h1 class="grad-linear-text from-brand to-accent a-135">En biais</h1>
```

> `d-*` et `a-*` déclarent tous les deux `--current-angle` en `!important`. N'en mettez pas deux sur le même élément — le gagnant est celui qui vient le plus tard dans la feuille de style, pas dans votre attribut `class`.

## Zoom et position

Agrandir la boîte du dégradé, c'est ce qui rend l'animation lisible — un dégradé à 100 % n'a nulle part où aller.

| Classe | `background-size` |
|---|---|
| `bg-size` | 150 % |
| `bg-size_` | 200 % |
| `bg-size__` | 300 % |

| Classe | `background-position` |
|---|---|
| `bg-center` | centre |
| `bg-top` / `bg-bottom` | haut / bas |
| `bg-left` / `bg-right` | gauche / droite |

## Animation

| Classe | Durée |
|---|---|
| `animated` | 3 s |
| `animated-slow` | 6 s |
| `animated-fast` | 1 s |

Les trois jouent les mêmes keyframes `gradient-shift`, qui déplacent la position du fond. Associez-les à une classe `bg-size*`, sinon rien ne semblera bouger.

```html
<div class="grad-radial from-extra to-transparent bg-size_ animated">…</div>
```

## Tout assembler

```html
<!-- diagonale, marque fondue vers un accent assombri -->
<div class="grad-linear from-brand_ to-accent-d d-br br-12 p-32">Carte</div>

<!-- titre en dégradé -->
<h1 class="grad-linear-text from-brand to-accent d-r fs-52">Texte en dégradé</h1>

<!-- halo radial animé lentement -->
<div class="grad-radial from-extra to-transparent bg-size__ animated-slow">Halo</div>

<!-- bordure en dégradé, noter le border-style -->
<div class="grad-linear-border from-brand to-extra" style="border: 2px solid">Encadré</div>
```

La page [Gradients](site:framework/gradients.html) propose tout le vocabulaire sous forme de terrain de jeu.

Suite : [Classes utilitaires](doc:utilities).
