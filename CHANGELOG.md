# Changelog

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
