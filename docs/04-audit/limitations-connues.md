# Limitations connues du projet

Ce document liste les limitations identifiées dans le projet NostradaKick. Toutes ces limitations sont **conscientes** et résultent de choix de priorisation dans le cadre du projet école (~18 jours de développement effectifs).

---

## 🔐 Sécurité backend

### Authentification & autorisation
- **Pas de rate limiting** sur les routes `/api/auth/login`, `/api/auth/register` et `/api/auth/refresh`.
  - Vulnérabilité au brute force de mot de passe.
  - **Solution** : middleware `express-rate-limit` (15 tentatives par 15min par IP).

- **Pas de Helmet** (sécurité headers HTTP).
  - Recommandations OWASP non couvertes (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, etc.).
  - **Solution** : middleware `helmet`.

- **Pas de logs de sécurité structurés** pour audit.
  - Aucune traçabilité des tentatives d'auth, des actions admin, des modifications sensibles.
  - **Solution** : Winston ou Pino avec niveaux de log par criticité.

### Mesures de sécurité présentes ✅
- Validation Zod sur toutes les routes
- Protection injection SQL native via Prisma ORM
- Échappement XSS par Next.js natif côté front
- Hash Argon2 pour les mots de passe
- JWT 1h + refresh token opaque 7j avec rotation
- Cookies `httpOnly` + `secure` + `sameSite: none`
- Middleware `requireAuth` et `requireAdmin` sur routes sensibles

---

## 🎨 Bugs UI utilisateur

- **Bouton "œil" affichage du mot de passe** : présent sur le formulaire de connexion, 
  mais ne fonctionne pas (ni desktop, ni mobile). Non présent lors de l'inscription (à ajouter).
  - **Solution** : revoir l'implémentation du toggle `type="password"` ↔ `type="text"` côté front.

---

## 👤 Features utilisateur manquantes

- **Modifier son nom d'utilisateur** : non implémenté.
  - **Solution** : route `PATCH /api/users/me/username` avec validation.

- **Modifier son mot de passe** : l'utilisateur ne peut pas changer son MDP (seul l'admin peut le reset).
  - **Solution** : route `PATCH /api/users/me/password` avec validation ancien MDP + nouveau MDP.

- **Modifier son email** : l'utilisateur ne peut pas changer son email.
  - **Solution** : route `PATCH /api/users/me/email` avec validation.

- **Email de confirmation à l'inscription** : pas d'envoi d'email, pas de validation par lien.
  - **Solution** : intégration Resend / SendGrid + champ `email_verified` dans le modèle User.

- **Mot de passe oublié** : aucun mécanisme de récupération.
  - **Solution** : route `POST /api/auth/forgot-password` avec token temporaire + envoi par email.

- **Suppression de compte** : l'utilisateur ne peut pas supprimer son propre compte.
  - **Solution** : route `DELETE /api/users/me` avec confirmation + soft delete.

---

## 🛡️ Conformité RGPD

- **Pas de bandeau cookies** (consentement explicite manquant).
- **Pas de politique de confidentialité** accessible.
- **Pas de mécanisme de droit à l'oubli** automatisé (suppression sur demande utilisateur).
- **Pas d'export de données personnelles** (article 20 RGPD — portabilité).

**Solutions** : page dédiée à la politique de confidentialité, modal de consentement cookies, endpoints `GET /api/users/me/export` et `DELETE /api/users/me` accessibles depuis le compte utilisateur.

---

## 🔧 Limitations admin (bugs partiels)

- **Suppression d'utilisateur** : la fonction `DeleteUserButton` est implémentée côté frontend mais l'appel API échoue.
  - **Cause identifiée** : Contrainte de clé étrangère sur la table `RefreshToken` qui empêche la suppression en cascade.
  - **Solution** : Ajouter `onDelete: Cascade` sur la relation Prisma + créer une migration. Ou implémenter un soft delete (champ `deleted_at`) plus respectueux du RGPD.

- **Création / modification de match** : quelques ajustements UX/validation manquants, verifier la structure du code et les appel serveur.

---

## 🏠 Page d'accueil

- Les composants **"Tendances", "Surprise", "Leader"** sont actuellement **statiques** (données en dur dans le code).
- **Solution** : récupération dynamique depuis l'API avec aggregations :
  - Tendances : matchs les plus pronostiqués sur les 7 derniers jours pour les matchs future
  - Surprise : match avec le plus grand écart entre pronostics et résultat probable
  - Leader : utilisateur avec le meilleur taux de victoire (sur les 30 derniers jours)

---

## 🌐 Limitations infrastructure (mobile iOS)

### Bug d'authentification sur iOS
- **Symptôme** : impossible de se connecter sur iPhone (Chrome iOS testé).
- **Cause** : Safari iOS et Chrome iOS appliquent l'Intelligent Tracking Prevention (ITP) qui bloque les cookies cross-domain entre Vercel (frontend) et Render (backend), même avec `sameSite: "none"` et `secure: true`.

### Comportement par OS
- ✅ **Desktop (tous OS)** : OK
- ✅ **Android Chrome** : OK
- ❌ **iOS Chrome** : KO (cookies bloqués)
- ❌ **iOS Safari** : KO (cookies bloqués)
- 🟡 **Tablette iOS** : non testé mais comportement attendu identique

### Solution propre
Acquérir un domaine personnalisé permettrait de servir :
- Frontend : `nostradakick.com` (Vercel)
- API : `api.nostradakick.com` (Render)
- Cookies partagés sur le domaine racine `.nostradakick.com`

→ Non implémenté pour respecter le périmètre "infrastructure gratuite uniquement" du projet école / portfolio.

### Workaround actuel
Utilisation d'un navigateur desktop ou Android pour les fonctionnalités authentifiées.

---

## 📌 Conclusion

Ces limitations sont volontairement documentées pour transparence et pour servir de roadmap dans le cadre d'une potentielle V2. Chacune représente une opportunité d'amélioration mais n'a pas été retenue prioritaire dans le périmètre du sprint école.
