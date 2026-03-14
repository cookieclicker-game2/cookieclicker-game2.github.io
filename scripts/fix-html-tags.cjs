const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distAssets = path.join(rootDir, 'dist', 'assets');

if (!fs.existsSync(distAssets)) {
    console.error('Error: dist/assets not found. Run build first.');
    process.exit(1);
}

// Find the latest main bundle and style bundle in dist/assets
function getLatestAsset(pattern) {
    const files = fs.readdirSync(distAssets).filter(f => pattern.test(f));
    if (files.length === 0) return null;
    
    // Sort by modification time descending
    return files.sort((a, b) => {
        return fs.statSync(path.join(distAssets, b)).mtimeMs - fs.statSync(path.join(distAssets, a)).mtimeMs;
    })[0];
}

const latestJsFileName = getLatestAsset(/^main-.*\.js$/);
const latestCssFileName = getLatestAsset(/^style-.*\.css$/);

if (!latestJsFileName) {
    console.error('Error: No main-*.js found in dist/assets');
    process.exit(1);
}

const newestScriptPath = '/assets/' + latestJsFileName;
const newestCssPath = latestCssFileName ? '/assets/' + latestCssFileName : '/src/style.css';

console.log(`Detected latest JS: ${newestScriptPath}`);
console.log(`Detected latest CSS: ${newestCssPath}`);

function getAllHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!['node_modules', 'dist', '.git', '.gemini', 'tmp'].includes(file)) {
                getAllHtmlFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

const allFiles = getAllHtmlFiles(rootDir);

allFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Replace any /assets/main-*.js with newest bundle
    const jsRegex = /\/assets\/main-[A-Za-z0-9_-]+\.js/g;
    if (jsRegex.test(content)) {
        content = content.replace(jsRegex, newestScriptPath);
        changed = true;
    }
    // and also check for /src/main.js
    if (content.includes('/src/main.js')) {
        content = content.split('/src/main.js').join(newestScriptPath);
        changed = true;
    }

    // 2. Standardize CSS to newest hash string OR /src/style.css
    const cssRegex = /\/assets\/style-[A-Za-z0-9_-]+\.css/g;
    if (cssRegex.test(content)) {
        content = content.replace(cssRegex, newestCssPath);
        changed = true;
    }
    if (content.includes('/src/style.css')) {
        content = content.split('/src/style.css').join(newestCssPath);
        changed = true;
    }

    // 3. De-hash image assets
    const assetRegex = /\/assets\/([a-z0-9-]+)-[A-Za-z0-9_-]{8,15}\.(png|jpg|jpeg|webp|gif)/g;
    if (assetRegex.test(content)) {
        content = content.replace(assetRegex, '/assets/$1.$2');
        changed = true;
    }

    // 4. Fix Lady Bug 2 image path mismatch if any
    if (content.includes('/assets/ladybug.png')) {
        content = content.split('/assets/ladybug.png').join('/assets/ladybug-2-defend-the-city.png');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${path.relative(rootDir, filePath)}`);
    }
});

// Sync assets to root
const rootAssets = path.join(rootDir, 'assets');
if (!fs.existsSync(rootAssets)) fs.mkdirSync(rootAssets, { recursive: true });

const distFiles = fs.readdirSync(distAssets);
distFiles.forEach(f => {
    fs.copyFileSync(path.join(distAssets, f), path.join(rootAssets, f));
});
console.log('Synced all assets to /assets/');
