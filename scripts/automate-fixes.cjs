const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const gameFiles = [
    'cookie-clicker', 'fun-clicker', 'liquor-clicker', 'bloodmoney', 'italian-brainrot-baby-clicker',
    'clicker-evolution-puzzle-2', 'mine-clicker-cookie', 'loaf-clicker', 'brainrot-clicker',
    'hacking-hero', 'icebreakers-idle-clicker', 'idle-landmark-builder', 'age-wars-idle',
    'tiny-fishing', 'woodman-idle-tycoon', 'tank-masters-idle-tanks', 'flip-skater-idle',
    'grow-slime', 'idle-game-dev-simulator', 'paper-io-2', 'battletabs', '2v2-io',
    'edelweiss', 'crazy-cattle-3d', 'block-blast', 'google-dino', 'basketball-stars',
    'lolshot-io', 'splatoon-io', 'idle-breakout', 'adventure-capitalist', 'clicker-heroes',
    'doge-miner', 'ladybug-2-defend-the-city', 'tsunamis-io'
];

gameFiles.forEach(slug => {
    const filePath = path.join(rootDir, slug + '.html');
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Replace the normalizer script
    const normalizerRegex = /<script data-game-slash-normalizer>[\s\S]*?<\/script>/;
    content = content.replace(normalizerRegex, '<script src="/url-normalizer.js"></script>');

    // 2. Implement lazy-loading for iframe
    // Extract iframe src
    const iframeMatch = content.match(/<iframe src="([^"]+)"/);
    if (iframeMatch) {
        const iframeSrc = iframeMatch[1];
        
        // Find suitable background image
        // Try to find og:image or similar
        const ogImageMatch = content.match(/<meta property="og:image" content="[^"]+\/assets\/([^"]+)"/);
        const bgImage = ogImageMatch ? ogImageMatch[1] : (slug + '.png');

        const placeholderHtml = `
 <div class="game-wrapper" id="game-frame">
  <div class="game-play-placeholder" data-src="${iframeSrc}"
  style="background-image: url('/assets/${bgImage}');">
  <div class="play-btn-container">
  <button class="play-btn"><i>▶</i> Play Now</button>
  </div>
  </div>
 </div>`;

        // Replace the game-wrapper
        const wrapperRegex = /<div class="game-wrapper" id="game-frame">[\s\S]*?<\/div>\s*<\/div>/;
        // Wait, the end tag might be tricky if nested.
        // Let's use a simpler match for the iframe inside the wrapper
        const iframeWrapperRegex = /<div class="game-wrapper" id="game-frame">[\s\S]*?<\/iframe>[\s\S]*?<\/div>/;
        content = content.replace(iframeWrapperRegex, placeholderHtml);
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${slug}.html`);
});
