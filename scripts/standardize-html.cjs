const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const files = fs.readdirSync(rootDir);

const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');

console.log(`Processing ${htmlFiles.length} game HTML files...`);

htmlFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Ensure url-normalizer script is correct
    if (content.includes('src="/url-normalizer.js"') || content.includes("src='/url-normalizer.js'")) {
        // Already root, fine
    } else if (content.includes('src="url-normalizer.js"')) {
        content = content.replace('src="url-normalizer.js"', 'src="/url-normalizer.js"');
        modified = true;
    }

    // 2. Standardize module script and style
    // Remove any main-*.js and style-*.css
    const assetScriptRegex = /<script type="module" [^>]*src="\/assets\/main-[^>]*\.js"[^>]*><\/script>/g;
    const assetLinkRegex = /<link rel="stylesheet" [^>]*href="\/assets\/style-[^>]*\.css"[^>]*>/g;
    
    if (content.match(assetScriptRegex) || content.match(assetLinkRegex)) {
        content = content.replace(assetScriptRegex, '');
        content = content.replace(assetLinkRegex, '');
        modified = true;
    }

    // 3. Insert correct links if missing
    const headEnd = content.indexOf('</head>');
    if (headEnd !== -1) {
        if (!content.includes('/src/style.css')) {
            content = content.slice(0, headEnd) + '  <link rel="stylesheet" href="/src/style.css">\n' + content.slice(headEnd);
            modified = true;
        }
        if (!content.includes('/src/main.js')) {
            const headEndNew = content.indexOf('</head>');
            content = content.slice(0, headEndNew) + '  <script type="module" src="/src/main.js"></script>\n' + content.slice(headEndNew);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});

console.log('Finished standardization.');
