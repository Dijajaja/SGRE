# Script PowerShell pour importer les données Oracle (version complète avec vidage)
# À exécuter sur le PC qui doit recevoir les données

Write-Host "📥 Import complet des données Oracle..." -ForegroundColor Green
Write-Host ""

# Déterminer le chemin du projet
$projectPath = $PSScriptRoot
if (-not $projectPath) {
    $projectPath = Get-Location
}

$oraclePath = Join-Path $projectPath "oracle"
$importFile = Join-Path $oraclePath "export_donnees_complet.sql"
$viderScript = Join-Path $oraclePath "23_vider_donnees_avant_import.sql"

# Vérifier que le fichier d'import existe
if (-not (Test-Path $importFile)) {
    Write-Host "❌ Le fichier d'import n'existe pas !" -ForegroundColor Red
    Write-Host "   Chemin attendu : $importFile" -ForegroundColor Yellow
    Write-Host "   Assure-toi d'avoir fait 'git pull' pour récupérer le fichier" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Fichier d'import trouvé : $importFile" -ForegroundColor Green
$fileSize = (Get-Item $importFile).Length
Write-Host "📊 Taille : $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor Cyan
Write-Host ""

# Demander confirmation
Write-Host "⚠️  ATTENTION : Cette opération va :" -ForegroundColor Yellow
Write-Host "   1. Supprimer TOUTES les données existantes dans Oracle" -ForegroundColor Yellow
Write-Host "   2. Importer les nouvelles données depuis Git" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Continuer ? (O/N)"

if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host "❌ Import annulé." -ForegroundColor Red
    exit 0
}

Write-Host ""

# Demander le mot de passe Oracle
$oraclePassword = Read-Host "Mot de passe Oracle pour SGRE_USER (laisse vide pour '12345')" -AsSecureString
$oraclePasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($oraclePassword)
)
if ([string]::IsNullOrWhiteSpace($oraclePasswordPlain)) {
    $oraclePasswordPlain = "12345"
}

# Créer un script SQL temporaire
$tempSqlFile = Join-Path $env:TEMP "import_complet_$(Get-Date -Format 'yyyyMMddHHmmss').sql"
$sqlContent = @"
SET PAGESIZE 1000
SET FEEDBACK ON
SET VERIFY OFF
SET ECHO ON
SET SERVEROUTPUT ON

PROMPT ============================================
PROMPT Import complet des données SGRE
PROMPT ============================================
PROMPT

CONNECT SGRE_USER/$oraclePasswordPlain@localhost:1521/XEPDB1;

PROMPT Connexion réussie !
PROMPT

PROMPT Étape 1 : Vérification des données existantes...
SELECT 
    'Étudiants existants: ' || COUNT(*) FROM ETUDIANT;
SELECT 
    'Réclamations existantes: ' || COUNT(*) FROM RECLAMATION;
PROMPT

PROMPT Étape 2 : Suppression des données existantes...
PROMPT

"@

# Ajouter le script de vidage si il existe
if (Test-Path $viderScript) {
    $viderContent = Get-Content $viderScript -Raw
    $sqlContent += $viderContent
} else {
    # Script de vidage inline si le fichier n'existe pas
    $sqlContent += @"
DELETE FROM NOTIFICATION;
DELETE FROM TRAITEMENT;
DELETE FROM RECLAMATION;
DELETE FROM ETUDIANT;
DELETE FROM ADMIN;
ALTER SEQUENCE seq_etudiant RESTART START WITH 1;
ALTER SEQUENCE seq_admin RESTART START WITH 1;
ALTER SEQUENCE seq_reclamation RESTART START WITH 1;
ALTER SEQUENCE seq_traitement RESTART START WITH 1;
ALTER SEQUENCE seq_notification RESTART START WITH 1;
COMMIT;
PROMPT Données supprimées...
PROMPT

"@
}

# Ajouter l'import
$sqlContent += @"
PROMPT Étape 3 : Import des nouvelles données...
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

Write-Host "🔄 Exécution de SQL*Plus..." -ForegroundColor Yellow
Write-Host ""

# Exécuter SQL*Plus
$sqlplusPath = "sqlplus"
$process = Start-Process -FilePath $sqlplusPath -ArgumentList "/nolog @`"$tempSqlFile`"" -Wait -NoNewWindow -PassThru

Write-Host ""

if ($process.ExitCode -eq 0) {
    Write-Host "✅ Import terminé !" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Redémarre le backend pour voir les nouvelles données :" -ForegroundColor Cyan
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   npm start" -ForegroundColor Gray
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
}

Write-Host ""
Write-Host "✅ Terminé !" -ForegroundColor Green

