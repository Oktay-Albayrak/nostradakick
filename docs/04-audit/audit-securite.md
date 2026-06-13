# Audit de sécurité — NostradaKick

> ⚠️ **Document en cours de rédaction** — démarche d'apprentissage personnel, non complète. Audit auto-réalisé en environnement local.

## 1. Contexte et scope

### Objectif
Démarche d'apprentissage personnel en sécurité applicative, dans le cadre de ma reconversion vers la cybersécurité offensive. L'objectif est de mettre en pratique les méthodes et outils de base d'un audit (scan automatisé, revue de code, test manuel ciblé) sur mon propre projet de fin de formation.

Cet audit n'est **pas un livrable professionnel** — c'est un exercice pédagogique limité en profondeur et en scope.

### Périmètre testé
- **Backend** : API Express (en local sur `localhost:4000`)
- **Frontend** : Next.js (en local sur `localhost:3000`)
- **Base de données** : PostgreSQL local

### ⚠️ Note importante — Tests en local uniquement
Conformément aux CGU de Vercel et Render et à la législation française sur les tests d'intrusion (article 323-1 du Code pénal), **aucun test n'est réalisé sur l'environnement de production**. L'audit se déroule exclusivement sur une instance locale de l'application.

## 2. Méthodologie

### Outils utilisés
- **OWASP ZAP** — scan automatisé (passif + actif) après navigation manuelle authentifiée
- **Burp Suite Community Edition** — test manuel ciblé (Repeater)
- **Lecture manuelle du code source** — focus authentification, autorisations, validations

### Démarche (3 couches)
1. **Reconnaissance et scan automatisé** : cartographie des endpoints avec ZAP, scoping par technologie (PostgreSQL + Next.js + React + JavaScript), scan actif avec analyse des en-têtes HTTP, cookies et structure des réponses.
2. **Test manuel ciblé** : validation d'un point d'autorisation critique via Burp Repeater (test IDOR sur `POST /api/predictions`).
3. **Revue de code orientée sécurité** : lecture des contrôleurs sensibles (auth, prédictions, admin), vérification des middlewares de protection, contrôle de l'usage des secrets et de la validation des entrées.

### Référentiel
- **OWASP Top 10 (2025)** comme grille de lecture des findings

## 3. Findings

> _Section à compléter au fur et à mesure de l'audit._

### Format de chaque finding

```
[SEVERITY: HIGH/MEDIUM/LOW/INFO] Titre de la vulnérabilité

	•	Description :
	•	Reproduction / preuve :
	•	Impact :
	•	Mapping OWASP :
	•	Recommandation :
	•	Statut : Open / Mitigated / Closed
```



### [SEVERITY: LOW] Suppression d'utilisateur bloquée par contrainte FK

- **Description** : La table `RefreshToken` référence `User.id` sans `onDelete: Cascade`. Toute tentative de suppression d'un utilisateur via Prisma échoue avec une violation de contrainte de clé étrangère.
- **Reproduction** : Tentative de suppression d'un user avec des refresh tokens actifs → erreur Postgres (Foreign Key violation).
- **Impact** :
  - Fonctionnalité admin cassée (DeleteUserButton inopérant)
  - Conformité RGPD impactée (droit à l'oubli impossible techniquement)
- **Mapping OWASP** : A04:2025 — Insecure Design (cycle de vie utilisateur non couvert par le schéma de données)
- **Recommandation** : Ajouter `onDelete: Cascade` sur toutes les relations FK pointant vers User, créer une migration Prisma. Alternative : implémenter un soft delete (champ `deleted_at`) plus respectueux du RGPD.
- **Statut** : Open (identifié, non corrigé)

## 4. Points positifs identifiés

> _Section à compléter._

## 5. Conclusion

> _Section à compléter à la fin de l'audit._

---

**Auteur** : Oktay Albayrak

**Statut** : audit en cours (juin 2026)

**Date de mise à jour** : _en cours_
