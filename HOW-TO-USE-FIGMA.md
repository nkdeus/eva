# Configuration MCP Figma pour Claude Code

Guide pour configurer et utiliser le serveur MCP Figma avec Claude Code.

## Fonctionnement

Le MCP (Model Context Protocol) Figma permet a Claude Code de :
- Lire les designs Figma directement
- Generer du code a partir des maquettes
- Extraire les variables de design (couleurs, espacements, typographie)
- Prendre des screenshots de nodes specifiques

## Architecture

```
~/.claude.json                    # Config MCP par projet
~/.claude/.credentials.json       # Tokens OAuth Figma (global)
.claude/settings.local.json       # Permissions auto (optionnel, par projet)
```

## Installation

### Etape 1 : Ajouter le serveur MCP

Dans le terminal, va dans le dossier de ton projet puis execute :

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

Cette commande ajoute la config suivante dans `~/.claude.json` :

```json
{
  "projects": {
    "/chemin/vers/ton/projet": {
      "mcpServers": {
        "figma": {
          "type": "http",
          "url": "https://mcp.figma.com/mcp"
        }
      }
    }
  }
}
```

### Etape 2 : Authentifier Figma

1. Lance Claude Code dans ton projet :
   ```bash
   claude
   ```

2. Tape `/mcp` pour ouvrir le menu MCP

3. Selectionne `figma` dans la liste

4. Clique sur `Authenticate`

5. Une page web s'ouvre dans ton navigateur

6. Connecte-toi a Figma si necessaire

7. Clique sur **"Allow Access"**

8. Retour dans Claude Code, tu verras : `Authentication successful. Connected to figma.`

### Etape 3 : Verifier la connexion

```bash
claude mcp list
```

Resultat attendu :
```
figma: https://mcp.figma.com/mcp (HTTP) - ✓ Connected
```

## Configuration des permissions (optionnel)

Pour eviter les confirmations a chaque utilisation des outils Figma, cree le fichier `.claude/settings.local.json` dans ton projet :

```json
{
  "permissions": {
    "allow": [
      "mcp__figma__get_design_context",
      "mcp__figma__get_screenshot",
      "mcp__figma__get_metadata",
      "mcp__figma__get_variable_defs",
      "mcp__figma__get_code_connect_map",
      "mcp__figma__whoami"
    ]
  }
}
```

## Utilisation

### Depuis une URL Figma

Donne simplement l'URL Figma a Claude :

```
Implemente ce design : https://figma.com/design/ABC123/MonProjet?node-id=1-2
```

Claude extraira automatiquement :
- `fileKey` : ABC123
- `nodeId` : 1:2

### Outils disponibles

| Outil | Description |
|-------|-------------|
| `get_design_context` | Genere du code UI a partir d'un node Figma |
| `get_screenshot` | Capture une image d'un node |
| `get_metadata` | Structure XML du design (IDs, positions, tailles) |
| `get_variable_defs` | Variables de design (couleurs, espacements) |
| `get_code_connect_map` | Mapping vers les composants du codebase |
| `generate_diagram` | Cree des diagrammes FigJam (flowchart, sequence, etc.) |

## Depannage

### "Needs authentication"

Le token a expire ou n'existe pas.

**Solution :**
1. `/mcp` dans Claude Code
2. Selectionne `figma`
3. Clique sur `Authenticate`

### Serveur non trouve

**Verifications :**
```bash
# Es-tu dans le bon dossier ?
pwd

# Le serveur est-il configure ?
claude mcp get figma
```

Si le serveur n'existe pas, refais l'etape 1.

### Erreur de permissions sur les fichiers Figma

Tu n'as peut-etre pas acces au fichier Figma demande.

**Solution :**
- Verifie que ton compte Figma a acces au fichier
- Demande l'acces au proprietaire du fichier

### Verifier l'utilisateur connecte

```
Utilise l'outil mcp__figma__whoami pour voir qui est connecte
```

## Commandes utiles

```bash
# Lister tous les serveurs MCP
claude mcp list

# Details d'un serveur
claude mcp get figma

# Supprimer le serveur
claude mcp remove figma -s local

# Aide MCP
claude mcp --help
```

## Structure des fichiers de config

### ~/.claude.json (config globale + projets)

```json
{
  "projects": {
    "/mnt/c/dev/mon-projet": {
      "mcpServers": {
        "figma": {
          "type": "http",
          "url": "https://mcp.figma.com/mcp"
        }
      }
    }
  }
}
```

### ~/.claude/.credentials.json (tokens OAuth)

```json
{
  "mcpOAuth": {
    "figma|xxxxx": {
      "serverName": "figma",
      "serverUrl": "https://mcp.figma.com/mcp",
      "accessToken": "figu_xxxx",
      "refreshToken": "figur_xxxx",
      "expiresAt": 1234567890
    }
  }
}
```

Les tokens sont automatiquement rafraichis par Claude Code.

## Ressources

- [Documentation officielle Figma MCP](https://developers.figma.com/docs/figma-mcp-server/)
- [Guide Figma MCP](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
- [Remote server installation](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)
