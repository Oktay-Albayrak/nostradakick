Analyse des risques

Problèmes d’intégration de l’API Football-Data: L’API peut changer de structure, être indisponible ou limiter les appels.
=> Vérifier la documentation et les limitations de l’API, message d’erreur si données indisponible

Problèmes de compatibilité navigateur: Certaines fonctionnalités ne fonctionnent pas sur des versions anciennes.
=> Définir les versions minimales supportées (Chrome, Firefox, Edge, Safari. Tester les pages sur mobile et desktop.

Erreurs ou incohérences dans la base de données: Certaines données peuvent être mal enregistrées dans la BDD.
=> Mettre en place des tests unitaires

Fuites de données utilisateurs: Emails, mots de passe, pronostics exposés.
=>Stocker les mots de passe hashés (Argon2 uniquement). Protéger les routes sensibles (cookies httpOnly, JWT). Utiliser HTTPS pour toutes les communications

Injection SQL ou manipulation BDD: Un utilisateur malveillant pourrait modifier les données.
=> Utiliser Prisma pour les requêtes paramétrées. Validation côté serveur des entrées utilisateur

Exposition clé API Football-Data: L’API pourrait être utilisée par des tiers.
=> Stocker la clé dans `.env` côté serveur uniquement. Ne jamais exposer la clé dans le frontend

Problèmes de collaboration: Conflits de version ou mauvaise organisation.
=> Utiliser un système de versionning (Git). Définir des règles de commits et de branches. Réunions régulières de suivi.

Données incorrectes (matchs ou résultats): Les pronostics et points peuvent être faux.
=>Vérifier les données API et les valider côté serveur. Mettre à jour les points uniquement après validation des résultats.