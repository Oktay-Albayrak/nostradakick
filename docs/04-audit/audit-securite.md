# Audit de sécurité — NostradaKick


> Audit auto-réalisé en environnement local.


## 1. Contexte et scope

### Objectif
Audit de sécurité applicative auto-réalisé (non complet) pour identifier les vulnérabilités potentielles du projet NostradaKick et documenter une démarche défensive.

### Périmètre testé
- **Backend** : API Express (en local sur `localhost:4000`)
- **Frontend** : Next.js (en local sur `localhost:3000`)
- **Base de données** : PostgreSQL local

### ⚠️ Note importante — Tests en local uniquement
Conformément aux CGU de Vercel et Render et à la législation française sur les tests d'intrusion (article 323-1 du Code pénal), **aucun test n'est réalisé sur l'environnement de production**. L'audit se déroule exclusivement sur une instance locale de l'application.

---

## 2. Méthodologie

### Outils utilisés
- **OWASP ZAP v2.17** (scanner automatique)
- **Burp Suite Community Edition v2026.4.3** (proxy + intruder + scan manuel + repeater)

```
Lancement du navigateur Chrome isolé via terminal :

google-chrome --user-data-dir=/tmp/chrome-burp \
--proxy-server="127.0.0.1:8081" \
--proxy-bypass-list="<-loopback>" \
--ignore-certificate-errors \
http://localhost:3000
```
- **OWASP Top 10 (2025)** comme checklist de référence
- **Lecture manuelle du code source** (focus auth, validations, autorisations)

### Démarche
1. Reconnaissance du périmètre (routes API, endpoints publics/protégés)
2. Tests d'authentification (brute force, JWT manipulation, refresh token)
3. Tests d'autorisation (BOLA, élévation de privilèges, IDOR)
4. Tests d'injection (SQL via Prisma, XSS, command injection)
5. Tests de configuration (headers HTTP, cookies, CORS)
6. Synthèse et recommandations


### Format de chaque finding

```
[SEVERITY: HIGH/MEDIUM/LOW/INFO/NONE] Titre de la vulnérabilité

Description :
Reproduction :
Impact :
Recommandation :
Statut : Open / Mitigated / Closed
```

Note : la sévérité `NONE` est utilisée pour les tests négatifs (vulnérabilité testée mais défense en place et fonctionnelle).

---

## 3. Findings OWASP ZAP

<div align="center">

[**Capture d'écran arborescence API**](audit_ZAP_2-17/screenshot/arborescence_API.png)
<br> [**Capture d'écran arborescence Client**](audit_ZAP_2-17/screenshot/arborescence_Client.png)
<br> [**Capture d'écran arborescence Client suite**](audit_ZAP_2-17/screenshot/arborescence_Client2.png)

</div>

- **Méthodologie** :
  - Réglage des paramètres pour limiter le scope à localhost uniquement - [Capture d'écran des paramètres mis en place](audit_ZAP_2-17/screenshot/Paramètres)
  - Récupération des URL client et API ainsi que des JWT des utilisateurs connectés via un scan manuel avec comptes utilisateur et administrateur
  - Test d'intrusion en scan automatique pour vérifier les failles identifiées par OWASP ZAP

### [SEVERITY: MEDIUM] Content Security Policy (CSP) Header Not Set 
### (En-tête CSP absent sur le frontend)

- **URL concernée** : `http://localhost:3000/` (frontend Next.js)
- **Alert reference ZAP** : 10038-1
- **Catégorie OWASP** : A02:2025 — Security Misconfiguration

<div align="center">

[**Capture d'écran OWASP ZAP**](audit_ZAP_2-17/screenshot/csp_header_not_set.png)

</div>

- **Description** : Le serveur Next.js ne renvoie aucun en-tête `Content-Security-Policy`. Sans cette politique, le navigateur applique sa configuration par défaut qui est très permissive, ce qui ouvre la porte à des attaques d'injection de contenus malveillants comme les XSS (Cross-Site Scripting).

- **Reproduction** : 
Inspection des en-têtes de réponse via DevTools du navigateur (onglet Network → Headers) : aucune ligne `Content-Security-Policy` n'est présente.

Sans CSP, les payloads suivants s'exécuteraient sans restriction :

```html
<script>alert('XSS exécuté');</script>
```

```html
<img src="http://exemple.com/xss_execute.png">
```

- **Impact** : 
  - Injection de scripts malveillants dans les pages (XSS)
  - Chargement de ressources externes non contrôlées
  - Risque de vol de tokens d'authentification via JavaScript injecté

- **Recommandation** : 
Configurer le header `Content-Security-Policy` côté serveur Next.js. 
  - Deux approches possibles :Note : la sévérité `NONE` est utilisée pour les tests négatifs (vulnérabilité testée mais défense en place et fonctionnelle).



  1. **Via `next.config.ts`** avec la fonction `headers()` :
  
```typescript
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'; img-src 'self'; style-src 'self'; frame-ancestors 'none'; form-action 'self';"
          }
        ]
      }
    ]
  }
```
  
  2. **Via middleware `middleware.ts`** pour une gestion plus dynamique (recommandé si CSP différent selon la route).

      - `default-src 'self'` : par défaut, seules les ressources du site sont autorisées
      - `script-src 'self'` : seuls les scripts du site peuvent être exécutés
      - `img-src 'self'` : seules les images du site peuvent être chargées
      - `style-src 'self'` : seules les feuilles de style du site peuvent être chargées

- **Sources** : Vous pouvez retrouver une fiche détaillée expliquant les configurations possibles en suivant ces liens : 
  - [source MDN](https://developer.mozilla.org/fr/docs/Web/HTTP/Guides/CSP#:~:text=Une%20CSP%20doit%20%C3%AAtre%20transmise,seulement%20pour%20le%20document%20principal.) 
  - [source Lukla](https://www.luklagroup.com/digital-workplace/securiser-votre-site-web-avec-une-content-security-policy-csp/)
  - [OWASP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
  - [Content Security Policy Website](https://content-security-policy.com/)

- **Statut** : Open (identifié, non corrigé)

---

### [SEVERITY: MEDIUM] CSP: Failure to Define Directive with No Fallback 
### (Configuration CSP incomplète sur le backend)

- **URL concernée** : `http://localhost:4000/` (backend Express)
- **Alert reference ZAP** : 10055-13
- **Preuve fournie par ZAP** : `default-src 'none'`
- **Autres informations** : *« The directive(s): frame-ancestors, form-action is/are among the directives that do not fallback to default-src. »*
- **Catégorie OWASP** : A02:2025 — Security Misconfiguration

<div align="center">

[**Capture d'écran OWASP ZAP**](audit_ZAP_2-17/screenshot/csp_failure_to_define.png)

</div>

- **Description** : Contrairement au frontend, le backend Express définit bien un header CSP avec `default-src 'none'` (configuration très restrictive bloquant tout par défaut). Cependant, ZAP indique que certaines directives, à savoir `frame-ancestors` et `form-action`, ne sont pas définies et ne bénéficient pas de la protection par défaut. La protection CSP du backend est donc **partielle**.

  - `frame-ancestors` contrôle quels sites peuvent charger la page dans un `<iframe>` (protection anti-clickjacking).
    - **exemple concret de clickjacking** : vous êtes connecté sur un site e-commerce ou votre banque, et vous naviguez sur un site externe où vous apercevez un bouton qui dit « participer à notre concours pour gagner X produit ». Une fois le bouton cliqué, le site externe charge en réalité la vraie page de votre banque dans une `<iframe>` invisible superposée au bouton, et réalise un virement ou vous abonne à un service que vous n'avez pas désiré.

  - `form-action` contrôle vers quelles URL les formulaires peuvent soumettre.
    - **exemple concret d'exfiltration de formulaire** : vous avez un formulaire de paiement sur votre site. Un pirate qui aurait réussi à injecter du contenu (via XSS par exemple) peut remplacer votre formulaire par un faux qui ressemble en tout point au vôtre. Les utilisateurs remplissent leurs données bancaires (CB, IBAN) comme d'habitude, mais le formulaire envoie en réalité les données vers le serveur du pirate.

  En l'absence de ces deux directives, le serveur backend reste vulnérable au clickjacking et à l'exfiltration de formulaires vers des destinations arbitraires.

- **Impact** : 
  - Configuration de défense incomplète
  - Impact réel limité car le backend est principalement une API JSON (peu de rendu HTML), mais la finding reste valide en tant que défense en profondeur

- **Recommandation** : 
Compléter la configuration CSP du backend Express pour couvrir toutes les directives :

```http
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; form-action 'self';
```

Si le projet utilise le middleware **Helmet**, configurer explicitement :

```javascript
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'none'"],
    frameAncestors: ["'none'"],
    formAction: ["'self'"]
  }
}));
```

- **Sources** : Se référer aux liens MDN, Lukla et OWASP Cheat Sheet cités dans la finding précédente.

- **Statut** : Open (identifié, non corrigé)

---

### [SEVERITY: MEDIUM] Missing Anti-Clickjacking Header
### (En-tête anti-clickjacking manquant côté frontend)

- **URL concernée** : `http://localhost:3000/` (frontend Next.js)
- **Alert reference ZAP** : 10020-1
- **Catégorie OWASP** : A02:2025 — Security Misconfiguration

<div align="center">

[**Capture d'écran OWASP ZAP**](audit_ZAP_2-17/screenshot/missing_anti_clickjacking.png)

</div>

- **Description** : Tout comme pour le backend Express, ZAP indique que la directive `frame-ancestors` n'est pas définie dans la CSP, et qu'aucun en-tête `X-Frame-Options` n'est non plus présent sur le frontend Next.js. Le frontend n'a donc **aucune protection** contre le clickjacking (ni via CSP moderne, ni via l'ancien en-tête X-Frame-Options).

  - `frame-ancestors` contrôle quels sites peuvent charger la page dans un `<iframe>` (protection anti-clickjacking).
    - **exemple concret de clickjacking** : vous êtes connecté sur un site e-commerce ou votre banque, et vous naviguez sur un site externe où vous apercevez un bouton qui dit « participer à notre concours pour gagner X produit ». Une fois le bouton cliqué, le site externe charge en réalité la vraie page de votre banque dans une `<iframe>` invisible superposée au bouton, et réalise un virement ou vous abonne à un service que vous n'avez pas désiré.

  En l'absence de cette directive, le frontend reste vulnérable au clickjacking.

- **Impact** : 
  - Configuration de défense incomplète
  - Impact réel sur le rendu HTML

- **Recommandation** : 
Configurer l'en-tête anti-clickjacking directement sur le serveur Next.js qui sert les pages frontend. Deux approches au choix :

  1. **En-tête historique X-Frame-Options** via `next.config.ts` :

```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' }
      ]
    }
  ]
}
```

Options possibles :
  - `SAMEORIGIN` : seul le propre site peut intégrer les pages dans une iframe
  - `DENY` : personne ne peut intégrer les pages dans une iframe (plus restrictif)


  2. **Directive CSP moderne `frame-ancestors`** (recommandée car remplace progressivement X-Frame-Options) :

```typescript
// Dans next.config.ts via headers()
{
  key: 'Content-Security-Policy',
  value: "frame-ancestors 'none';"  // ou 'self' selon le besoin
}
```

**Note méthodologique** : La référence MDN consultée ([source](https://developer.mozilla.org/fr/docs/Web/HTTP/Reference/Headers/X-Frame-Options)) liste également l'option **middleware Express (`frameguard` ou `helmet`)** pour configurer cet en-tête. Cette option serait pertinente dans une architecture où Express sert directement les pages HTML (par exemple un « custom server » Next.js). Dans l'architecture actuelle de NostradaKick, Next.js et Express sont des serveurs séparés (ports 3000 et 4000), et les pages sont servies par Next.js. Configurer `frameguard` côté Express ne protégerait donc que les réponses API JSON contre le clickjacking, ce qui n'est pas la surface à protéger ici.

- **Sources** : 
  - [X-Frame-Options via MDN](https://developer.mozilla.org/fr/docs/Web/HTTP/Reference/Headers/X-Frame-Options)

- **Statut** : Open (identifié, non corrigé)

---

**Note** : Les findings #1 (CSP absent sur frontend) et #3 (X-Frame-Options absent sur frontend) sont liées. Implémenter une CSP complète avec `frame-ancestors 'none'` sur le frontend Next.js résout simultanément les deux problèmes. ZAP les remonte séparément car ce sont deux signalements distincts dans son catalogue.

---

### Tableau récapitulatif des alertes trouvées par OWASP ZAP

<div align="center">

[**Capture d'écran OWASP ZAP des alertes**](audit_ZAP_2-17/screenshot/alertes.png)

</div>

*Les alertes LOW et INFO ne sont pas documentées en détail dans cet audit.*

|N|SEVERITY|NAME|
|---|---|---|
|1|MEDIUM|Content Security Policy (CSP) Header Not Set|
|2|MEDIUM|CSP: Failure to Define Directive with No Fallback|
|3|MEDIUM|Missing Anti-clickjacking Header|
|4|LOW|Cookie with SameSite Attribute None|
|5|LOW|Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s)|
|6|LOW|X-Content-Type-Options Header Missing|
|7|LOW|Timestamp Disclosure - Unix|
|8|INFO|Authentication Request Identified|
|9|INFO|Information Disclosure - Sensitive Information in URL|
|10|INFO|Session Management Response Identified|
|11|INFO|User Agent Fuzzer|
|12|INFO|Content-Type Header Missing|
|13|INFO|Information Disclosure - Suspicious Comments|
|14|INFO|Modern Web Application|

[**Vous pouvez consulter le rapport complet de OWASP ZAP (nettoyé) ICI**](audit_ZAP_2-17/ZAP-Report-localhost.html)


---

## 4. Findings Burp Suite Community Edition

### [SEVERITY: NONE] IDOR (Insecure Direct Object Reference) sur POST /api/predictions

- **Catégorie OWASP** : A01:2025 — Broken Access Control
- **Sévérité** : N/A (test négatif, défense en place)

- **Méthodologie** : Test d'IDOR avec Burp Suite Repeater. Capture d'une requête POST /api/predictions légitime de userA, modification du champ `user_id` du body JSON pour y placer l'UUID de userB, conservation du JWT et des cookies de userA, replay.

- **Résultat** :
HTTP 403 Forbidden retourné par le serveur. Le contrôleur `upsertPrediction` vérifie correctement que le `user_id` du body correspond au `userId` du JWT décodé, et rejette la requête sinon.

- **Captures** :
  - [Requête Repeater modifiée](./audit_Burp_Suite_Community_Edition/burp-idor-predictions-request.png)
  - [Réponse 403 Forbidden](./audit_Burp_Suite_Community_Edition/burp-idor-predictions-response.png)

- **Recommandation d'amélioration (defense in depth)** :
Dériver `user_id` exclusivement du JWT côté serveur au lieu de le comparer au body. Cela élimine la possibilité d'une faille par omission d'un futur développeur qui oublierait la vérification.

**Statut** : ✅ Contrôle d'autorisation fonctionnel

---

## 5. Findings Lecture manuelle code source + Tests visuels

### [SEVERITY: LOW] Suppression d'utilisateur bloquée par contrainte FK

- **Description** : La table `RefreshToken` référence `User.id` sans `onDelete: Cascade`. Toute tentative de suppression d'un utilisateur via Prisma échoue avec une violation de contrainte de clé étrangère.

- **Reproduction** : Tentative de suppression d'un user avec des refresh tokens actifs → erreur Postgres.

- **Impact** : 
  - Fonctionnalité admin cassée (DeleteUserButton inopérant)
  - Conformité RGPD impactée (droit à l'oubli impossible techniquement)

- **Recommandation** : Ajouter `onDelete: Cascade` sur toutes les relations FK pointant vers User, créer une migration Prisma. Alternative : implémenter un soft delete (champ `deleted_at`) plus respectueux du RGPD.

- **Statut** : Open (identifié, non corrigé)

---

**Plusieurs findings potentielles identifiées en lecture manuelle mais non documentées en détail dans cet audit** :

- **Brute force du site possible** : pas de limitation des tentatives d'authentification sur l'endpoint de login. Option possible : ajouter un middleware pour contrôler le nombre d'authentifications échouées consécutives (rate limiting).
- **Modification du mot de passe et de l'adresse email impossible** : aucune fonctionnalité ne permet à l'utilisateur de modifier ses informations de compte. Option possible : implémenter les services correspondants côté backend et l'interface côté frontend.
- **Validation par email non implémentée** : aucun système d'envoi d'email pour la vérification d'adresse ou la récupération de mot de passe oublié. Option possible : ajouter la fonctionnalité de récupération de mot de passe par email avec token à usage unique.

Ces points sont identifiés comme axes d'amélioration prioritaires pour la suite du développement du projet.

---

## 6. Points positifs identifiés

Au cours de l'audit, plusieurs bonnes pratiques de sécurité déjà en place dans NostradaKick ont été identifiées. Ces éléments démontrent une démarche de sécurité réfléchie dès la conception du projet.

### Authentification et gestion des mots de passe

- **Hashage des mots de passe avec Argon2** *(A04:2025 — Cryptographic Failures)*
  
Les mots de passe utilisateurs sont stockés en base avec l'algorithme Argon2, considéré comme l'état de l'art en matière de hashage de mots de passe (gagnant de la Password Hashing Competition 2015). Plus robuste que bcrypt ou scrypt face aux attaques par GPU et ASIC.

- **JWT avec rotation des refresh tokens** *(A07:2025 — Authentication Failures)*
  
L'authentification utilise un système de double token : un access token de courte durée et un refresh token de plus longue durée avec rotation. Cela limite la fenêtre d'exploitation en cas de vol de token.

### Sécurité des sessions et cookies

- **Cookies sécurisés HttpOnly + Secure + SameSite** *(A02:2025 — Security Misconfiguration)*
  
Les cookies d'authentification sont configurés avec :
  - `HttpOnly` : inaccessibles depuis JavaScript côté client (protection XSS)
  - `Secure` : transmis uniquement en HTTPS
  - `SameSite=none` : configuration adaptée à l'architecture cross-domain (frontend Vercel + backend Render), combinée à `Secure` pour respecter les exigences modernes des navigateurs.

### Validation des entrées

- **Validation systématique avec Zod** *(A03:2025 — Software Supply Chain / A05:2025 — Injection)*
  
Les données reçues côté backend sont systématiquement validées via la bibliothèque Zod, qui définit des schémas typés et rejette toute entrée malformée avant qu'elle atteigne la couche métier.

### Protection contre les injections

- **ORM Prisma avec requêtes paramétrées** *(A05:2025 — Injection)*
  
L'accès aux données passe exclusivement par Prisma ORM, qui utilise des requêtes paramétrées par défaut. Cela élimine les risques classiques d'injection SQL liés à la concaténation de chaînes dans les requêtes.

### Contrôle d'autorisation

- **Vérification du `user_id` sur `upsertPrediction`** *(A01:2025 — Broken Access Control)*
  
Le contrôleur `upsertPrediction` vérifie correctement que le `user_id` reçu dans le corps de la requête correspond au `userId` extrait du JWT décodé. Toute tentative d'IDOR (test réalisé avec Burp Suite Repeater, cf. finding 4) est rejetée avec un HTTP 403 Forbidden et un message explicite. **Test reproductible et défense confirmée fonctionnelle.**

---

## 7. Conclusion

### Bilan global

Le projet NostradaKick présente globalement un bon niveau de sécurité applicative. Les fondamentaux sont en place : Argon2 pour le hashage des mots de passe, JWT avec rotation des refresh tokens, cookies sécurisés, validation Zod côté backend, Prisma ORM avec requêtes paramétrées, CORS restrictif, et contrôle d'autorisation correct sur les endpoints sensibles (test IDOR négatif confirmé).

Les principaux axes d'amélioration identifiés concernent la configuration des en-têtes HTTP de sécurité côté frontend Next.js, et la gestion des données utilisateur côté backend (suppression et modification de compte).

### Priorisation des corrections recommandées

- **Priorité critique — Conformité RGPD** : la suppression de compte utilisateur est techniquement impossible à cause de la contrainte FK sans `onDelete: Cascade` (cf. finding 5). De plus, l'utilisateur ne peut pas modifier ses informations ni récupérer son compte en cas de perte d'identifiant. Ces points doivent être résolus en priorité pour respecter le droit à l'oubli et permettre à l'utilisateur de garder le contrôle de ses données.

- **Priorité importante — Protection XSS et clickjacking côté frontend** : la mise en place d'une Content Security Policy complète et d'un en-tête anti-clickjacking sur Next.js (cf. findings 3.1 et 3.3) protège contre les attaques d'injection et de détournement d'interface. Ces deux findings se résolvent simultanément en configurant correctement le CSP avec `frame-ancestors`.

- **Priorité moyenne — Complétion CSP côté backend** : ajout des directives `frame-ancestors` et `form-action` au CSP du backend Express (cf. finding 3.2). Impact réel limité car le backend est principalement une API JSON, mais la finding reste valide en tant que défense en profondeur, notamment si le projet évolue vers du contenu HTML servi par l'API ou si un futur modèle économique (site payant, abonnement) augmente la surface d'attaque.

- **Priorité faible — Renforcement de l'authentification** : ajout d'un rate limiting sur les endpoints d'authentification pour limiter les attaques par brute force, et implémentation de la récupération de mot de passe via email (cf. axes non documentés en 5).

### Retour d'expérience

Cet audit a été réalisé en autonomie dans un cadre d'apprentissage personnel, sur l'environnement local du projet uniquement et dans le respect du cadre légal français. Il ne prétend pas à l'exhaustivité d'un audit de cabinet de sécurité professionnel. Plusieurs axes restent à creuser et certaines findings identifiées en lecture de code n'ont pas été documentées en détail à ce stade.

L'objectif de la démarche était double :
- Démontrer une capacité à articuler scan automatique (OWASP ZAP), test manuel ciblé (Burp Suite Repeater) et lecture de code source
- Mettre en pratique l'OWASP Top 10:2025 sur un projet concret pour consolider la compréhension de chaque catégorie de risque

L'audit pourra être enrichi ultérieurement en fonction de l'évolution du projet et de la montée en compétence de l'auteur.


---

**Auteur** : Oktay Albayrak

**Date de démarrage** : courant juin 2026

**Date de mise à jour** : Terminé le 19/06/2026