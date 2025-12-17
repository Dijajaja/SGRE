# 👥 Workflow Collaboratif - 3 Membres

## ✅ Avantages d'Être Collaborateur

- ✅ **Push direct** : Chaque membre peut push ses modifications
- ✅ **Moins de dépendance** : Pas besoin d'attendre le PC principal
- ✅ **Meilleure synchronisation** : Chacun peut partager ses données

---

## 🔄 Workflow Recommandé

### Quand un Membre Modifie les Données

**Sur le PC qui a modifié** :

```powershell
# 1. Exporter les données
.\exporter_donnees.ps1

# 2. Ajouter à Git
git add oracle/export_donnees_complet.sql

# 3. Commit
git commit -m "Mise à jour données Oracle - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

# 4. Push directement (maintenant possible car collaborateur)
git push
```

**OU utilise le script automatique** :

```powershell
.\synchroniser_donnees.ps1
```

---

### Quand les Autres Membres Veulent Récupérer

**Sur les autres PC** :

```powershell
# 1. Pull les dernières modifications
git pull

# 2. Importer les données
.\recuperer_donnees.ps1
# OU
.\importer_donnees_complet.ps1
```

---

## 📋 Règles Importantes

### 1. Toujours Pull Avant de Travailler

```powershell
git pull
```

Cela évite les conflits.

### 2. Exporter Avant de Push les Données

Si tu as modifié des données dans Oracle :

```powershell
.\synchroniser_donnees.ps1
```

### 3. Communiquer les Modifications Importantes

Si tu fais une grosse modification, informe les autres membres pour qu'ils fassent `git pull` et importent.

---

## 🎯 Scénarios Courants

### Scénario 1 : Membre A Crée une Réclamation

1. **Membre A** : Crée la réclamation dans l'interface
2. **Membre A** : Exporte et push
   ```powershell
   .\synchroniser_donnees.ps1
   ```
3. **Membres B & C** : Récupèrent
   ```powershell
   git pull
   .\recuperer_donnees.ps1
   ```

### Scénario 2 : Membre B Attribue une Réclamation

1. **Membre B** : Attribue la réclamation dans l'interface admin
2. **Membre B** : Exporte et push
   ```powershell
   .\synchroniser_donnees.ps1
   ```
3. **Membres A & C** : Récupèrent pour voir l'attribution

### Scénario 3 : Membre C Résout une Réclamation

1. **Membre C** : Change le statut à "RÉSOLUE"
2. **Membre C** : Exporte et push
3. **Membres A & B** : Récupèrent pour voir la mise à jour

---

## ⚠️ Éviter les Conflits

### Problème : Deux Membres Modifient en Même Temps

**Solution** : Toujours pull avant de push

```powershell
# 1. Pull d'abord
git pull

# 2. Si conflit, résoudre
# (Généralement pas de problème car on ne modifie que export_donnees_complet.sql)

# 3. Puis push
git push
```

### Si Conflit sur export_donnees_complet.sql

Le fichier est régénéré à chaque export, donc :

```powershell
# Supprimer le fichier local
Remove-Item oracle\export_donnees_complet.sql -Force

# Pull
git pull

# Importer
.\importer_donnees_complet.ps1
```

---

## 📊 Commandes Rapides

### Pour Exporter et Partager

```powershell
.\synchroniser_donnees.ps1
```

### Pour Récupérer

```powershell
.\recuperer_donnees.ps1
```

### Pour Importer (avec vidage)

```powershell
.\importer_donnees_complet.ps1
```

---

## ✅ Checklist pour Chaque Membre

### Avant de Commencer à Travailler

- [ ] `git pull` pour avoir les dernières modifications
- [ ] `.\recuperer_donnees.ps1` si des données ont été partagées
- [ ] Redémarrer le backend si nécessaire

### Après Avoir Modifié des Données

- [ ] `.\synchroniser_donnees.ps1` pour exporter et push
- [ ] Informer les autres membres si modification importante

---

## 🎉 Avantages du Workflow Collaboratif

- ✅ **Autonomie** : Chaque membre peut push directement
- ✅ **Rapidité** : Pas besoin d'attendre le PC principal
- ✅ **Flexibilité** : Chacun peut partager ses modifications
- ✅ **Synchronisation** : Tous voient les mêmes données

---

## 💡 Astuce

**Établir une routine** :
- **Matin** : `git pull` + `recuperer_donnees.ps1` pour commencer la journée avec les dernières données
- **Soir** : `synchroniser_donnees.ps1` avant de fermer pour partager tes modifications

