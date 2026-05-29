| Point vérifié | Ce que disait la doc au départ | Preuve (où on le voit) | Implémentation finale (constat) |
|---|---|---|---|
| Code HTTP du pronostic | `POST /predictions` → 201 (création) | `predictions.controller.ts` + capture REST Client | Upsert (create/update) → **200 OK** |
| Valeur stockée pour un pronostic | 1 / N / 2 | `schema.prisma` (enum) | **HOME / DRAW / AWAY** |
| Stockage du mot de passe | `password` | `schema.prisma` + auth (argon2) | **password_hash** (mot de passe haché) |
| Méthode HTTP update match | `PUT /api/matches/:id` | `matches.routes.ts` | **PATCH** (mise à jour partielle) |
| Endpoints compétitions | `PUT` + `DELETE /competitions/:id` documentés | `competitions.routes.ts` | **Non implémentés** (gestion via sync API uniquement) |
| Endpoints absents de la doc initiale | — | `teams.routes.ts`, `search.routes.ts`, `admin.routes.ts`, `index.routes.ts` | Ajoutés en code : `GET/POST /teams`, `GET /search/suggestions`, `GET /admin/stats`, `GET /health` |
| Champs Match additionnels | MLD sans `is_featured`, `featured_name`, `popularity` | `schema.prisma` + `feature-logic.service.ts` | **Ajoutés en code** (mise en avant éditoriale + compteur pronostics) |
| Cascade delete `competition_team` | Non spécifié dans la doc | `schema.prisma` (CompetitionTeam) | **Absent du schéma** — risque d'enregistrements orphelins si team/compétition supprimée |
| Algorithme de hash | "bcrypt" (analyse des risques) | `auth.controller.ts` + `package.json` | **Argon2 uniquement** (winner Password Hashing Competition, recommandé OWASP) |