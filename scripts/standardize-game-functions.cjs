const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const standardShowToast = `  function showToast(message) {
    var c = document.getElementById('toast-container');
    if (!c) return;
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<i>✓</i> <span>' + message + '</span>';
    c.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 3000);
  }`;

const standardShareGame = `  function shareGame() {
    const url = window.location.href;
    showToast('Link copied to clipboard');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
  }`;

const standardToggleTheaterMode = `  function toggleTheaterMode() {
    document.body.classList.toggle('theater-mode-active');
    if (document.body.classList.contains('theater-mode-active')) {
      showToast('Theater mode enabled');
      const hero = document.querySelector('.game-hero');
      if (hero) {
        const y = hero.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({top: y, behavior: 'smooth'});
      }
    } else {
      showToast('Theater mode disabled');
    }
  }`;

function fixHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Only process if it looks like a game page (has game-play-placeholder)
    if (!content.includes('game-play-placeholder')) return;

    console.log(`Processing ${path.basename(filePath)}...`);

    // Replace functions using a robust regex that handles various indentations
    function replaceFunction(fnName, newContent) {
        // Match function name, then all content until the closing brace of that function
        // This uses a simple brace matching strategy for the replacement
        const regex = new RegExp(`function\\s+${fnName}\\s*\\([^)]*\\)\\s*\\{`, 'g');
        let match;
        while ((match = regex.exec(content)) !== null) {
            let start = match.index;
            let braceCount = 1;
            let end = -1;
            for (let i = start + match[0].length; i < content.length; i++) {
                if (content[i] === '{') braceCount++;
                else if (content[i] === '}') braceCount--;
                
                if (braceCount === 0) {
                    end = i + 1;
                    break;
                }
            }
            if (end !== -1) {
                content = content.slice(0, start) + newContent + content.slice(end);
                // Adjust regex index for shifted content
                regex.lastIndex = start + newContent.length;
            }
        }
    }

    // Surgical replacements for the three key functions
    replaceFunction('showToast', standardShowToast);
    replaceFunction('shareGame', standardShareGame);
    replaceFunction('toggleTheaterMode', standardToggleTheaterMode);

    // Also ensure toast-container exists before the script
    if (!content.includes('id="toast-container"')) {
        content = content.replace('</body>', '<div id="toast-container" class="toast-container"></div>\n</body>');
    }

    fs.writeFileSync(filePath, content);
}

const files = fs.readdirSync(rootDir);
files.forEach(file => {
    if (file.endsWith('.html') && file !== 'index.html' && file !== '404.html') {
        fixHtmlFile(path.join(rootDir, file));
    }
});

console.log('Standardization complete!');
