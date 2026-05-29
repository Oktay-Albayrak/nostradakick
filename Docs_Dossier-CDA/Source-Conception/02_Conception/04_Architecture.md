# Architecture technique

1. Environnement Node.js
Pourquoi ?
    • Unifié et performant : Node.js permet de gérer à la fois le frontend (via Next.js) et le backend (via Express) avec un seul langage (JavaScript/TypeScript), simplifiant la maintenance et la collaboration entre les équipes front et back.
    • Écosystème riche : Idéal pour les applications temps réel (notifications, mises à jour de scores, interactions communautaires), grâce à sa gestion asynchrone et ses nombreuses librairies (ex: Socket.io pour le chat futur).

2. Rendu SSR (Server Side Rendering) avec Next.js
Pourquoi ?
    • SEO optimisé : Le SSR permet aux moteurs de recherche d’indexer facilement le contenu dynamique (pronostics, profils, matchs), crucial pour attirer des utilisateurs via des recherches comme "pronostics Ligue 1 2026" ou "meilleurs pronostiqueurs football".
    • Expérience utilisateur fluide : Les pages se chargent rapidement, même avec du contenu dynamique.
    • Routing natif : Next.js offre un système de routage intégré simplifiant la navigation et améliorant l’accessibilité, en phase avec les user stories.

3. Frontend : React (via Next.js) + HTML/CSS
Pourquoi ?
    • React (version 19) :
        ◦ Composants réutilisables : Idéal pour créer des interfaces modulaires (ex: cartes de matchs, profils utilisateurs, tableaux de classement).
        ◦ Gestion d’état : Facilite la mise à jour en temps réel des pronostics, scores et notifications.
    • HTML/CSS :
        ◦ Accessibilité : Structure sémantique pour les utilisateurs avec des besoins spécifiques (ex: lecteurs d’écran pour les malvoyants).
        ◦ Responsive design : Adaptation aux mobiles, tablettes et desktop, cruciale pour toucher tous les profils cibles.

4. Backend : TypeScript + Express + PostgreSQL + Prisma
TypeScript
    • Robustesse : Détection précoce des erreurs réduisant les bugs en production.
    • Maintenabilité : Code plus lisible et documenté.
Express
    • API RESTful : Parfait pour créer des endpoints clairs, alignés avec les besoins de l’application (récupération des matchs, soumission de pronostics).
    • Middlewares : Gestion centralisée de l’authentification (JWT), de la validation des données avec Zod, et des logs, en phase avec les user stories admin (ex: réinitialisation de mot de passe).
PostgreSQL
    • Données relationnelles : Modélisation naturelle des relations entre utilisateurs, pronostics, matchs et compétitions.
    • Scalabilité : Supporte une croissance du nombre d’utilisateurs et de données.
Prisma
    • ORM moderne : Simplifie les interactions avec PostgreSQL en évitant d’écrire du SQL brut.
    • Migrations : Gestion versionnée des changements de schéma, avec prise en charge des contraintes composites, des relations et des suppressions en cascade.

5. Authentification : JWT
Pourquoi ?
    • Sécurité : Protège les données sensibles (pronostics privés, profils) et prévient les attaques courantes. Les mots de passe sont hachés avec Argon2 (recommandé OWASP, résistant aux attaques GPU).
    • Stateless : Idéal pour une application scalable, évitant de stocker des sessions côté serveur.
    • Flexibilité : Permet d’ajouter des rôles (admin, membre) et des permissions.

6. API Externe : Football-Data
Pourquoi ?
    • Données fiables : Accès aux calendriers, résultats et statistiques officiels des championnats (Ligue 1, Premier League, etc.), essentiels pour :
        ◦ Afficher les matchs à pronostiquer (MVP).
        ◦ Calculer automatiquement les points des utilisateurs (bonus pour les pronostics justes).
        ◦ Alimenter les fonctionnalités futures (calendrier des compétitions, historique des saisons).
    • Mises à jour automatiques : Pas besoin de saisir manuellement les résultats, réduisant la charge administrative.
