/**
 * Post-build tasks:
 * 1) For each game *.html in dist/, create dist/<name>/index.html
 *    so URLs like /brainrot-clicker/ still work.
 * 2) Emit stable asset aliases in dist/assets for plain and single-hash names
 *    because many pages reference /assets/<slug>.png and /assets/<slug>-<hash>.png.
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

const distAssets = path.join(dist, 'assets');
if (fs.existsSync(distAssets)) {
    const assetFiles = fs.readdirSync(distAssets).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));

    assetFiles.forEach((file) => {
        // Matches both:
        // - <base>-<hash>.png
        // - <base>-<hash>-<hash>.png (vite emits this in current setup)
        const m = file.match(/^(.*)-([A-Za-z0-9_-]{6,})(?:-([A-Za-z0-9_-]{6,}))?\.(png|jpe?g|webp)$/i);
        if (!m) return;

        const base = m[1];
        const hash = m[2];
        const ext = m[4];
        const sourcePath = path.join(distAssets, file);

        const plainAlias = `${base}.${ext}`;
        const oneHashAlias = `${base}-${hash}.${ext}`;

        const plainPath = path.join(distAssets, plainAlias);
        const oneHashPath = path.join(distAssets, oneHashAlias);

        if (!fs.existsSync(plainPath)) fs.copyFileSync(sourcePath, plainPath);
        if (!fs.existsSync(oneHashPath)) fs.copyFileSync(sourcePath, oneHashPath);
    });

    const ogImage = path.join(distAssets, 'og-image.png');
    if (fs.existsSync(ogImage)) {
        ['arcade-og.png', 'clicker-og.png', 'idle-og.png', 'io-og.png', 'adventure-og.png', 'sports-og.png']
            .forEach((name) => {
                const p = path.join(distAssets, name);
                if (!fs.existsSync(p)) fs.copyFileSync(ogImage, p);
            });
    }
}

console.log('Emitted clean URL folders and asset aliases for', gameFiles.length, 'games.');
