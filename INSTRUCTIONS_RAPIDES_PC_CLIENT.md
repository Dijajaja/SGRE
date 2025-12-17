# 🚀 Instructions Rapides pour le PC Client

## ⚠️ Important : Exécuter le Script Complet

**Ne copie PAS les lignes une par une !** Exécute le script complet avec `.\recuperer_donnees.ps1`

---

## 📋 Étape 1 : Configurer Git (Une seule fois)

**Dans PowerShell** :

```powershell
git config --global user.email "ton-email@example.com"
git config --global user.name "Ton Nom"
```

**Exemple** :
```powershell
git config --global user.email "membre2@iscae.mr"
git config --global user.name "Membre 2"
```

---

## 📋 Étape 2 : Aller dans le Dossier du Projet

```powershell
cd "C:\Users\R M\Documents\SGRE"
```

---

## 📋 Étape 3 : Récupérer les Dernières Modifications

```powershell
git pull
```

---

## 📋 Étape 4 : Exécuter le Script Complet

**IMPORTANT** : Exécute le script complet, pas ligne par ligne !

```powershell
.\recuperer_donnees.ps1
```

Le script va :
1. Faire `git pull` automatiquement
2. Vérifier que le fichier existe
3. Te demander confirmation
4. Importer les données dans Oracle

---

## 🔧 Si le Script ne Fonctionne Pas

### Option A : Commandes Manuelles

**1. Pull depuis Git** :
```powershell
git pull
```

**2. Vérifier que le fichier existe** :
```powershell
Test-Path oracle\export_donnees_complet.sql
```

**3. Importer dans Oracle** (ouvre SQL*Plus séparément) :
```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;
@C:\Users\R M\Documents\SGRE\oracle\export_donnees_complet.sql
```

### Option B : Utiliser le Script d'Import Directement

```powershell
.\importer_donnees.ps1
```

---

## ❌ Erreurs Courantes

### "Author identity unknown"

**Solution** : Configure Git (voir Étape 1)

### "Join-Path : Impossible de lier l'argument"

**Cause** : Tu exécutes des lignes du script une par une au lieu du script complet

**Solution** : Exécute `.\recuperer_donnees.ps1` (le script complet)

### "Le fichier n'existe pas"

**Solution** : Fais `git pull` d'abord pour récupérer le fichier

---

## ✅ Checklist

- [ ] Git configuré (`user.email` et `user.name`)
- [ ] Dans le bon dossier (`cd "C:\Users\R M\Documents\SGRE"`)
- [ ] `git pull` exécuté
- [ ] Script `.\recuperer_donnees.ps1` exécuté (pas ligne par ligne !)
- [ ] Données importées dans Oracle
- [ ] Backend redémarré

---

## 💡 Astuce

**Ne copie PAS les lignes du script !** 

✅ **BON** : `.\recuperer_donnees.ps1`

❌ **MAUVAIS** : Copier-coller les lignes une par une

