# Architecture — Pocman

## Fichiers

| Fichier | Role |
|---------|------|
| `index.html` | Structure DOM, HUD, canvas |
| `styles.css` | Presentation |
| `js/core.mjs` | Labyrinthe, constantes, logique pure (testable) |
| `js/main.mjs` | Entites, rendu, etat jeu, entrees, boucle |
| `sw.js` | Cache offline PWA |

## Machine a etats (`game.state`)

```mermaid
stateDiagram-v2
  [*] --> title
  title --> ready: startGame
  ready --> playing: readyTimer
  playing --> paused: Space
  paused --> playing: Space
  playing --> dying: collision
  dying --> ready: vies restantes
  dying --> gameOver: 0 vie
  playing --> levelComplete: dotsLeft 0
  levelComplete --> ready: level++
  gameOver --> ready: startGame
```

## Fantomes (`Ghost.mode`)

- `HOUSE` : rebond puis sortie via `updateHouse`
- `SCATTER` / `CHASE` : cycle temporel `game.modeCycle`
- `FRIGHTENED` : apres power pellet
- `EATEN` : retour maison puis `HOUSE` avec `exitTimer`

## Alignement grille

`isAlignedAt(x, y, speed)` utilise `speed - 0.5` pour eviter l oscillation pixel.

## Tests

`tests/core.test.mjs` couvre `js/core.mjs` (alignement, tunnel, porte, sortie maison, demi-tour).
