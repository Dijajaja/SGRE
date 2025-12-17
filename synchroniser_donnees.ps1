# Script PowerShell pour synchroniser les données vers Git
# À exécuter sur le PC qui a modifié les données et veut les partager

Write-Host "🔄 Synchronisation des données Oracle vers Git..." -ForegroundColor Green
Write-Host ""

# Vérifier que Git est initialisé
if (-not (Test-Path ".git")) {
    Write-Host "❌ Le dossier n'est pas un dépôt Git !" -ForegroundColor Red
    Write-Host "   Initialise Git d'abord : git init" -ForegroundColor Yellow
    exit 1
}

# Vérifier que le script d'export existe
$exportScript = Join-Path $PSScriptRoot "exporter_donnees.ps1"
if (-not (Test-Path $exportScript)) {
    Write-Host "❌ Le script exporter_donnees.ps1 n'existe pas !" -ForegroundColor Red
    exit 1
}

# Étape 1 : Exporter les données
Write-Host "📤 Étape 1 : Export des données..." -ForegroundColor Cyan
& $exportScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'export !" -ForegroundColor Red
    exit 1
}

# Vérifier que le fichier d'export existe
$exportFile = Join-Path $PSScriptRoot "oracle\export_donnees_complet.sql"
if (-not (Test-Path $exportFile)) {
    Write-Host "❌ Le fichier d'export n'a pas été créé !" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Export réussi !" -ForegroundColor Green
Write-Host ""

# Étape 2 : Ajouter à Git
Write-Host "📦 Étape 2 : Ajout à Git..." -ForegroundColor Cyan
git add oracle/export_donnees_complet.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'ajout à Git !" -ForegroundColor Red
    exit 1
}

# Étape 3 : Commit
Write-Host "💾 Étape 3 : Commit..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$commitMessage = "Mise à jour données Oracle - $timestamp"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Aucun changement à commiter (peut-être que le fichier n'a pas changé)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Commit réussi !" -ForegroundColor Green
}

Write-Host ""

# Étape 4 : Push vers Git
Write-Host "🚀 Étape 4 : Push vers Git..." -ForegroundColor Cyan
Write-Host "   (Assure-toi d'avoir configuré le remote et d'avoir les permissions)" -ForegroundColor Gray
Write-Host ""

$push = Read-Host "Pousser vers Git maintenant ? (O/N)"

if ($push -eq "O" -or $push -eq "o") {
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Données synchronisées vers Git avec succès !" -ForegroundColor Green
        Write-Host ""
        Write-Host "💡 Les autres membres du groupe doivent maintenant :" -ForegroundColor Cyan
        Write-Host "   1. git pull" -ForegroundColor Gray
        Write-Host "   2. .\importer_donnees.ps1" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "❌ Erreur lors du push !" -ForegroundColor Red
        Write-Host "   Vérifie :" -ForegroundColor Yellow
        Write-Host "   - Que le remote est configuré : git remote -v" -ForegroundColor Yellow
        Write-Host "   - Que tu as les permissions d'écriture" -ForegroundColor Yellow
        Write-Host "   - Que tu es connecté à Internet" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "⏭️  Push annulé. Tu peux le faire manuellement plus tard avec :" -ForegroundColor Yellow
    Write-Host "   git push" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Terminé !" -ForegroundColor Green

