# Script PowerShell pour récupérer les données depuis Git
# À exécuter sur les PC qui veulent récupérer les dernières données

Write-Host "📥 Récupération des données Oracle depuis Git..." -ForegroundColor Green
Write-Host ""

# Déterminer le chemin du projet
$projectPath = $PSScriptRoot
if (-not $projectPath) {
    $projectPath = Get-Location
}

# Vérifier que Git est initialisé
if (-not (Test-Path (Join-Path $projectPath ".git"))) {
    Write-Host "❌ Le dossier n'est pas un dépôt Git !" -ForegroundColor Red
    Write-Host "   Clone le projet depuis Git d'abord" -ForegroundColor Yellow
    exit 1
}

# Changer vers le dossier du projet
Set-Location $projectPath

# Vérifier que le script d'import existe
$importScript = Join-Path $projectPath "importer_donnees.ps1"
if (-not (Test-Path $importScript)) {
    Write-Host "❌ Le script importer_donnees.ps1 n'existe pas !" -ForegroundColor Red
    Write-Host "   Chemin attendu : $importScript" -ForegroundColor Yellow
    exit 1
}

# Étape 1 : Pull depuis Git
Write-Host "📥 Étape 1 : Récupération depuis Git..." -ForegroundColor Cyan
git pull

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du pull !" -ForegroundColor Red
    Write-Host "   Vérifie :" -ForegroundColor Yellow
    Write-Host "   - Que le remote est configuré : git remote -v" -ForegroundColor Yellow
    Write-Host "   - Que tu es connecté à Internet" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Pull réussi !" -ForegroundColor Green
Write-Host ""

# Vérifier que le fichier d'export existe
$exportFile = Join-Path $projectPath "oracle\export_donnees_complet.sql"
if (-not (Test-Path $exportFile)) {
    Write-Host "⚠️  Le fichier export_donnees_complet.sql n'existe pas dans Git !" -ForegroundColor Yellow
    Write-Host "   Peut-être que personne n'a encore exporté les données." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Demande à un membre du groupe d'exécuter :" -ForegroundColor Cyan
    Write-Host "   .\synchroniser_donnees.ps1" -ForegroundColor Gray
    exit 0
}

Write-Host "✅ Fichier d'export trouvé !" -ForegroundColor Green
$fileSize = (Get-Item $exportFile).Length
Write-Host "📊 Taille : $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor Cyan
Write-Host ""

# Étape 2 : Demander confirmation pour l'import
Write-Host "⚠️  ATTENTION : L'import va remplacer/ajouter des données dans ta base Oracle locale." -ForegroundColor Yellow
Write-Host "   Si tu as des données locales que tu veux garder, fais un backup d'abord." -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Continuer avec l'import ? (O/N)"

if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host "❌ Import annulé." -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Tu peux importer manuellement plus tard avec :" -ForegroundColor Cyan
    Write-Host "   .\importer_donnees.ps1" -ForegroundColor Gray
    exit 0
}

Write-Host ""

# Étape 3 : Importer les données
Write-Host "📥 Étape 2 : Import des données dans Oracle..." -ForegroundColor Cyan
& $importScript

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Données récupérées et importées avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Redémarre le backend pour voir les nouvelles données :" -ForegroundColor Cyan
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   npm start" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'import !" -ForegroundColor Red
    Write-Host "   Vérifie les messages d'erreur ci-dessus." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Terminé !" -ForegroundColor Green

