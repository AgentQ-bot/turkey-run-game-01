# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/AgentQ-bot/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/AgentQ-bot/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

**Gobble Dash — The Great Thanksgiving Getaway** is a side-scrolling escape runner. You are Tom the turkey, dinner is at six, and the farmer is right behind you. Sprint through the farmyard and orchard, survive the kitchen's flame-jet ovens and falling carving knives, and reach the woods 1,500 m away before he grabs you by the tail feathers. The HUD tracks score, distance, feather lives, corn energy and the farmer gap; pie slices stop the farmer cold, and near misses pay bonus points.

## Run it

Open `game/index.html` in a desktop browser — the game is plain static files with no build step and no network requests. Space or click to jump (again to flap, hold to glide), ↓ or S to duck under knives, Shift to sprint, P to pause, R to restart, M to mute.

## Screenshots

`?shot=title|farm|kitchen|escaped` stages the turkey at a telling moment of the run; every screenshot in `screenshots/` is a real render of the game's own code in a desktop browser.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json` with `buildDossier` from `vendor/makefun-game.ts`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=n987ngnf&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
