const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

function getAllHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!['node_modules', 'dist', '.git', '.gemini', 'tmp', 'brain', '.vscode'].includes(file)) {
                getAllHtmlFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

const allFiles = getAllHtmlFiles(rootDir);

const newShare = `  function shareGame() {
    const url = window.location.href;
    showToast('Link copied to clipboard');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
  }`;

const newTheater = `  function toggleTheaterMode() {
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

allFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Target shareGame
    if (content.includes('function shareGame()')) {
        const lines = content.split('\n');
        const startIdx = lines.findIndex(l => l.includes('function shareGame()'));
        if (startIdx !== -1) {
            let endIdx = -1;
            let braceCount = 0;
            let foundStart = false;
            for (let i = startIdx; i < lines.length; i++) {
                if (lines[i].includes('{')) {
                    braceCount += (lines[i].match(/\{/g) || []).length;
                    foundStart = true;
                }
                if (lines[i].includes('}')) {
                    braceCount -= (lines[i].match(/\}/g) || []).length;
                }
                if (foundStart && braceCount === 0) {
                    endIdx = i;
                    break;
                }
            }
            if (endIdx !== -1) {
                lines.splice(startIdx, endIdx - startIdx + 1, newShare);
                content = lines.join('\n');
                changed = true;
            }
        }
    }

    // 2. Target toggleTheaterMode
    if (content.includes('function toggleTheaterMode()')) {
        const lines = content.split('\n');
        const startIdx = lines.findIndex(l => l.includes('function toggleTheaterMode()'));
        if (startIdx !== -1) {
            let endIdx = -1;
            let braceCount = 0;
            let foundStart = false;
            for (let i = startIdx; i < lines.length; i++) {
                if (lines[i].includes('{')) {
                    braceCount += (lines[i].match(/\{/g) || []).length;
                    foundStart = true;
                }
                if (lines[i].includes('}')) {
                    braceCount -= (lines[i].match(/\}/g) || []).length;
                }
                if (foundStart && braceCount === 0) {
                    endIdx = i;
                    break;
                }
            }
            if (endIdx !== -1) {
                lines.splice(startIdx, endIdx - startIdx + 1, newTheater);
                content = lines.join('\n');
                changed = true;
            }
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${path.relative(rootDir, filePath)}`);
    }
});
