# Audit de sécurité — NostradaKick

> ⚠️ **Document en cours de rédaction**

> Audit auto-réalisé en environnement local.

> Démarrage prévu : courant juin 2026

## 1. Contexte et scope

### Objectif
Audit de sécurité applicative auto-réalisé pour identifier les vulnérabilités potentielles du projet NostradaKick et documenter une démarche défensive.

### Périmètre testé
- **Backend** : API Express (en local sur `localhost:4000`)
- **Frontend** : Next.js (en local sur `localhost:3000`)
- **Base de données** : PostgreSQL local

### ⚠️ Note importante — Tests en local uniquement
Conformément aux CGU de Vercel et Render et à la législation française sur les tests d'intrusion (article 323-1 du Code pénal), **aucun test n'est réalisé sur l'environnement de production**. L'audit se déroule exclusivement sur une instance locale de l'application.

## 2. Méthodologie

### Outils utilisés
- **Burp Suite Community Edition** (proxy + intruder + scanner manuel)
- **OWASP Top 10 (2023)** comme checklist de référence
- **Lecture manuelle du code source** (focus auth, validations, autorisations)

### Démarche
1. Reconnaissance du périmètre (routes API, endpoints publics/protégés)
2. Tests d'authentification (brute force, JWT manipulation, refresh token)
3. Tests d'autorisation (BOLA, élévation de privilèges, IDOR)
4. Tests d'injection (SQL via Prisma, XSS, command injection)
5. Tests de configuration (headers HTTP, cookies, CORS)
6. Synthèse et recommandations

## 3. Findings

> _Section à compléter au fur et à mesure de l'audit._

### Format de chaque finding

```
[SEVERITY: HIGH/MEDIUM/LOW/INFO] Titre de la vulnérabilité

- Description :
- Reproduction :
- Impact :
- Recommandation :
- Statut : Open / Mitigated / Closed
```


### [SEVERITY: LOW] Suppression d'utilisateur bloquée par contrainte FK

- **Description** : La table `RefreshToken` référence `User.id` sans `onDelete: Cascade`. Toute tentative de suppression d'un utilisateur via Prisma échoue avec une violation de contrainte de clé étrangère.
- **Reproduction** : Tentative de suppression d'un user avec des refresh tokens actifs → erreur Postgres.
- **Impact** : 
  - Fonctionnalité admin cassée (DeleteUserButton inopérant)
  - Conformité RGPD impactée (droit à l'oubli impossible techniquement)
- **Recommandation** : Ajouter `onDelete: Cascade` sur toutes les relations FK pointant vers User, créer une migration Prisma. Alternative : implémenter un soft delete (champ `deleted_at`) plus respectueux du RGPD.
- **Statut** : Open (identifié, non corrigé)



## 4. Points positifs identifiés

> _Section à compléter._

## 5. Conclusion

> _Section à compléter à la fin de l'audit._

---

**Auteur** : Oktay Albayrak

**Date de démarrage** : courant juin 2026

**Date de mise à jour** : _en cours_
