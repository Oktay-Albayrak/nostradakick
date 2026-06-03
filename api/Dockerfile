FROM node:24-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le schema Prisma pour la génération
COPY prisma ./prisma/

# Générer le client Prisma
RUN npx prisma generate

# Copier le reste du code
COPY . .

# Exposer le port
EXPOSE 4000

# La commande sera définie dans docker-compose.yml
CMD ["npm", "run", "dev"]