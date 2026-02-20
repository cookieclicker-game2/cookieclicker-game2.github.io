const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
const skip = new Set(['index.html', 'cookie-clicker-2.html']);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !skip.has(f));
const base = 'https://cookieclicker2game.org/';
let done = 0;
for (const f of files) {
  const name = f.replace(/\.html$/, '');
  const urlOld = base + name;
  const urlNew = base + f;
  let s = fs.readFileSync(path.join(dir, f), 'utf8');
  let ch = false;
  if (s.includes(urlOld)) {
    s = s.split(urlOld).join(urlNew);
    ch = true;
  }
  if (!s.includes('og:image:width') && s.includes('og:image" content="')) {
    s = s.replace(
      /(<meta property="og:image" content="[^"]+")\s*\n/,
      '$1\n    <meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">\n'
    );
    ch = true;
  }
  if (ch) {
    fs.writeFileSync(path.join(dir, f), s);
    done++;
  }
}
console.log('Updated ' + done + ' game pages');
