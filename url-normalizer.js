
(function () {
  var path = window.location.pathname || '/';
  var normalizedPath = null;
  var isDuplicateGameUrl = false;
  var gameSlugs = ["tsunamis-io","cookie-clicker","fun-clicker","liquor-clicker","bloodmoney","italian-brainrot-baby-clicker","clicker-evolution-puzzle-2","mine-clicker-cookie","loaf-clicker","brainrot-clicker","hacking-hero","icebreakers-idle-clicker","idle-landmark-builder","tiny-fishing","age-wars-idle","woodman-idle-tycoon","tank-masters-idle-tanks","flip-skater-idle","grow-slime","idle-game-dev-simulator","paper-io-2","battletabs","2v2-io","edelweiss","crazy-cattle-3d","block-blast","google-dino","basketball-stars","doge-miner","lolshot-io","splatoon-io","idle-breakout","adventure-capitalist","clicker-heroes","ladybug-2-defend-the-city"];

  if (path.length > 1 && path.endsWith('/')) {
    var slashSlug = path.slice(1, -1);
    if (gameSlugs.indexOf(slashSlug) !== -1) {
      normalizedPath = '/' + slashSlug;
      isDuplicateGameUrl = true;
    }
  } else if (/^\/[a-z0-9-]+\.html$/.test(path)) {
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
