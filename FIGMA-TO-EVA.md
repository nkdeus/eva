# Figma to EVA CSS Workflow

Guide pour créer un projet EVA CSS à partir d'un design Figma via MCP.

## Prérequis

### Figma MCP Server (Officiel)

Utiliser le **serveur MCP officiel Figma** (pas `figma-developer-mcp` qui est limité).

**Option Desktop (recommandé):**
1. Ouvrir Figma Desktop
2. Ouvrir le fichier Design
3. Activer Dev Mode (Shift+D)
4. Activer "Enable desktop MCP server" dans le panel
5. Configurer Claude Code:
```bash
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp
```

**Option Remote:**
```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

### Outils MCP Disponibles

| Outil | Description |
|-------|-------------|
| `get_figma_data` | Layout, contenu, styles (valeurs calculées) |
| `get_variable_defs` | Variables Figma (couleurs, spacing, typo) |
| `download_figma_images` | Export SVG/PNG |
| `get_screenshot` | Capture de la sélection |

**Limitation connue:** `get_variable_defs` retourne uniquement les valeurs par défaut, pas les modes de variables.

## Workflow

### 1. Extraction des données Figma

**Input:** URL Figma (ex: `https://www.figma.com/design/fileId/fileName?node-id=1-2`)

Extraire via MCP:
- Layout et structure des frames
- Couleurs HEX utilisées
- Dimensions (width, height, gap, padding)
- Font sizes

### 2. Analyse des sizes

Identifier toutes les valeurs numériques du design:
- Gaps entre éléments
- Paddings des containers
- Dimensions des éléments (width, height)
- Border radius

### 3. Conversion des couleurs

Convertir les couleurs HEX en OKLCH:
```bash
npx eva-color convert "#FF00FB"
# Output: oklch(69.9% 0.320 329.22)
```

Couleurs à extraire:
- **brand** - Couleur principale
- **accent** - Couleur secondaire
- **extra** - Couleur tertiaire
- **dark** - Texte/fond sombre
- **light** - Texte/fond clair

### 4. Création du projet

Structure:
```
projects/PROJECT_NAME/
├── index.html
├── styles/
│   └── PROJECT_NAME.scss
└── render/
    └── PROJECT_NAME.css
```

Commandes:
```bash
mkdir -p projects/PROJECT_NAME/styles
mkdir -p projects/PROJECT_NAME/render
```

### 5. Configuration SCSS

Configurer EVA CSS directement dans le fichier SCSS:

```scss
@use 'eva-css-fluid' with (
  $sizes: (/* sizes extraites du Figma */),
  $font-sizes: (/* font-sizes extraites */),
  $build-class: false,
  $px-rem-suffix: false,
  $name-by-size: true,
  $custom-class: false
);
```

### 6. Définition du thème

Définir les couleurs OKLCH dans la classe theme:

```scss
.theme-PROJECT_NAME {
  --brand-lightness: XX%;
  --brand-chroma: X.XXX;
  --brand-hue: XXX.XX;
  // ... autres couleurs

  --current-lightness: XX%;  // light mode background
  --current-darkness: XX%;   // light mode text

  --dark-lightness: var(--current-darkness);
  --light-lightness: var(--current-lightness);
}
```

### 7. Variables EVA CSS

**Sizes:** Utiliser les variables exactes du Figma
- `var(--64)` - Base
- `var(--64_)` - Reduced (scaling moins agressif)
- `var(--64__)` - Extreme (scaling très réduit)

**Font sizes:**
- `var(--fs-120)` - Base
- `var(--fs-120_)` - Reduced
- `var(--fs-120__)` - Extreme

**Couleurs:**
- `var(--brand)` - Base
- `var(--brand_)`, `var(--brand__)`, `var(--brand___)` - Opacités
- `var(--brand-d)`, `var(--brand-d_)` - Plus sombre
- `var(--brand-b)`, `var(--brand-b_)` - Plus clair

### 8. Compilation

```bash
npx sass --load-path=node_modules projects/PROJECT_NAME/styles/PROJECT_NAME.scss:projects/PROJECT_NAME/render/PROJECT_NAME.css
```

### 9. HTML

Structure minimale:
```html
<body class="current-theme theme-PROJECT_NAME">
```

## Règles importantes

1. **Ne jamais utiliser de valeurs fixes** - Toujours `var(--XX)` pas `XXpx`
2. **Respecter les variables Figma** - Si Figma utilise `--120__`, utiliser `var(--120__)`
3. **Mode buildClass: false** - Écrire du CSS sémantique avec les variables EVA
4. **Boucler sur les éléments répétés** - Si un élément Figma contient "loop", itérer sur les données

## Commandes utiles

```bash
# Conversion couleur
npx eva-color convert "#HEX"

# Compilation
npx sass --load-path=node_modules [input]:[output]

# Watch mode
npm run watch-projects
```
