// Gobble Dash — hand-in program (Node 22, standard library only).
// The game itself lives in game/ as plain static files. This program copies
// game/ and screenshots/ into the output folder and writes dossier.json,
// the summary the judge reads, using the kit library in vendor/.

import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const root = import.meta.dirname;
const out = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(out, { recursive: true });
cpSync(join(root, 'game'), join(out, 'game'), { recursive: true });
cpSync(join(root, 'screenshots'), join(out, 'screenshots'), { recursive: true });

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(out, 'dossier.json'), dossier);
console.log('Gobble Dash packed: game, screenshots and dossier written to ' + out);
