# Documentation NostradaKick

Documentation complète du projet NostradaKick, réalisée dans le cadre du projet de fin de cursus **Concepteur Développeur d'Applications** (RNCP 6, École O'clock).

> 📄 Le dossier complet du projet CDA est également disponible en PDF : [`dossier-projet-cda.pdf`](./dossier-projet-cda.pdf)

---

## 📂 Structure de la documentation

### [01 — Cahier des charges](./01-cahier-des-charges/)

Définition du projet, des besoins fonctionnels et de l'organisation.

- [`presentation.md`](./01-cahier-des-charges/presentation.md) — Présentation générale du projet
- [`user-stories.md`](./01-cahier-des-charges/user-stories.md) — User stories par rôle (Visiteur, Membre, Admin)
- [`endpoints-api.md`](./01-cahier-des-charges/endpoints-api.md) — Liste des endpoints REST de l'API
- [`analyse-des-risques.md`](./01-cahier-des-charges/analyse-des-risques.md) — Analyse des risques techniques et organisationnels
- [`arborescence.png`](./01-cahier-des-charges/arborescence.png) — Arborescence des pages du site

### [02 — Conception](./02-conception/)

Modélisation des données, architecture technique et diagrammes.

- [`architecture-technique.png`](./02-conception/architecture-technique.png) — Description textuelle de l'architecture technique
- [`architecture-logique.png`](./02-conception/architecture-logique.png) — Schéma de l'architecture logique
- [`erd.svg`](./02-conception/erd.svg) — Diagramme entité-relation (ERD)
- [`mcd.png`](./02-conception/mcd.png) — Modèle conceptuel de données (MCD)
- [`mld-initial.png`](./02-conception/mld-initial.png) — Modèle logique de données initial
- [`mld-postgresql.png`](./02-conception/mld-postgresql.png) — Schéma relationnel PostgreSQL final
- [`dictionnaire-donnees.md`](./02-conception/dictionnaire-donnees.md) — Dictionnaire des données
- [`use-case.png`](./02-conception/use-case.png) — Diagramme de cas d'usage *(version Sprint 0, voir [écarts](./04-audit/ecarts-conception-realisation.md))*
- [`sequence-post-pronostic.png`](./02-conception/sequence-post-pronostic.png) — Diagramme de séquence (publication d'un pronostic — version Sprint 0 avec `insert` / HTTP 201)
- [`diagramme-publication-pronostic.png`](./02-conception/diagramme-publication-pronostic.png) — Diagramme de séquence mis à jour (avec `upsert` / HTTP 200, voir [écarts](./04-audit/ecarts-conception-realisation.md))

### [03 — Design](./03-design/)

Identité visuelle, maquettes, wireframes et captures du rendu final.

- [`charte-graphique.md`](./03-design/charte-graphique.md) — Charte graphique (couleurs, typographie, etc.)
- [`logo.png`](./03-design/logo.png) — Logo du projet
- [`maquettes/`](./03-design/maquettes/) — Maquettes finales (Desktop + Mobile)
- [`wireframes/`](./03-design/wireframes/) — Wireframes (Desktop + Mobile)
- [`screenshots/`](./03-design/screenshots/) — Captures du rendu final déployé

### [04 — Audit](./04-audit/)

Analyse a posteriori du projet, comparant la conception initiale (Sprint 0) à l'implémentation finale.

- [`ecarts-conception-realisation.md`](./04-audit/ecarts-conception-realisation.md) — Tableau des écarts identifié entre la documentation Sprint 0 et le code final

---

## 📝 Note sur les versions

Cette documentation contient des artefacts du **Sprint 0** (conception initiale) ainsi que des documents **mis à jour** pour la soutenance.

Lorsque deux versions existent (par exemple les diagrammes de séquence du pronostic), elles sont conservées toutes les deux pour illustrer l'évolution du projet. Les divergences entre conception et implémentation sont recensées dans le [tableau d'audit](./04-audit/ecarts-conception-realisation.md).

Pour la documentation **technique à jour** (installation, scripts, endpoints), consultez le [`README.md` à la racine du repo](../README.md).