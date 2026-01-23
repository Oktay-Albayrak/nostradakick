# 🐳 Environnement de développement Docker

Ce projet utilise **Docker Compose** pour lancer :

- une base de données PostgreSQL
- une API Node.js (Express + Prisma)
- un client Next.js

## 🚀 Démarrage du projet

### Lancer tous les services

Pour la première fois

```bash
docker-compose up --build
```

Sinon

```bash
docker-compose up
```

Stopper les conteneurs

```bash
docker-compose down
```

Stopper + supprimer les volumes (⚠️ perte des données)

```bash
docker-compose down -v
```

Lancer une commande spécifique lorsque les services sont lancés

```bash
docker-compose exec <service> <commande>
```

Par exemple:

```bash
docker-compose exec api npx prisma studio
```
