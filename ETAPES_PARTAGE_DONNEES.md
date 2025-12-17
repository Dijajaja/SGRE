# 📤 Guide de Partage des Données - PC Principal

## 🎯 Situation

- ✅ **Ton PC** : A toutes les données Oracle
- ❌ **PC Membre 2** : Base Oracle vide
- ❌ **PC Membre 3** : Base Oracle vide

## 📋 Étapes pour Toi (PC Principal)

### Étape 1 : Exporter les Données

Exécute ce script pour exporter toutes les données :

```powershell
.\exporter_donnees.ps1
```

**OU manuellement dans SQL*Plus** :

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;
@oracle/21_export_donnees.sql
```

Cela crée le fichier : `oracle/export_donnees_complet.sql`

---

### Étape 2 : Vérifier le Fichier

Vérifie que le fichier existe et a une taille raisonnable :

```powershell
dir oracle\export_donnees_complet.sql
```

---

### Étape 3 : Ajouter à Git

```powershell
git add oracle/export_donnees_complet.sql
git commit -m "Export initial des données Oracle pour le groupe"
git push
```

**OU utilise le script automatique** :

```powershell
.\synchroniser_donnees.ps1
```

---

### Étape 4 : Informer les Autres Membres

Dis-leur d'exécuter sur leur PC :

```powershell
git pull
.\recuperer_donnees.ps1
```

---

## 📥 Étapes pour les 2 Autres Membres

### Sur leur PC (après avoir cloné le projet)

### Étape 1 : Récupérer depuis Git

```powershell
git pull
```

---

### Étape 2 : Vérifier que le Fichier Existe

```powershell
dir oracle\export_donnees_complet.sql
```

---

### Étape 3 : Importer les Données

**Option A : Script Automatique** (Recommandé)

```powershell
.\recuperer_donnees.ps1
```

**Option B : Manuel**

```powershell
.\importer_donnees.ps1
```

**Option C : SQL*Plus Manuel**

```sql
CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;
@oracle/export_donnees_complet.sql
```

---

### Étape 4 : Vérifier l'Import

```sql
SELECT COUNT(*) FROM ETUDIANT;
SELECT COUNT(*) FROM ADMIN;
SELECT COUNT(*) FROM RECLAMATION;
```

---

### Étape 5 : Redémarrer le Backend

```powershell
cd backend
npm start
```

---

## 🔄 Workflow pour les Mises à Jour Futures

### Quand un Membre Modifie les Données

**Sur le PC qui a modifié** :

```powershell
.\synchroniser_donnees.ps1
```

**Sur les 2 Autres PC** :

```powershell
.\recuperer_donnees.ps1
```

---

## ⚠️ Important

1. **Toujours exporter avant de push** si tu as modifié des données
2. **Toujours pull avant de travailler** pour avoir les dernières données
3. **Éviter les conflits** : Si 2 personnes modifient en même temps, la dernière à push écrase les changements de l'autre

---

## 🎯 Résumé Rapide

### Pour Toi (Maintenant) :

```powershell
# 1. Exporter
.\exporter_donnees.ps1

# 2. Push vers Git
.\synchroniser_donnees.ps1
# OU
git add oracle/export_donnees_complet.sql
git commit -m "Export données"
git push
```

### Pour les 2 Autres Membres :

```powershell
# 1. Pull depuis Git
git pull

# 2. Importer
.\recuperer_donnees.ps1
# OU
.\importer_donnees.ps1
```

---

## ✅ Checklist

### PC Principal (Toi)
- [ ] Exporter les données (`exporter_donnees.ps1`)
- [ ] Vérifier que le fichier existe
- [ ] Push vers Git (`synchroniser_donnees.ps1` ou manuel)
- [ ] Informer les autres membres

### PC Membre 2 & 3
- [ ] Pull depuis Git
- [ ] Vérifier que le fichier existe
- [ ] Importer les données (`recuperer_donnees.ps1`)
- [ ] Vérifier l'import (compter les données)
- [ ] Redémarrer le backend

---

## 🐛 Problèmes Courants

### "Le fichier export_donnees_complet.sql n'existe pas"

**Solution** : Le PC principal n'a pas encore exporté. Demande-lui d'exécuter `exporter_donnees.ps1`

### "ORA-00001: unique constraint violated"

**Solution** : Des données existent déjà. Supprime-les d'abord ou modifie les IDs.

### "SP2-0310: unable to open file"

**Solution** : Vérifie le chemin du fichier. Utilise le chemin complet si nécessaire.

---

## 💡 Astuce

Pour éviter les conflits, établissez une règle :
- **Une seule personne modifie les données à la fois**
- **Toujours exporter et push après modification**
- **Toujours pull avant de commencer à travailler**

