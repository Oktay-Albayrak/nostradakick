# Liste complète des endpoints NostradaKick

## 1. Authentification et sécurité

| Méthode | Route | Rôle | Description |
| --- | --- | --- | --- |
| POST | /api/auth/register | Visiteur | Inscription. |
| POST | /api/auth/login | Visiteur | Connexion. Retourne les tokens d'authentification et pose les cookies nécessaires. |
| POST | /api/auth/refresh | Visiteur | Génère un nouvel access token via le refresh token. |
| POST | /api/auth/logout | Membre | Déconnexion. Supprime le refresh token côté serveur et efface les cookies d'authentification. |
| GET | /api/auth/me | Membre | Récupère les informations de l'utilisateur connecté. |

## 2. Gestion des utilisateurs

| Méthode | Route | Rôle | Description |
| --- | --- | --- | --- |
| GET | /api/users | Admin | Liste de tous les utilisateurs. |
| GET | /api/users/:username | Visiteur | Voir le profil public et les statistiques d'un joueur. |
| PATCH | /api/users/:id | Membre | Modifier ses propres informations après contrôle d'authentification et de propriété. |
| DELETE | /api/users/:id | Admin | Supprimer un utilisateur. |

## 3. Compétitions

| Méthode | Route | Rôle | Description |
| --- | --- | --- | --- |
| GET | /api/competitions | Visiteur | Liste toutes les compétitions disponibles. Supporte la recherche via `?q=`. |
| POST | /api/competitions | Admin | Ajouter une compétition manuelle. |

## 4. Matchs

| Méthode | Route | Rôle | Description |
| --- | --- | --- | --- |
| GET | /api/matches | Visiteur | Liste des matchs avec filtres éventuels sur la date ou la compétition. |
| GET | /api/matches/:id | Visiteur | Détails d'un match. |
| POST | /api/matches | Admin | Créer un match manuel pour une compétition. |
| PATCH | /api/matches/:id | Admin | Mise à jour partielle d'un match (score, date, statut, mise en avant). |
| DELETE | /api/matches/:id | Admin | Supprimer un match. |

## 5. Pronostics

| Méthode | Route | Rôle | Description |
| --- | --- | --- | --- |
| GET | /api/predictions | Visiteur | Lister tous les pronostics, ou récupérer celui d'un utilisateur pour un match via les query params user_id et match_id. |
| GET | /api/predictions/:id | Visiteur | Consulter un pronostic par son identifiant. |
| POST | /api/predictions | Membre | Crée ou met à jour le pronostic d'un utilisateur pour un match via upsert. Retour attendu : 200 OK. |
| DELETE | /api/predictions/:id | Membre | Supprimer un pronostic après contrôle d'authentification et de propriété. |

## 6. Équipes

| Méthode | Route | Rôle | Description |
| --- | --- | --- | --- |
| GET | /api/teams | Visiteur | Rechercher des équipes via `?q=` et `?limit=`. |
| POST | /api/teams | Admin | Ajouter une équipe manuelle. |

## 7. Recherche

| Méthode | Route | Rôle | Description |
| --- | --- | --- | --- |
| GET | /api/search/suggestions | Visiteur | Suggestions de recherche globale (`?q=`, min 3 caractères) : équipes, compétitions, matchs à venir. |

## 8. Administration

| Méthode | Route | Rôle | Description |
| --- | --- | --- | --- |
| GET | /api/admin/stats | Admin | Statistiques globales de la plateforme (nombre d'utilisateurs, pronostics, matchs, compétitions). |

## 9. Santé du service

| Méthode | Route | Rôle | Description |
| --- | --- | --- | --- |
| GET | /api/health | Visiteur | Vérification du bon fonctionnement du serveur (status, IP, date, headers). |

---

L'architecture hybride a été conçue pour garantir la pérennité du service : elle permet de synchroniser automatiquement les données via une API tierce tout en offrant une interface d'administration manuelle pour pallier les limitations des plans gratuits, comme l'absence de certaines compétitions internationales, ou pour gérer des événements sportifs spécifiques.
