# Changelog

## [1.3.0] - 2026-05-30

### Ajouté
- Modules `js/entities.mjs`, `js/render.mjs`, `js/game.mjs`, `js/input.mjs`, `js/audio.mjs`
- `js/main.mjs` reduit a l orchestration (boucle rAF, SW)

### Modifié
- SW v1.5 — precache de tous les modules JS
- `ARCHITECTURE.md` mis a jour

## [1.2.0] - 2026-05-30

### Ajouté
- `js/main.mjs`, `styles.css` — separation HTML / CSS / JS
- `ARCHITECTURE.md`, ESLint, couverture Vitest (seuils sur `core.mjs`)
- CSP, `aria-live`, pause boucle si onglet cache
- Deploy Pages : artifact `_site` (sans tests/node_modules)
- Dependabot, badge CI, `getHouseExitAction` + tests

### Modifié
- SW v1.4 (sans Google Fonts), cache `main.mjs` + `styles.css`
- Zoom autorise (`maximum-scale=5`)

## [1.1.0] - 2026-05-30

### Ajouté
- Module `js/core.mjs` (logique partagée et testable)
- Tests unitaires Vitest (`tests/core.test.mjs`)
- CI GitHub Actions (tests + déploiement Pages)
- Accessibilité : `aria-label` sur le D-pad

### Corrigé
- Alignement entités (`speed - 0.5`) — mouvement Pac-Man et fantômes
- Sortie fantômes depuis la maison (`updateHouse` par cases)
- Fantômes mangés : retour `HOUSE` + `exitTimer`
- Tunnel latéral interdit aux fantômes (sauf `EATEN`)
- `pickDir` uniquement sur case alignée
- Demi-tour autorisé en cul-de-sac (`moveToward`)
- Cache PWA : icônes PNG + HTML network-first

### Modifié
- Police système monospace (offline, sans Google Fonts)
- D-pad masqué sur desktop (`pointer: coarse`)

## [1.0.0] - Version initiale

- Jeu Pac-Man complet en HTML/JS Canvas
- PWA installable avec service worker
