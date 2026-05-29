# Dictionnaire de données `NostradaKick`

- Logique métier pensée et optimisée pour `PostgreSQL`.
- Les relations sont gérées par des clés étrangères avec intégrité référentielle.

## Pour toutes les tables

- `id` correspond à une clé primaire de type `UUID` quand la table en possède une.
- `GENERATED` correspond à une génération automatique côté base ou ORM.
- `created_at` existe sur toutes les tables sauf `user_stat` et `standing`.
- `updated_at` existe sur toutes les tables sauf `refresh_token` où le champ métier de suivi est `expires_at`.

## Table `user`

|Nom du champ|Type|UNIQUE|NON NULL|PK|FK|Exemple|Par défaut|Description|
|---|---|---|---|---|---|---|---|---|
|`id`|`UUID`|✅|✅|✅||`b148aab2-5a03-4d96-a119-c32fc8a4bfaa`|`GENERATED`|Identifiant unique de l'utilisateur|
|`username`|`VARCHAR(50)`|✅|✅|❌||`arthuro`||Pseudonyme de l'utilisateur|
|`email`|`VARCHAR(255)`|✅|✅|❌||`arthur@gmail.com`||Email de l'utilisateur|
|`password_hash`|`TEXT`|❌|✅|❌||`$argon2id$...`||Mot de passe haché de l'utilisateur|
|`role`|`ENUM`|❌|✅|❌||`MEMBER`|`MEMBER`|Rôle de l'utilisateur|
|`avatar_url`|`TEXT`|❌|❌|❌||`https://img.com/image.png`|`NULL`|Avatar de l'utilisateur|
|`created_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-01-10T12:00:00Z`|`now()`|Date de création|
|`updated_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-01-10T12:00:00Z`|`updatedAt`|Date de mise à jour|

- `role ENUM` = `MEMBER` | `ADMIN`

## Table `user_stat`

|Nom du champ|Type|UNIQUE|NON NULL|PK|FK|Exemple|Par défaut|Description|
|---|---|---|---|---|---|---|---|---|
|`user_id`|`UUID`|✅|✅|✅|✅ `user.id`|||Référence à `user.id`|
|`wins_count`|`INTEGER`|❌|✅|❌||`15`|`0`|Nombre de pronostics gagnants|
|`losses_count`|`INTEGER`|❌|✅|❌||`10`|`0`|Nombre de pronostics perdants|
|`best_streak`|`INTEGER`|❌|✅|❌||`2`|`0`|Meilleure série de réussite|

- Table dérivée, recalculée automatiquement.
- Suppression en cascade si l'utilisateur référencé est supprimé.

## Table `prediction`

|Nom du champ|Type|UNIQUE|NON NULL|PK|FK|Exemple|Par défaut|Description|
|---|---|---|---|---|---|---|---|---|
|`id`|`UUID`|✅|✅|✅||`b148aab2-5a03-4d96-a119-c...`|`GENERATED`|Identifiant unique du pronostic|
|`prediction_value`|`ENUM`|❌|✅|❌||`HOME`||Choix du pronostic|
|`status`|`ENUM`|❌|✅|❌||`PENDING`|`PENDING`|État du pronostic|
|`user_id`|`UUID`|❌|✅|❌|✅ `user.id`|||Référence à `user.id`|
|`match_id`|`UUID`|❌|✅|❌|✅ `match.id`|||Référence à `match.id`|
|`created_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-02-05T18:00:00Z`|`now()`|Date de création|
|`updated_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-02-05T18:10:00Z`|`updatedAt`|Date de mise à jour|

- `prediction_value ENUM` = `HOME` | `DRAW` | `AWAY`
- Correspondance UI : `1 = HOME`, `N = DRAW`, `2 = AWAY`
- `status ENUM` = `PENDING` | `WON` | `LOST` | `CANCELLED`
- Contrainte UNIQUE composite : (`user_id`, `match_id`)
- Suppression en cascade si l'utilisateur ou le match référencé est supprimé.

## Table `competition_team`

|Nom du champ|Type|UNIQUE|NON NULL|PK|FK|Exemple|Par défaut|Description|
|---|---|---|---|---|---|---|---|---|
|`team_id`|`UUID`|❌|✅|✅|✅ `team.id`|||Référence à `team.id`|
|`competition_id`|`UUID`|❌|✅|✅|✅ `competition.id`|||Référence à `competition.id`|
|`created_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-01-15T10:00:00Z`|`now()`|Date de création de l'association|
|`updated_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-01-15T10:00:00Z`|`updatedAt`|Date de mise à jour de l'association|

## Table `team`

|Nom du champ|Type|UNIQUE|NON NULL|PK|FK|Exemple|Par défaut|Description|
|---|---|---|---|---|---|---|---|---|
|`id`|`UUID`|✅|✅|✅||`b148aab2-5a03-4d96-a119-c32...`|`GENERATED`|Identifiant unique de l'équipe|
|`api_id`|`INTEGER`|✅|❌|❌||`1`|`NULL`|Identifiant dans l'API externe|
|`name`|`TEXT`|✅|✅|❌||`Racing Club de Lens`||Nom complet de l'équipe|
|`short_name`|`TEXT`|❌|❌|❌||`Lens`|`NULL`|Nom court de l'équipe|
|`tla`|`VARCHAR(6)`|❌|✅|❌||`RCL`||Sigle de l'équipe|
|`crest_url`|`TEXT`|❌|✅|❌||`https://crests.football-data.org/546.png`||Logo de l'équipe|
|`country`|`TEXT`|❌|✅|❌||`France`||Pays de l'équipe|
|`created_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-01-15T10:00:00Z`|`now()`|Date de création|
|`updated_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-01-15T10:00:00Z`|`updatedAt`|Date de mise à jour|

## Table `competition`

|Nom du champ|Type|UNIQUE|NON NULL|PK|FK|Exemple|Par défaut|Description|
|---|---|---|---|---|---|---|---|---|
|`id`|`UUID`|✅|✅|✅||`b148aab2-5a03-4d96-a119-c32...`|`GENERATED`|Identifiant unique de la compétition|
|`api_id`|`INTEGER`|✅|❌|❌||`3`|`NULL`|Identifiant dans l'API externe|
|`name`|`TEXT`|✅|✅|❌||`Ligue 1`||Nom de la compétition|
|`code`|`VARCHAR(10)`|❌|❌|❌||`FL1`|`NULL`|Code de la compétition|
|`emblem_url`|`TEXT`|❌|✅|❌||`https://crests.football-data.org/FL1.png`||Logo de la compétition|
|`country`|`TEXT`|❌|✅|❌||`France`||Pays de la compétition|
|`created_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-01-15T10:00:00Z`|`now()`|Date de création|
|`updated_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-01-15T10:00:00Z`|`updatedAt`|Date de mise à jour|

## Table `standing`

|Nom du champ|Type|UNIQUE|NON NULL|PK|FK|Exemple|Par défaut|Description|
|---|---|---|---|---|---|---|---|---|
|`id`|`UUID`|✅|✅|✅||`e1c4...`|`GENERATED`|Identifiant unique du classement|
|`rank`|`INTEGER`|❌|✅|❌||`1`||Position de l'équipe dans la compétition|
|`team_id`|`UUID`|❌|✅|❌|✅ `team.id`|||Référence à l'équipe classée|
|`competition_id`|`UUID`|❌|✅|❌|✅ `competition.id`|||Référence à la compétition|
|`updated_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-02-05T18:00:00Z`|`updatedAt`|Date de mise à jour|

- Contrainte UNIQUE composite : (`team_id`, `competition_id`)

## Table `match`

|Nom du champ|Type|UNIQUE|NON NULL|PK|FK|Exemple|Par défaut|Description|
|---|---|---|---|---|---|---|---|---|
|`id`|`UUID`|✅|✅|✅||`b148aab2-5a03-4d96-a119-c32...`|`GENERATED`|Identifiant du match|
|`api_id`|`INTEGER`|✅|❌|❌||`552`|`NULL`|Identifiant du match dans l'API externe|
|`date`|`TIMESTAMPTZ`|❌|✅|❌||`2026-02-05T20:45:00Z`||Date et heure du match|
|`status`|`ENUM`|❌|✅|❌||`SCHEDULED`|`SCHEDULED`|Statut du match|
|`venue`|`TEXT`|❌|❌|❌||`Stade Bollaert`|`NULL`|Lieu du match|
|`home_score`|`INTEGER`|❌|❌|❌||`3`|`NULL`|Score de l'équipe à domicile|
|`away_score`|`INTEGER`|❌|❌|❌||`1`|`NULL`|Score de l'équipe à l'extérieur|
|`home_team_id`|`UUID`|❌|✅|❌|✅ `team.id`|||Référence à l'équipe à domicile|
|`away_team_id`|`UUID`|❌|✅|❌|✅ `team.id`|||Référence à l'équipe à l'extérieur|
|`competition_id`|`UUID`|❌|✅|❌|✅ `competition.id`|||Référence à la compétition|
|`is_featured`|`BOOLEAN`|❌|✅|❌||`false`|`false`|Indique si le match est mis en avant|
|`featured_name`|`TEXT`|❌|❌|❌||`Affiche du week-end`|`NULL`|Nom éditorial du match mis en avant|
|`popularity`|`INTEGER`|❌|✅|❌||`0`|`0`|Nombre de pronostics enregistrés pour le match|
|`created_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-02-01T10:00:00Z`|`now()`|Date de création|
|`updated_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-02-01T10:00:00Z`|`updatedAt`|Date de mise à jour|

- `status ENUM` = `SCHEDULED` | `TIMED` | `IN_PLAY` | `PAUSED` | `FINISHED` | `SUSPENDED` | `POSTPONED` | `CANCELLED` | `AWARDED`

## Table `refresh_token`

|Nom du champ|Type|UNIQUE|NON NULL|PK|FK|Exemple|Par défaut|Description|
|---|---|---|---|---|---|---|---|---|
|`id`|`UUID`|✅|✅|✅||`8de5...`|`GENERATED`|Identifiant unique du refresh token|
|`token`|`TEXT`|❌|✅|❌||`QmFzZTY0...`||Jeton opaque stocké côté serveur|
|`created_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-02-01T10:00:00Z`|`now()`|Date de création|
|`expires_at`|`TIMESTAMPTZ`|❌|✅|❌||`2026-02-08T10:00:00Z`|`updatedAt`|Date d'expiration du refresh token|
|`user_id`|`UUID`|❌|✅|❌|✅ `user.id`|||Référence à l'utilisateur propriétaire|
