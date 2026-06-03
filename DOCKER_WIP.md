# 🐳 Docker Setup — Work In Progress

Cette branche contient une **tentative de containerisation** du projet, basée sur le travail initial de Benjamin (membre de l'équipe d'origine).

## ⚠️ Statut : NON FINALISÉ

Cette configuration n'a **pas été testée** dans son état actuel et nécessite plusieurs ajustements avant d'être fonctionnelle.

## 📋 Points à finaliser

### Code
- [ ] **Incompatibilité Prisma** : le code actuel utilise `@prisma/adapter-neon` (WebSockets pour Neon serverless), incompatible avec un Postgres local en Docker. Solutions possibles :
  - Pointer `DATABASE_URL` vers Neon depuis Docker (BDD distante)
  - Adapter dynamique selon l'environnement (Neon en prod, adapter `pg` classique en local)
  - Refacto complet vers Prisma sans driver adapter

### Démarrage manuel après le premier `docker compose up`

```bash
# Seed initial
docker compose exec api npm run db:seed

# Synchronisation initiale football-data
docker compose exec api npm run sync
```

## 🚀 Lancement (une fois finalisé)

```bash
# Construction et démarrage
docker compose up --build
```

## 👤 Travail initial

Setup Docker initié par Benjamin (Lead Front-end de l'équipe d'origine), repris pour finalisation dans le cadre de l'apprentissage personnel de la containerisation.