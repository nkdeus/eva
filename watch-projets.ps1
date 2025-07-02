# Script PowerShell pour surveiller et compiler tous les fichiers SCSS du dossier projets
Write-Host "Démarrage du watch pour tous les fichiers SCSS du dossier projets..." -ForegroundColor Green

# Compiler tous les fichiers existants d'abord
Write-Host "Compilation initiale..." -ForegroundColor Yellow
npx sass styles/projets/:styles/render/ --style compressed

# Démarrer le watch
Write-Host "Surveillance en cours... (Ctrl+C pour arreter)" -ForegroundColor Cyan
npx sass --watch styles/projets/:styles/render/ --style compressed 