# 🔧 Résolution : Port 3001 Déjà Utilisé

## ❌ Erreur
```
Error: listen EADDRINUSE: address already in use :::3001
```

## ✅ Solution Rapide

### Option 1 : Script PowerShell (Recommandé)

Sur le PC client, dans PowerShell (en tant qu'administrateur) :

```powershell
cd C:\Users\R M\Documents\SGRE
.\arreter_port_3001.ps1
```

### Option 2 : Manuellement

1. **Trouver le processus** :
```powershell
netstat -ano | findstr :3001
```

2. **Noter le PID** (dernière colonne, ex: 1234)

3. **Arrêter le processus** :
```powershell
taskkill /PID 1234 /F
```

### Option 3 : Redémarrer le PC

Si les options précédentes ne fonctionnent pas, redémarrer le PC client.

## 🔄 Après avoir Arrêté le Processus

Redémarrer le backend :

```bash
cd backend
npm start
```

Tu devrais maintenant voir :
```
✅ Pool de connexions Oracle créé avec succès
🚀 Serveur démarré sur le port 3001
```

## ✅ Vérification

Une fois le backend démarré, vérifie que :
1. Le backend répond sur `http://localhost:3001/api`
2. La connexion Oracle fonctionne (pas d'erreur dans les logs)
3. L'interface admin charge les données correctement

