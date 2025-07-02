# Script PowerShell pour surveiller main.scss ET tous les fichiers du dossier projets
Write-Host "🚀 Démarrage du watch complet..." -ForegroundColor Green

# Compiler tous les fichiers existants d'abord
Write-Host "📦 Compilation initiale..." -ForegroundColor Yellow
npx sass styles/main.scss styles/main.css
npx sass styles/projets/:styles/render/ --style compressed

Write-Host "👀 Surveillance en cours..." -ForegroundColor Cyan
Write-Host "   - main.scss -> main.css" -ForegroundColor White
Write-Host "   - styles/projets/*.scss -> styles/render/*.css" -ForegroundColor White
Write-Host "   (Ctrl+C pour arrêter)" -ForegroundColor Red

# Fonction pour nettoyer les fichiers CSS orphelins
function Remove-OrphanedCSS {
    $scssFiles = Get-ChildItem -Path "styles/projets" -Filter "*.scss" -Name
    $cssFiles = Get-ChildItem -Path "styles/render" -Filter "*.css" -Name
    
    foreach ($cssFile in $cssFiles) {
        $scssFile = $cssFile -replace '\.css$', '.scss'
        if ($scssFile -notin $scssFiles) {
            $cssPath = "styles/render/$cssFile"
            if (Test-Path $cssPath) {
                Remove-Item $cssPath -Force
                Write-Host "🗑️  Fichier supprimé: $cssPath" -ForegroundColor Red
            }
        }
    }
}

# Démarrer deux processus de watch en parallèle
$mainJob = Start-Job -ScriptBlock { 
    npx sass --watch styles/main.scss styles/main.css 
}

$projetsJob = Start-Job -ScriptBlock { 
    npx sass --watch styles/projets/:styles/render/ --style compressed
}

# Surveiller les changements de fichiers pour nettoyer les orphelins
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = "styles/projets"
$watcher.Filter = "*.scss"
$watcher.IncludeSubdirectories = $false
$watcher.EnableRaisingEvents = $true

# Événement pour la suppression de fichiers
Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action {
    Start-Sleep 1  # Attendre un peu pour que Sass termine
    Remove-OrphanedCSS
}

# Attendre que l'utilisateur arrête le script
try {
    while ($true) {
        Start-Sleep 1
    }
}
finally {
    Write-Host "🛑 Arrêt du watch..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Unregister-Event -SourceIdentifier $($watcher.GetHashCode())
} 