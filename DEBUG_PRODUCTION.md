# 🔍 Guide de Diagnostic - EVA CSS en Production

## ❌ Problème constaté
Le générateur EVA CSS fonctionne parfaitement en local mais ne fonctionne pas en ligne (production).

## 🔧 Solutions implémentées

### 1. **Résolution des conflits d'initialisation**
- ✅ Empêché la double initialisation entre auto-init et manuel
- ✅ Ajouté un flag `EVA_MANUAL_INIT` pour contrôler l'initialisation
- ✅ Amélioré la robustesse du timing de chargement

### 2. **Configuration adaptative production/développement**
```javascript
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const config = {
  noFluidSuffix: !isProduction, // false en production, true en local
  buildClass: true,
  nameBySize: true
};
```

### 3. **Amélioration du timing et retry logic**
- ✅ Augmenté MAX_RETRIES à 15 (au lieu de 10)
- ✅ Augmenté RETRY_DELAY à 500ms (au lieu de 300ms)
- ✅ Ajouté fallback timeout à 3 secondes
- ✅ Multiple stratégies d'initialisation (load + DOMContentLoaded)

### 4. **CSP plus permissive temporairement**
- ✅ Ajouté `'unsafe-eval'` à script-src
- ✅ Ajouté directives manquantes (`object-src`, `base-uri`)

### 5. **Diagnostics améliorés**
- ✅ Logs détaillés de l'environnement
- ✅ Test localStorage
- ✅ Messages d'erreur utilisateur informatifs
- ✅ Stack traces détaillées

## 🧪 Tests à effectuer

### Test 1: Vérifier les logs de diagnostic
Déployez et ouvrez la console sur votre site en production. Vous devriez voir :
```
🚀 Script initial load
📍 Location: {hostname: "votre-site.com", pathname: "/js-calculator.html", protocol: "https:"}
🌐 User Agent: Mozilla/5.0...
💾 localStorage available? true
📝 Document state: loading
⚡ EvaCSSGenerator exists? true/false
✅ localStorage working
```

### Test 2: Identifier la cause exacte
Regardez spécifiquement ces messages :
- Si `EvaCSSGenerator exists? false` → Problème de chargement de `scss.js`
- Si erreur localStorage → Problème de permissions navigateur
- Si timeout après 15 retries → Problème de timing/CDN

### Test 3: Vérifier la configuration appliquée
L'interface devrait afficher :
```
✅ Configuration EVA CSS
{
  "noFluidSuffix": false,  // doit être false en production
  "buildClass": true,
  "nameBySize": true
}
Environnement: Production
Hostname: votre-site.com
```

## 🔍 Causes probables et solutions

### Cause 1: Chargement de `scss.js` bloqué
**Symptômes:** `EvaCSSGenerator exists? false` persistant
**Solutions:**
- Vérifier que `scss.js` est accessible à `https://votre-site.com/scss.js`
- Vérifier les headers HTTP (pas de 404/403)
- Tester le chargement direct du fichier

### Cause 2: CSP trop restrictive
**Symptômes:** Erreurs CSP dans la console
**Solutions:**
- La CSP a été relaxée temporairement
- Si problème persiste, retirer complètement la CSP pour tester

### Cause 3: localStorage bloqué
**Symptômes:** `localStorage blocked:` dans les logs
**Solutions:**
- Vérifier les paramètres de confidentialité du navigateur
- Tester en navigation privée/incognito

### Cause 4: Latence réseau/CDN
**Symptômes:** Timeout après plusieurs retries
**Solutions:**
- Les délais ont été augmentés (500ms, 15 retries, 3s fallback)
- Considérer héberger GSAP localement si problème persiste

### Cause 5: Cache agressif
**Symptômes:** Ancien code exécuté malgré les modifications
**Solutions:**
- Forcer le refresh (`Ctrl+F5` ou `Cmd+Shift+R`)
- Vider le cache navigateur
- Ajouter un cache-buster: `scss.js?v=2`

## 🚀 Actions immédiates

1. **Déployez les modifications**
2. **Testez sur votre site en production**
3. **Ouvrez la console et partagez tous les logs**
4. **Notez spécifiquement:**
   - Le message au niveau "EvaCSSGenerator exists?"
   - Tous les messages d'erreur
   - L'environnement détecté (Production/Développement)
   - Si l'interface d'erreur apparaît

## 📞 Si le problème persiste

Partagez ces informations :
1. **Tous les logs de console** (copier-coller complet)
2. **URL de votre site en production**
3. **Navigateur et version utilisés**
4. **Capture d'écran de l'interface d'erreur** (si elle apparaît)

## 🔄 Rollback si nécessaire

Si les modifications cassent quelque chose :
1. **Revertir `netlify.toml`** (retirer `'unsafe-eval'`)
2. **Revertir le script** dans `js-calculator.html`
3. **Revertir `scss.js`** (retirer la condition `EVA_MANUAL_INIT`) 