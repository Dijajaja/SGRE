# Script PowerShell pour exporter les données Oracle
# À exécuter sur le PC qui a toutes les données

Write-Host "Export des donnees Oracle..." -ForegroundColor Green

$projectPath = $PSScriptRoot
if (-not $projectPath) {
    $projectPath = Get-Location
}

$oraclePath = Join-Path $projectPath "oracle"
$exportFile = Join-Path $oraclePath "export_donnees_complet.sql"
$exportSqlPath = Join-Path $oraclePath "21_export_donnees.sql"

# Vérifier que le dossier oracle existe
if (-not (Test-Path $oraclePath)) {
    Write-Host "Le dossier oracle n'existe pas !" -ForegroundColor Red
    exit 1
}

# Vérifier que le script SQL existe
if (-not (Test-Path $exportSqlPath)) {
    Write-Host "Le script SQL d'export n'existe pas : $exportSqlPath" -ForegroundColor Red
    exit 1
}

Write-Host "Execution du script d'export SQL..." -ForegroundColor Cyan

# Créer le fichier temporaire avec les commandes SQL
$tempSqlFile = Join-Path $env:TEMP "export_temp.sql"

$sqlCommands = @(
    "CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;",
    "SET PAGESIZE 0",
    "SET FEEDBACK OFF",
    "SET VERIFY OFF",
    "SET HEADING OFF",
    "SET ECHO OFF",
    "SET LINESIZE 2000",
    "SPOOL $exportFile",
    "@$exportSqlPath",
    "SPOOL OFF",
    "EXIT"
)

$sqlCommands | Out-File -FilePath $tempSqlFile -Encoding ASCII

Write-Host "Execution de SQL*Plus..." -ForegroundColor Yellow
Write-Host "Fichier temporaire : $tempSqlFile" -ForegroundColor Gray

# Exécuter SQL*Plus
$sqlplusPath = "sqlplus"
$process = Start-Process -FilePath $sqlplusPath -ArgumentList "/nolog", "@$tempSqlFile" -Wait -NoNewWindow -PassThru

if ($process.ExitCode -eq 0) {
    if (Test-Path $exportFile) {
        $fileSize = (Get-Item $exportFile).Length
        Write-Host "Export reussi !" -ForegroundColor Green
        Write-Host "Fichier cree : $exportFile" -ForegroundColor Cyan
        Write-Host "Taille : $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor Cyan
        
        # Ouvrir le dossier dans l'explorateur
        Write-Host ""
        Write-Host "Ouverture du dossier..." -ForegroundColor Yellow
        Start-Process explorer.exe -ArgumentList "/select,`"$exportFile`""
    } else {
        Write-Host "Le fichier d'export n'a pas ete cree. Verifiez les erreurs SQL*Plus." -ForegroundColor Yellow
        Write-Host "Verifiez que le script SQL fonctionne correctement." -ForegroundColor Yellow
    }
} else {
    Write-Host "Erreur lors de l'export !" -ForegroundColor Red
    Write-Host "Code de sortie : $($process.ExitCode)" -ForegroundColor Red
}

# Nettoyer le fichier temporaire
if (Test-Path $tempSqlFile) {
    Remove-Item $tempSqlFile -Force
}

Write-Host ""
Write-Host "Termine ! Transferez le fichier export_donnees_complet.sql sur l'autre PC." -ForegroundColor Green
