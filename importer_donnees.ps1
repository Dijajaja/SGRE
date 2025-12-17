# Script PowerShell pour importer les données Oracle
# À exécuter sur le PC qui doit recevoir les données

Write-Host "📥 Import des données Oracle..." -ForegroundColor Green

$projectPath = $PSScriptRoot
if (-not $projectPath) {
    $projectPath = Get-Location
}

$oraclePath = Join-Path $projectPath "oracle"
$importFile = Join-Path $oraclePath "export_donnees_complet.sql"

# Vérifier que le fichier existe
if (-not (Test-Path $importFile)) {
    Write-Host "❌ Le fichier d'import n'existe pas !" -ForegroundColor Red
    Write-Host "   Chemin attendu : $importFile" -ForegroundColor Yellow
    Write-Host "   Assure-toi d'avoir transféré le fichier export_donnees_complet.sql" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Pour obtenir le fichier :" -ForegroundColor Cyan
    Write-Host "   1. Sur le PC serveur, exécute : exporter_donnees.ps1" -ForegroundColor Cyan
    Write-Host "   2. Transfère le fichier export_donnees_complet.sql vers ce PC" -ForegroundColor Cyan
    Write-Host "   3. Place-le dans le dossier : $oraclePath" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Fichier trouvé : $importFile" -ForegroundColor Green
$fileSize = (Get-Item $importFile).Length
Write-Host "📊 Taille : $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor Cyan
Write-Host ""

# Demander confirmation
Write-Host "⚠️  ATTENTION : Cette opération va importer des données dans Oracle." -ForegroundColor Yellow
Write-Host "   Si des données existent déjà avec les mêmes IDs, tu auras des erreurs." -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Continuer ? (O/N)"

if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host "❌ Import annulé." -ForegroundColor Red
    exit 0
}

# Demander le mot de passe Oracle
Write-Host ""
$oraclePassword = Read-Host "Mot de passe Oracle pour SGRE_USER (laisse vide pour '12345')" -AsSecureString
$oraclePasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($oraclePassword)
)
if ([string]::IsNullOrWhiteSpace($oraclePasswordPlain)) {
    $oraclePasswordPlain = "12345"
}

# Créer un script SQL temporaire
$tempSqlFile = Join-Path $env:TEMP "import_temp_$(Get-Date -Format 'yyyyMMddHHmmss').sql"
$sqlContent = @"
SET PAGESIZE 1000
SET FEEDBACK ON
SET VERIFY OFF
SET ECHO ON
SET SERVEROUTPUT ON

PROMPT ============================================
PROMPT Import des données SGRE
PROMPT ============================================
PROMPT

CONNECT SGRE_USER/$oraclePasswordPlain@localhost:1521/XEPDB1;

PROMPT Connexion réussie !
PROMPT

PROMPT Vérification des données existantes...
SELECT 
    'Étudiants existants: ' || COUNT(*) FROM ETUDIANT;
SELECT 
    'Réclamations existantes: ' || COUNT(*) FROM RECLAMATION;
PROMPT

PROMPT Début de l'import...
PROMPT

@$importFile

PROMPT
PROMPT ============================================
PROMPT Import terminé !
PROMPT ============================================
PROMPT

PROMPT Vérification des données importées...
SELECT 
    'Étudiants: ' || COUNT(*) FROM ETUDIANT;
SELECT 
    'Admins: ' || COUNT(*) FROM ADMIN;
SELECT 
    'Réclamations: ' || COUNT(*) FROM RECLAMATION;
SELECT 
    'Traitements: ' || COUNT(*) FROM TRAITEMENT;
SELECT 
    'Notifications: ' || COUNT(*) FROM NOTIFICATION;
PROMPT

EXIT
"@

$sqlContent | Out-File -FilePath $tempSqlFile -Encoding ASCII

Write-Host ""
Write-Host "🔄 Exécution de SQL*Plus..." -ForegroundColor Yellow
Write-Host "   Fichier SQL temporaire : $tempSqlFile" -ForegroundColor Gray
Write-Host ""

# Exécuter SQL*Plus
$sqlplusPath = "sqlplus"
$process = Start-Process -FilePath $sqlplusPath -ArgumentList "/nolog @`"$tempSqlFile`"" -Wait -NoNewWindow -PassThru

Write-Host ""

if ($process.ExitCode -eq 0) {
    Write-Host "✅ Import terminé !" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Vérifie les données dans Oracle avec :" -ForegroundColor Cyan
    Write-Host "   SELECT COUNT(*) FROM ETUDIANT;" -ForegroundColor Gray
    Write-Host "   SELECT COUNT(*) FROM RECLAMATION;" -ForegroundColor Gray
} else {
    Write-Host "❌ Erreur lors de l'import !" -ForegroundColor Red
    Write-Host "Code de sortie : $($process.ExitCode)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Vérifie :" -ForegroundColor Yellow
    Write-Host "   - Que le fichier export_donnees_complet.sql est valide" -ForegroundColor Yellow
    Write-Host "   - Que les tables existent déjà (exécute 01_schema.sql si nécessaire)" -ForegroundColor Yellow
    Write-Host "   - Que les identifiants Oracle sont corrects" -ForegroundColor Yellow
}

# Nettoyer le fichier temporaire
if (Test-Path $tempSqlFile) {
    Remove-Item $tempSqlFile -Force
    Write-Host ""
    Write-Host "🧹 Fichier temporaire supprimé." -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Terminé !" -ForegroundColor Green

