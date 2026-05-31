# Changelog

## [1.5.1] - 2026-05-31

### Corrige
- Branding unifie **POC-MAN** / Poc-man (HTML, manifest, overlays, e2e)
- Test e2e titre aligne sur `POC-MAN`
- Label HUD **POINTS** (au lieu de SCORE)
- `drawLives` deplace dans `hud.mjs`
- Couverture Vitest etendue a `game.mjs` (seuil 25 %)

### Modifie
- SW `poc-man-1.5.1`, README et ARCHITECTURE

## [1.5.0] - 2026-05-31

### Ajoute
- Module `js/hud.mjs` (decouplage DOM)
- Fruits bonus (70 pastilles), mode Elroy (Blinky)
- Intermission entre niveaux
- Canvas HiDPI (`devicePixelRatio`)
- Tests `game.test.mjs`, logique fruit/elroy, Playwright e2e
- Screenshots manifest PWA

### Corrige (audit)
- Couverture Vitest etendue a `entities.mjs`
- Labels HUD : RECORD
- Popups sans `splice` en boucle
- SW `pacman-1.5.0` aligne manifest
- `orientation: any` dans manifest

## [1.4.0] - 2026-05-30

### Corrige (audit)
- Mouvement base sur `dt` (independant du FPS)
- Mode fantome restaure apres FRIGHTENED (CHASE/SCATTER)
- Vitesses augmentent avec le niveau (+5 % / niveau, max 135 %)
- Cache canvas pour pastilles statiques
- Canvas responsive (`max-width: 100 %`)
- UI en francais (PRET, PAUSE, FIN DE PARTIE…)
- `prefers-reduced-motion` : moins d animations
- Vie bonus a 10 000 points
- Bouton pause mobile (centre D-pad) et mute son
- Banniere mise a jour PWA + SW v1.7

### Ajoute
- Tests `game-logic`, `entities`, `wrapCol`
- Constantes `COLLISION_HIT_RADIUS`, `ghostEatPoints`, etc.

## [1.3.1] - 2026-05-30

### Corrige
- Icones PNG 192/512 ajoutees au depot (PWA + CI)
- Clavier AZERTY : touches `KeyZ` / `KeyQ` mappees
- Pac-Man fige pendant l ecran READY
- `updateHouse` utilise `getHouseExitAction` (plus de duplication)
- `localStorage.setItem` protege par try/catch

### Modifie
- README structure a jour (7 modules)
- SW v1.6, texte aide : FLECHES / WASD / ZQSD

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
