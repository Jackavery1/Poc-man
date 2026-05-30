# PAC-MAN Arcade — PWA

Jeu Pac-Man arcade complet, installable et jouable hors ligne (Progressive Web App).

**Dépôt :** [github.com/Jackavery1/Poc-man](https://github.com/Jackavery1/Poc-man)

## Structure du projet

```
Pocman/
├── index.html          # Interface + jeu (module ES)
├── js/
│   └── core.mjs        # Constantes, labyrinthe, logique IA testable
├── tests/
│   └── core.test.mjs   # Tests unitaires (Vitest)
├── sw.js               # Service Worker (cache offline)
├── manifest.json       # Manifest PWA
├── icon.svg            # Icône vectorielle
├── icon-192.png        # Icône PWA 192×192
├── icon-512.png        # Icône PWA 512×512
├── package.json        # Scripts npm (tests, serveur local)
└── README.md
```

## Prérequis

- Navigateur moderne (Chrome, Firefox, Edge, Safari)
- [Node.js](https://nodejs.org/) 18+ (optionnel, pour les tests)

## Lancer en local

```bash
# Option 1 — npm
npm run serve
# Ouvrir http://localhost:8080

# Option 2 — Python
python -m http.server 8080
```

> Le Service Worker nécessite **HTTPS** ou **localhost**.

## Tests

```bash
npm install
npm test
```

## Déploiement

### GitHub Pages

1. Pousser sur `main`
2. Settings → Pages → Source : **GitHub Actions**
3. Le workflow `.github/workflows/ci.yml` déploie automatiquement

### Netlify

Glisser-déposer le dossier du projet sur [netlify.com](https://netlify.com).

## Contrôles

| Plateforme | Contrôle |
|------------|----------|
| Clavier | **Flèches** ou **ZQSD** (AZERTY) / WASD (QWERTY) |
| Mobile / tablette | D-pad à l'écran ou **swipe** |
| Pause | `Espace` ou `Échap` |

Cliquez sur la zone de jeu avant de jouer (focus clavier).

## Installation PWA

En HTTPS : menu navigateur → « Ajouter à l'écran d'accueil ».

Après une mise à jour : rechargement forcé (`Ctrl+Shift+R`) ou vider le cache du Service Worker (F12 → Application).

## Règles

- Pastilles = 10 pts, Power Pellets = 50 pts
- Fantômes effrayés = 200 / 400 / 800 / 1600 pts (combo)
- 3 vies, modes fantômes Scatter ↔ Chase

## IA des fantômes

| Fantôme | Couleur | Chase | Scatter |
|---------|---------|-------|---------|
| Blinky | Rouge | Cible Pac-Man | Haut-droite |
| Pinky | Rose | 4 cases devant Pac-Man | Haut-gauche |
| Inky | Cyan | Vecteur via Blinky | Bas-droite |
| Clyde | Orange | Chase si loin, fuit si proche | Bas-gauche |

## Licence

Projet démo / portfolio. Pac-Man est une marque de Bandai Namco.
