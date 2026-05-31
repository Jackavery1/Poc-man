# PAC-MAN Arcade — PWA

[![CI](https://github.com/Jackavery1/Poc-man/actions/workflows/ci.yml/badge.svg)](https://github.com/Jackavery1/Poc-man/actions/workflows/ci.yml)

Jeu Pac-Man arcade complet, installable et jouable hors ligne.

**Jouer en ligne :** [jackavery1.github.io/Poc-man](https://jackavery1.github.io/Poc-man/)

**Depot :** [github.com/Jackavery1/Poc-man](https://github.com/Jackavery1/Poc-man)

## Structure

```
Pocman/
├── index.html
├── styles.css
├── js/
│   ├── core.mjs      # Logique pure (tests)
│   └── main.mjs      # Jeu (entites, rendu, boucle)
├── tests/
├── sw.js
├── manifest.json
└── ARCHITECTURE.md
```

## Local

```bash
npm install
npm run serve
# http://localhost:8080
```

## Qualite

```bash
npm test
npm run test:coverage
npm run lint
```

## Deploiement

GitHub Pages via Actions (branche `main`). Activer **Settings → Pages → GitHub Actions** si besoin.

## Controles

| Plateforme | Controle |
|------------|----------|
| Clavier | Fleches ou ZQSD / WASD |
| Mobile | D-pad ou swipe |
| Pause | Espace ou Echap |

Cliquez sur le jeu pour le focus clavier.

## Depannage PWA

1. Rechargement force : `Ctrl+Shift+R`
2. F12 → Application → Service Workers → Unregister
3. Verifier HTTPS ou localhost (SW requis)

## Licence

Projet demo. Pac-Man est une marque de Bandai Namco.
