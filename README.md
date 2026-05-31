# POC-MAN Arcade — PWA

[![CI](https://github.com/Jackavery1/Poc-man/actions/workflows/ci.yml/badge.svg)](https://github.com/Jackavery1/Poc-man/actions/workflows/ci.yml)

Clone arcade **Poc-man**, installable et jouable hors ligne.

**Jouer en ligne :** [jackavery1.github.io/Poc-man](https://jackavery1.github.io/Poc-man/)

**Depot :** [github.com/Jackavery1/Poc-man](https://github.com/Jackavery1/Poc-man)

## Structure

```
Pocman/
├── index.html
├── styles.css
├── icon.svg
├── icon-192.png
├── icon-512.png
├── js/
│   ├── core.mjs       # Labyrinthe, constantes, logique pure (tests)
│   ├── entities.mjs   # Poc-man, fantomes
│   ├── game.mjs       # Etat, collisions, score
│   ├── render.mjs     # Canvas, overlays
│   ├── input.mjs      # Clavier, D-pad, swipe
│   ├── hud.mjs        # Points, record, vies, annonces
│   ├── audio.mjs      # Sons Web Audio
│   └── main.mjs       # Orchestration, boucle rAF
│   e2e/               # Tests Playwright
├── tests/
├── sw.js
├── manifest.json
└── ARCHITECTURE.md
```

## Local

```bash
npm install
npm run dev
```

Ouvrir **http://localhost:8080** dans le navigateur (pas `file://` — les modules ES exigent HTTP).

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur local (recommande, via Node) |
| `npm run serve` | Identique a `dev` |
| `npm run serve:py` | Alternative Python si besoin |

> Ne pas utiliser `npm run vite` — ce projet n utilise pas Vite.

**Depannage :** si le port 8080 est deja pris, fermez l autre terminal (`Ctrl+C`) ou tuez le processus, puis relancez `npm run dev`.

## Qualite

```bash
npm test
npm run test:coverage
npm run lint
npm run test:e2e
```

## Deploiement

GitHub Pages via Actions (branche `main`). Activer **Settings → Pages → GitHub Actions** si besoin.

## Controles

| Plateforme | Controle |
|------------|----------|
| Clavier | Fleches, WASD ou ZQSD (AZERTY : Z/Q/S/D) |
| Mobile | D-pad ou swipe |
| Pause | Espace ou Echap |

Cliquez sur le jeu pour le focus clavier.

## Depannage PWA

1. Rechargement force : `Ctrl+Shift+R`
2. F12 → Application → Service Workers → Unregister
3. Verifier HTTPS ou localhost (SW requis)

## Licence

Projet demo independant. Pac-Man est une marque de Bandai Namco ; **Poc-man** est un hommage non officiel.
