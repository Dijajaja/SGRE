# 👥 Guide de Synchronisation pour le Groupe

## ✅ Ce qui a été fait

### Problème 1 : Git ≠ Base de Données
- ✅ **Résolu** : Fichier `export_donnees_complet.sql` créé et poussé vers Git
- ✅ Les données Oracle sont maintenant partagées via Git

### Problème 2 : Interface Admin Liée à la Session
- ✅ **Résolu** : Interface admin affiche **toutes les réclamations par défaut**
- ✅ Option "Mes réclamations uniquement" disponible comme filtre

---

## 📋 Pour Toi (PC Principal)

### Étape 1 : Vérifier que tout est poussé

```powershell
git status
```

Tu devrais voir : `Your branch is up to date with 'origin/main'`

### Étape 2 : Quand tu modifies des données

**Option A : Script Automatique** (Recommandé)
```powershell
.\synchroniser_donnees.ps1
```

**Option B : Manuel**
```powershell
# 1. Exporter
.\exporter_donnees.ps1

# 2. Ajouter à Git
git add oracle/export_donnees_complet.sql
git commit -m "Mise à jour données Oracle"
git push
```

---

## 📥 Pour les 2 Autres Membres

### Étape 1 : Récupérer les dernières modifications

```powershell
git pull
```

### Étape 2 : Importer les données Oracle

**Option A : Script Automatique** (Recommandé)
```powershell
.\recuperer_donnees.ps1
```

**Option B : Manuel**
```powershell
.\importer_donnees.ps1
```

### Étape 3 : Redémarrer le backend

```powershell
cd backend
npm start
```

### Étape 4 : Vérifier

Ouvre l'interface admin. Tu devrais maintenant voir :
- ✅ **Toutes les réclamations** (pas seulement les tiennes)
- ✅ Une checkbox "Mes réclamations uniquement" pour filtrer si besoin

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

## 🎯 Résumé des Changements

### Avant

❌ **Problème 1** : Git ne partageait pas les données Oracle
- Chaque PC avait sa propre base
- Les modifications n'étaient pas visibles par les autres

❌ **Problème 2** : Interface admin limitée
- Chaque admin voyait seulement ses réclamations
- Pas de vue globale

### Après

✅ **Problème 1 Résolu** : Données partagées via Git
- Export/Import automatique
- Tous voient les mêmes données

✅ **Problème 2 Résolu** : Interface admin globale
- Tous voient toutes les réclamations par défaut
- Option de filtrer "Mes réclamations uniquement"

---

## 📊 Fichiers Créés

1. **`exporter_donnees.ps1`** : Exporte les données Oracle
2. **`importer_donnees.ps1`** : Importe les données Oracle
3. **`synchroniser_donnees.ps1`** : Export + Git Push automatique
4. **`recuperer_donnees.ps1`** : Git Pull + Import automatique
5. **`oracle/export_donnees_complet.sql`** : Fichier de données (dans Git)

---

## ⚠️ Règles Importantes

1. **Toujours exporter avant de push** si tu as modifié des données
2. **Toujours pull avant de travailler** pour avoir les dernières données
3. **Éviter les conflits** : Si 2 personnes modifient en même temps, la dernière à push écrase les changements

---

## 🐛 Problèmes Courants

### "Le fichier export_donnees_complet.sql n'existe pas"

**Solution** : Le PC principal n'a pas encore exporté. Demande-lui d'exécuter `exporter_donnees.ps1`

### "Je ne vois toujours pas toutes les réclamations"

**Solution** : 
1. Vérifie que tu as fait `git pull`
2. Redémarre le frontend : `cd frontend && npm start`
3. Vérifie que la checkbox "Mes réclamations uniquement" est **décochée**

### "ORA-00001: unique constraint violated"

**Solution** : Des données existent déjà. Supprime-les d'abord ou modifie les IDs.

---

## ✅ Checklist pour les Membres

### PC Principal (Toi)
- [x] Export des données fait
- [x] Fichier poussé vers Git
- [x] Interface admin modifiée (vue globale)

### PC Membre 2 & 3
- [ ] `git pull` exécuté
- [ ] `recuperer_donnees.ps1` exécuté
- [ ] Backend redémarré
- [ ] Vérification : Voir toutes les réclamations dans l'interface admin

---

## 💡 Astuce

Pour éviter les conflits, établissez une règle :
- **Une seule personne modifie les données à la fois**
- **Toujours exporter et push après modification**
- **Toujours pull avant de commencer à travailler**

---

## 🎉 Résultat Final

Maintenant :
- ✅ Tous les membres voient les mêmes données
- ✅ Les modifications sont synchronisées via Git
- ✅ Interface admin avec vue globale par défaut
- ✅ Scripts automatiques pour faciliter la synchronisation

