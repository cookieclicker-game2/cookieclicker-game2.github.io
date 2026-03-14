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
const sourceAssets = path.resolve(__dirname, '../assets');

// Dynamically load game slugs from games-data.js
const gamesDataPath = path.resolve(__dirname, '../src/games-data.js');
const gamesDataContent = fs.readFileSync(gamesDataPath, 'utf8');
const gameFilesMatch = gamesDataContent.match(/url:\s*'\/([^']+)'/g);
const gameFiles = gameFilesMatch ? gameFilesMatch.map(m => m.match(/'\/([^']+)'/)[1]) : [];

// Filter out any duplicates and special cases if needed
const uniqueGameFiles = [...new Set(gameFiles)];

function copyDirFilesFlat(fromDir, toDir) {
    if (!fs.existsSync(fromDir)) return;
    fs.mkdirSync(toDir, { recursive: true });
    fs.readdirSync(fromDir, { withFileTypes: true }).forEach((entry) => {
        if (!entry.isFile()) return;
        const src = path.join(fromDir, entry.name);
        const dest = path.join(toDir, entry.name);
        fs.copyFileSync(src, dest);
    });
}

uniqueGameFiles.forEach((name) => {
    const src = path.join(dist, name + '.html');
    if (!fs.existsSync(src)) return;
    const dir = path.join(dist, name);
    fs.mkdirSync(dir, { recursive: true });
    const html = fs.readFileSync(src, 'utf8');
    fs.writeFileSync(path.join(dir, 'index.html'), html);
});

const distAssets = path.join(dist, 'assets');
copyDirFilesFlat(sourceAssets, distAssets);

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

const normalizerJs = `
(function () {
  var path = window.location.pathname || '/';
  var normalizedPath = null;
  var isDuplicateGameUrl = false;
  var gameSlugs = ${JSON.stringify(uniqueGameFiles)};

  if (path.length > 1 && path.endsWith('/')) {
    var slashSlug = path.slice(1, -1);
    if (gameSlugs.indexOf(slashSlug) !== -1) {
      normalizedPath = '/' + slashSlug;
      isDuplicateGameUrl = true;
    }
  } else if (/^\\/[a-z0-9-]+\\.html$/.test(path)) {
    var htmlSlug = path.slice(1, -5);
    if (gameSlugs.indexOf(htmlSlug) !== -1) {
      normalizedPath = '/' + htmlSlug;
      isDuplicateGameUrl = true;
    }
  }

  if (isDuplicateGameUrl) {
    var robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');
  }

  if (!normalizedPath || normalizedPath === path) return;
  window.location.replace(normalizedPath + window.location.search + window.location.hash);
})();
`;
fs.writeFileSync(path.join(dist, 'url-normalizer.js'), normalizerJs);

console.log('Emitted clean URL folders, asset aliases, and url-normalizer.js for', uniqueGameFiles.length, 'games.');
