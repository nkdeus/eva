---
title: Tailles fluides
nav: Tailles fluides
group: system
eyebrow: Documentation
description: Les quatre variantes d'échelle, l'espace de noms séparé des tailles de texte, et comment faire suivre un sous-arbre à son conteneur plutôt qu'au viewport.
---

Chaque valeur de `$sizes` devient quatre custom properties CSS. Chaque valeur de `$font-sizes` en devient trois, sous un préfixe distinct. Aucune n'est un nombre figé : chacune est un `clamp()` qui interpole entre un plancher et un plafond à mesure que le viewport s'élargit.

```css
--16__: clamp(0.5rem,  calc(1.58 * var(--eva-fluid-unit, 1vw) - 0.56rem), 1.11rem);
--16_:  clamp(0.35rem, calc(0.83 * var(--eva-fluid-unit, 1vw) + 0.25rem), 1.11rem);
--16:   clamp(0.56rem, calc(0.56 * var(--eva-fluid-unit, 1vw) + 0.5rem),  1.11rem);
--16-:  clamp(0.91rem, calc(0.28 * var(--eva-fluid-unit, 1vw) + 0.75rem), 1.11rem);
```

Les quatre culminent au même plafond. Ce qui les sépare, c'est la vitesse à laquelle elles y arrivent — et donc leur petitesse sur un téléphone.

## Les quatre variantes

| Token | Comportement | À utiliser pour |
|---|---|---|
| `var(--N__)` | S'effondre le plus fort sur petit écran | Espace décoratif, qui peut disparaître |
| `var(--N_)` | Forte réduction | Espacements secondaires |
| `var(--N)` | Échelle standard | Le défaut — dimensions de mise en page |
| `var(--N-)` | Conservatrice : le plancher reste proche de la valeur de maquette | Paddings et gaps qui doivent rester respirables sur mobile |

Mesuré, pour un `$sizes` contenant `16`, avec une taille de police racine de 16px :

| Token | 375px | 768px | 1440px | 1920px |
|---|---|---|---|---|
| `--16__` | 8.0px | 8.0px | 13.8px | 17.8px |
| `--16_` | 7.1px | 10.4px | 16.0px | 17.8px |
| `--16` | 10.1px | 12.3px | 16.1px | 17.8px |
| `--16-` | 14.6px | 14.6px | 16.0px | 17.4px |

Lisez la première colonne, pas la troisième : en largeur desktop toutes les variantes retombent sur la valeur de maquette, donc le choix porte entièrement sur ce qui se passe sur un téléphone. `--16__` y rend 8px d'espace ; `--16-` en garde 14,6.

> Un défaut qui marche : `var(--N)` pour les largeurs, hauteurs et dimensions de mise en page, `var(--N-)` pour les paddings et gaps à l'intérieur des composants. Un espacement mobile à l'étroit est presque toujours un `var(--N)` qui aurait dû être un `var(--N-)`.

La règle se généralise : plus il y a de caractères de suffixe, plus l'effondrement est marqué. `--32__` se comporte vis-à-vis de `--32` exactement comme `--16__` vis-à-vis de `--16`.

## Les tailles de texte sont un espace de noms séparé {#font-sizes}

C'est de loin la confusion la plus fréquente. Les tokens de texte portent un préfixe `fs-` et vivent dans leur propre liste.

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 32),          // -> var(--16)
  $font-sizes: (14, 16, 24)        // -> var(--fs-16)
);
```

| Liste | Tokens émis |
|---|---|
| `$sizes` | `--N__`, `--N_`, `--N`, `--N-` |
| `$font-sizes` | `--fs-N__`, `--fs-N_`, `--fs-N` |

Le même nombre dans les deux listes produit deux tokens différents, qui ne clampent pas pareil. `44` dans `$font-sizes` vous donne `var(--fs-44)` et aucun `var(--44)` — et une custom property indéfinie ne résout à rien, donc la déclaration est silencieusement abandonnée et le navigateur garde sa valeur par défaut. Rien n'échoue ; la page est juste légèrement fausse.

Les tailles de texte ont trois variantes au lieu de quatre, et l'échelle est décalée d'un cran vers la prudence :

| Token | 375px | 768px | 1440px | 1920px |
|---|---|---|---|---|
| `--fs-16__` | 7.1px | 10.4px | 16.0px | 17.8px |
| `--fs-16_` | 10.1px | 12.3px | 16.1px | 17.8px |
| `--fs-16` | 13.1px | 14.2px | 16.0px | 17.4px |

`var(--fs-16)` rend 13,1px sur un écran de 375px — lisible. `var(--fs-16__)` rend 7,1px, ce qui n'est pas du texte courant. Utilisez la variante sans suffixe pour tout ce qu'un lecteur doit lire, et gardez `_` et `__` pour les grandes tailles d'affichage, qui ont de la marge.

## Unité fluide : viewport ou conteneur {#fluid-unit}

Depuis 2.2.0, l'unité n'est plus figée dans le `clamp()` compilé. Chaque token multiplie une custom property, `--eva-fluid-unit`, dont le défaut est `1vw`. Surchargez-la sur n'importe quel élément et ce sous-arbre change de référence — sans rebuild, sans seconde feuille de style.

```css
.card {
  container-type: inline-size;   /* la carte devient un conteneur de taille */
  --eva-fluid-unit: 1cqi;        /* les tokens EVA à l'intérieur lisent sa largeur */
}
```

Deux classes utilitaires font les deux moitiés d'un coup, pour ne pas en oublier une :

| Classe | Effet |
|---|---|
| `.eva-cqi` | `container-type: inline-size` + `--eva-fluid-unit: 1cqi` sur l'élément |
| `.eva-root` | Idem, prévue pour un conteneur de premier niveau |

Passez à `cqi` quand la taille d'un composant doit suivre la boîte où il est posé plutôt que la page — une carte qui doit être identique dans un hero pleine largeur et dans une sidebar étroite, un panneau de prévisualisation de design system, un widget embarqué à une largeur inconnue. Gardez `vw` par défaut pour la typographie et les espacements de page, qui doivent réellement répondre au viewport entier.

Le défaut projet se règle en SCSS :

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 24, 48),
  $font-sizes: (16, 24, 48),
  $unit-fluid: 1cqi        // tous les tokens suivent leur conteneur par défaut
);
```

> `$fluid-runtime: false` revient à la sortie littérale d'avant 2.2.0, octet pour octet. Utile seulement pour comparer avec un ancien build — cela supprime la possibilité de changer d'unité à l'exécution.

## Plancher d'accessibilité

`$min-font-size` relève la borne basse de chaque clamp de font-size. Il s'exprime en px et se convertit en rem, donc il continue de suivre le zoom du navigateur.

```scss
@use 'eva-css-fluid' with (
  $sizes: (4, 8, 16, 32),
  $font-sizes: (14, 16, 24, 36),
  $min-font-size: 14
);
```

Ce plancher est la taille *mobile*, pas la taille desktop. 13–14 est une valeur saine. À 16, l'échelle s'aplatit : chaque token démarrerait à son plafond et cesserait d'être fluide. Le défaut est `0`, qui désactive le plancher.

## Largeur de référence

`$reference-width` (défaut `1440`) est le viewport auquel les tokens atteignent leur valeur de maquette. Abaissez-le pour un design dessiné en 1280, montez-le pour un design en 1920 — toute l'échelle se décale avec lui.

## Contreparties statiques

Avec `$px-rem-suffix: true`, chaque taille émet aussi une paire figée :

```css
--16-px:  16px;
--16-rem: 1rem;
```

Deux usages : comparer une valeur fluide à sa référence de maquette dans les devtools, et le petit ensemble de dimensions qui ne doivent pas s'adapter — épaisseurs de bordure, cibles tactiles, rayons en pilule. Pour celles-là, un `48px` littéral fait aussi bien l'affaire et dit plus clairement ce qu'il veut.

## Vérifier son échelle

On ne peut pas lire un `clamp()` et deviner ce qu'il donne. Fabriquez une page jetable qui rend chaque token dans chaque variante sous forme de carré réel, et redimensionnez le navigateur.

```html
<div class="probe">
  <div style="width: var(--16__); height: var(--16__)"></div>
  <div style="width: var(--16_);  height: var(--16_)"></div>
  <div style="width: var(--16);   height: var(--16)"></div>
  <div style="width: var(--16-);  height: var(--16-)"></div>
</div>
```

```js
// valeur réelle au viewport courant
getComputedStyle(document.querySelector('.probe')).getPropertyValue('--16');
```

Une chaîne vide signifie que le token n'existe pas — soit la taille manque dans `$sizes`, soit vous avez demandé un token de dimension alors que vous vouliez `--fs-`. Ce contrôle attrape la plupart des erreurs de configuration en quelques secondes.

Les pages [Fluid CSS](site:framework/css-fluid.html) et [Sizes](site:framework/sizes.html) font exactement cette expérience en direct, si vous préférez redimensionner une fenêtre plutôt qu'en construire une.

Suite : [Couleurs](doc:colors).
