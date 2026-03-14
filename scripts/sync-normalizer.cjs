const fs = require('fs');
const path = require('path');

// Read slugs from src/games-data.js
const gamesDataPath = path.resolve(__dirname, '../src/games-data.js');
const content = fs.readFileSync(gamesDataPath, 'utf8');

// Simple regex to extract urls
const urlMatches = content.match(/url:\s*'\/([^']+)'/g);
if (!urlMatches) {
  console.error('No slugs found in games-data.js');
  process.exit(1);
}

const gameSlugs = urlMatches.map(m => m.match(/'\/([^']+)'/)[1]);

const normalizerJs = `
(function () {
  var path = window.location.pathname || '/';
  var normalizedPath = null;
  var isDuplicateGameUrl = false;
  var gameSlugs = ${JSON.stringify(gameSlugs)};

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

const publicPath = path.resolve(__dirname, '../public/url-normalizer.js');
fs.writeFileSync(publicPath, normalizerJs);

console.log('Successfully synced public/url-normalizer.js with', gameSlugs.length, 'slugs.');
