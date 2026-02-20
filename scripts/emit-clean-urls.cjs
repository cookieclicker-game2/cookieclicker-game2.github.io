/**
 * After vite build: for each game *.html in dist/, create dist/<name>/index.html
 * so that URLs like /brainrot-clicker/ work (and /brainrot-clicker with redirect on host).
 */
const fs = require('fs');
const path = require('path');

const dist = path.resolve(__dirname, '../dist');
const gameFiles = [
    'cookie-clicker', 'cookie-clicker-2', 'fun-clicker', 'liquor-clicker', 'bloodmoney',
    'italian-brainrot-baby-clicker', 'clicker-evolution-puzzle-2', 'mine-clicker-cookie',
    'loaf-clicker', 'brainrot-clicker', 'hacking-hero', 'icebreakers-idle-clicker',
    'idle-landmark-builder', 'age-wars-idle', 'tiny-fishing', 'woodman-idle-tycoon',
    'tank-masters-idle-tanks', 'flip-skater-idle', 'grow-slime', 'idle-game-dev-simulator',
    'paper-io-2', 'battletabs', '2v2-io', 'edelweiss', 'crazy-cattle-3d', 'block-blast',
    'google-dino', 'basketball-stars', 'lolshot-io', 'splatoon-io', 'idle-breakout',
    'adventure-capitalist', 'clicker-heroes', 'doge-miner'
];

gameFiles.forEach((name) => {
    const src = path.join(dist, name + '.html');
    if (!fs.existsSync(src)) return;
    const dir = path.join(dist, name);
    fs.mkdirSync(dir, { recursive: true });
    const html = fs.readFileSync(src, 'utf8');
    fs.writeFileSync(path.join(dir, 'index.html'), html);
});
console.log('Emitted clean URL folders for', gameFiles.length, 'games.');
