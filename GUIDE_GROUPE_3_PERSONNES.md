# 👥 Guide pour Groupe de 3 Personnes - Synchronisation Base de Données

## 🎯 Situation Actuelle

- ✅ **Frontend/Backend** : Fonctionne (cloné depuis Git)
- ❌ **Base de données Oracle** : Chaque PC a sa propre base locale
- ❌ **Problème** : Les données ne sont pas synchronisées entre les 3 PC

## 🔍 Pourquoi le Problème Existe

```
PC 1 (Membre 1)          PC 2 (Membre 2)          PC 3 (Membre 3)
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ Oracle      │         │ Oracle      │         │ Oracle      │
│ localhost   │         │ localhost   │         │ localhost   │
│             │         │             │         │             │
│ Base PC 1   │         │ Base PC 2   │         │ Base PC 3   │
│ (Données    │         │ (Données    │         │ (Données    │
│  différentes)│         │  différentes)│         │  différentes)│
└─────────────┘         └─────────────┘         └─────────────┘
```

**Chaque PC utilise `localhost`** → Chacun a sa propre base Oracle isolée.

---

## 🎯 Solutions Possibles

### Solution 1 : Base de Données Partagée (Recommandée pour Production)

**Un seul PC sert de serveur Oracle, les 2 autres se connectent à distance.**

#### Avantages
- ✅ Tous voient les mêmes données en temps réel
- ✅ Pas de synchronisation manuelle
- ✅ Une seule source de vérité

#### Inconvénients
- ❌ Nécessite que tous soient sur le même réseau (Wi-Fi)
- ❌ Le PC serveur doit être allumé pour que les autres fonctionnent

#### Configuration

**Étape 1 : Choisir le PC Serveur**
- Le PC qui a déjà toutes les données (probablement le tien)
- Ou un PC dédié qui reste allumé

**Étape 2 : Configurer le Serveur**
1. Vérifier l'IP du PC serveur :
   ```powershell
   ipconfig
   # Note l'adresse IPv4 (ex: 192.168.1.100)
   ```

2. Configurer le firewall (port 1521) :
   ```powershell
   New-NetFirewallRule -DisplayName "Oracle Database" -Direction Inbound -LocalPort 1521 -Protocol TCP -Action Allow
   ```

3. Vérifier le listener Oracle :
   ```powershell
   lsnrctl status
   ```

**Étape 3 : Configurer les PC Clients (2 autres membres)**

Sur chaque PC client, modifier `backend/.env` :

```env
# AVANT (local)
ORACLE_HOST=localhost

# APRÈS (serveur distant)
ORACLE_HOST=192.168.1.100  # IP du PC serveur
ORACLE_PORT=1521
ORACLE_SERVICE=XEPDB1
ORACLE_USER=SGRE_USER
ORACLE_PASSWORD=12345
```

**Étape 4 : Tester la Connexion**

Sur chaque PC client :
```bash
node test_connexion_backend.js
```

---

### Solution 2 : Export/Import Manuel (Si pas sur le même réseau)

**Synchroniser manuellement les données via Git ou fichier partagé.**

#### Processus

**1. Sur le PC qui a les données à jour (PC Serveur)**

Exporter les données :
```powershell
.\exporter_donnees.ps1
```

Cela crée : `oracle/export_donnees_complet.sql`

**2. Ajouter le fichier à Git (Optionnel)**

```bash
git add oracle/export_donnees_complet.sql
git commit -m "Mise à jour des données Oracle"
git push
```

**3. Sur les autres PC**

```bash
# Récupérer le fichier depuis Git
git pull

# Importer les données
.\importer_donnees.ps1
```

#### Avantages
- ✅ Fonctionne même si pas sur le même réseau
- ✅ Utilise Git (déjà en place)
- ✅ Simple à comprendre

#### Inconvénients
- ❌ Synchronisation manuelle nécessaire
- ❌ Pas en temps réel
- ❌ Risque de conflits si plusieurs personnes modifient

---

### Solution 3 : Synchronisation Automatique via Git (Hybride)

**Combiner Git + Scripts automatiques pour faciliter la synchronisation.**

#### Processus Automatisé

**1. Script de Synchronisation (à créer)**

Chaque membre peut exécuter :
```powershell
.\synchroniser_donnees.ps1
```

Ce script :
- Exporte les données locales
- Commit et push vers Git
- Les autres membres pull et importent

**2. Workflow Recommandé**

```
Membre 1 (Modifie données)
  ↓
Export → Git Push
  ↓
Membre 2 & 3 : Git Pull → Import
  ↓
Tous synchronisés
```

---

## 📋 Plan d'Action Recommandé

### Option A : Si vous êtes sur le même réseau Wi-Fi

**Mettre en place une Base Partagée** (Solution 1)

1. **Désigner un PC Serveur** (celui qui a déjà toutes les données)
2. **Configurer le serveur** (firewall, IP)
3. **Modifier `.env` sur les 2 autres PC** pour pointer vers le serveur
4. **Tester** la connexion

**Résultat** : Tous voient les mêmes données en temps réel ! ✅

---

### Option B : Si vous n'êtes pas sur le même réseau

**Utiliser Export/Import via Git** (Solution 2)

1. **Créer un workflow** :
   - Le membre qui modifie exporte les données
   - Push le fichier `export_donnees_complet.sql` vers Git
   - Les autres membres pull et importent

2. **Créer un script automatique** pour faciliter :
   ```powershell
   .\synchroniser_donnees.ps1
   ```

**Résultat** : Synchronisation via Git, simple et efficace ! ✅

---

## 🛠️ Scripts à Créer

### Script 1 : `synchroniser_donnees.ps1`

Pour automatiser l'export + push vers Git :

```powershell
# Exporter les données
.\exporter_donnees.ps1

# Ajouter à Git
git add oracle/export_donnees_complet.sql
git commit -m "Mise à jour données Oracle - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push

Write-Host "✅ Données synchronisées vers Git !" -ForegroundColor Green
```

### Script 2 : `recuperer_donnees.ps1`

Pour automatiser le pull + import depuis Git :

```powershell
# Récupérer depuis Git
git pull

# Importer les données
.\importer_donnees.ps1

Write-Host "✅ Données récupérées depuis Git !" -ForegroundColor Green
```

---

## 📊 Comparaison des Solutions

| Critère | Base Partagée | Export/Import Git |
|---------|---------------|-------------------|
| **Temps réel** | ✅ Oui | ❌ Non |
| **Réseau requis** | ✅ Oui | ❌ Non |
| **Complexité** | ⚠️ Moyenne | ✅ Simple |
| **Maintenance** | ✅ Faible | ⚠️ Moyenne |
| **Conflits** | ⚠️ Faible | ❌ Élevé |

---

## 🎯 Recommandation Finale

### Pour le Développement (Maintenant)

**Si vous êtes sur le même Wi-Fi** :
- ✅ **Base Partagée** (Solution 1)
- Un PC serveur, les 2 autres clients
- Tous voient les mêmes données en temps réel

**Si vous n'êtes pas sur le même réseau** :
- ✅ **Export/Import via Git** (Solution 2)
- Workflow : Export → Git Push → Git Pull → Import
- Synchronisation manuelle mais simple

### Pour la Production (Plus tard)

- ✅ **Base Partagée** sur un serveur dédié
- Tous les PC sont des clients
- Une seule source de vérité

---

## 🚀 Action Immédiate

**Dis-moi :**
1. **Êtes-vous sur le même réseau Wi-Fi ?** (Oui/Non)
2. **Quel PC a déjà toutes les données ?** (PC 1, 2 ou 3)
3. **Quelle solution préférez-vous ?**

Ensuite, je t'aide à configurer la solution choisie ! 🎯

