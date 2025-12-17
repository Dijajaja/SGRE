# Script PowerShell pour arrêter le processus utilisant le port 3001
# À exécuter en tant qu'administrateur

Write-Host "Recherche du processus utilisant le port 3001..." -ForegroundColor Yellow

# Trouver le processus
$process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    $processId = $process
    $processInfo = Get-Process -Id $processId -ErrorAction SilentlyContinue
    
    if ($processInfo) {
        Write-Host "Processus trouve :" -ForegroundColor Cyan
        Write-Host "  PID: $processId" -ForegroundColor White
        Write-Host "  Nom: $($processInfo.ProcessName)" -ForegroundColor White
        Write-Host "  Chemin: $($processInfo.Path)" -ForegroundColor White
        
        Write-Host "`nArret du processus..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
        
        Write-Host "Processus arrete avec succes !" -ForegroundColor Green
    } else {
        Write-Host "Processus introuvable avec PID $processId" -ForegroundColor Red
    }
} else {
    Write-Host "Aucun processus n'utilise le port 3001" -ForegroundColor Green
}

Write-Host "`nTu peux maintenant redemarrer le backend avec : cd backend && npm start" -ForegroundColor Cyan

