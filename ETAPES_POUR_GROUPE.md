# 👥 Étapes pour Synchroniser la Base de Données - Groupe de 3

## 🎯 Situation

- **PC Actuel (Toi)** : A toutes les données Oracle
- **PC 2 & PC 3** : Ont cloné le projet mais n'ont pas les données

---

## 📤 ÉTAPE 1 : Sur TON PC (Exporter les Données)

### Option A : Script Automatique (Recommandé)

```powershell
.\exporter_donnees.ps1
```

### Option B : Manuel

1. **Ouvrir SQL*Plus** :
   ```powershell
   sqlplus
   ```

2. **Se connecter** :
   ```sql
   CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;
   ```

3. **Exporter** :
   ```sql
   @oracle/21_export_donnees.sql
   ```

4. **Vérifier** que le fichier est créé :
   ```
   oracle/export_donnees_complet.sql
   ```

---

## 📦 ÉTAPE 2 : Partager le Fichier avec les 2 Autres Membres

### Option A : Via Git (Recommandé)

1. **Ajouter le fichier à Git** :
   ```powershell
   git add oracle/export_donnees_complet.sql
   git commit -m "Export données Oracle initiales"
   git push
   ```

2. **Les autres membres** feront `git pull` pour récupérer le fichier

### Option B : Via Fichier Partagé

1. **Copier le fichier** `oracle/export_donnees_complet.sql`
2. **Partager via** :
   - Email
   - Google Drive / OneDrive
   - Clé USB
   - WhatsApp / Telegram

---

## 📥 ÉTAPE 3 : Sur les PC des 2 Autres Membres (Importer)

### Instructions à Donner aux 2 Autres Membres

#### Prérequis
1. ✅ Oracle Database installé et démarré
2. ✅ Utilisateur `SGRE_USER` créé avec mot de passe `12345`
3. ✅ Tables créées (exécuter `oracle/01_schema.sql` si nécessaire)

#### Méthode 1 : Script Automatique (Recommandé)

1. **Récupérer le fichier** :
   - Via Git : `git pull`
   - Ou copier le fichier `export_donnees_complet.sql` dans le dossier `oracle/`

2. **Importer** :
   ```powershell
   .\importer_donnees.ps1
   ```

#### Méthode 2 : Manuel (SQL*Plus)

1. **Ouvrir SQL*Plus** :
   ```powershell
   sqlplus
   ```

2. **Se connecter** :
   ```sql
   CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;
   ```

3. **Importer** :
   ```sql
   @C:\Users\[NOM_UTILISATEUR]\Documents\SGRE\oracle\export_donnees_complet.sql
   ```
   *(Remplacer par le chemin réel)*

4. **Vérifier** :
   ```sql
   SELECT COUNT(*) FROM ETUDIANT;
   SELECT COUNT(*) FROM RECLAMATION;
   ```

---

## 🔄 Synchronisation Continue (Pour Plus Tard)

### Quand quelqu'un modifie les données

**Sur le PC qui modifie** :
```powershell
.\synchroniser_donnees.ps1
```

**Sur les autres PC** :
```powershell
.\recuperer_donnees.ps1
```

---

## ✅ Checklist pour les 2 Autres Membres

### Avant l'Import

- [ ] Oracle Database installé
- [ ] Oracle Database démarré
- [ ] Utilisateur `SGRE_USER` créé
- [ ] Tables créées (schéma)
- [ ] Fichier `export_donnees_complet.sql` présent dans `oracle/`

### Après l'Import

- [ ] Vérifier les données :
  ```sql
  SELECT COUNT(*) FROM ETUDIANT;
  SELECT COUNT(*) FROM RECLAMATION;
  ```
- [ ] Redémarrer le backend :
  ```powershell
  cd backend
  npm start
  ```
- [ ] Tester l'application

---

## 🐛 Problèmes Courants

### Problème 1 : "SP2-0310: unable to open file"

**Solution** : Utiliser le chemin complet :
```sql
@C:\chemin\complet\vers\export_donnees_complet.sql
```

### Problème 2 : "ORA-00942: table or view does not exist"

**Solution** : Les tables n'existent pas. Exécuter d'abord :
```sql
@oracle/01_schema.sql
@oracle/02_triggers.sql
@oracle/03_fonctions.sql
@oracle/04_procedures.sql
@oracle/05_vues.sql
```

### Problème 3 : "ORA-00001: unique constraint violated"

**Solution** : Des données existent déjà. Supprimer d'abord :
```sql
DELETE FROM NOTIFICATION;
DELETE FROM TRAITEMENT;
DELETE FROM RECLAMATION;
DELETE FROM ETUDIANT WHERE id > 1;
COMMIT;
```

---

## 📋 Résumé Rapide

### Sur TON PC (Maintenant)
```powershell
.\exporter_donnees.ps1
git add oracle/export_donnees_complet.sql
git commit -m "Export données Oracle"
git push
```

### Sur les PC des 2 Autres Membres
```powershell
git pull
.\importer_donnees.ps1
```

---

## 💡 Message à Envoyer aux 2 Autres Membres

Copie-colle ce message :

```
Salut ! 👋

J'ai exporté les données Oracle. Pour les récupérer :

1. Récupère le fichier depuis Git :
   git pull

2. Importe les données :
   .\importer_donnees.ps1

OU manuellement dans SQL*Plus :
   CONNECT SGRE_USER/12345@localhost:1521/XEPDB1;
   @oracle/export_donnees_complet.sql

3. Vérifie que ça marche :
   SELECT COUNT(*) FROM ETUDIANT;
   SELECT COUNT(*) FROM RECLAMATION;

4. Redémarre le backend :
   cd backend
   npm start

Si tu as des problèmes, dis-moi ! 🚀
```

---

## 🎯 Action Immédiate

**Exécute maintenant sur TON PC** :

```powershell
.\exporter_donnees.ps1
```

Ensuite, partage le fichier avec les 2 autres membres ! 🚀

