import { defineConfig } from 'vite';
import { resolve } from 'path';

import { GAMES } from './src/games-data.js';

const gameInputs = {};
// Add core pages
gameInputs.main = resolve(__dirname, 'index.html');
gameInputs.privacyPolicy = resolve(__dirname, 'privacy-policy/index.html');
gameInputs.notFound = resolve(__dirname, '404/index.html');
gameInputs.arcade = resolve(__dirname, 'arcade.games/index.html');
gameInputs.clicker = resolve(__dirname, 'clicker.games/index.html');
gameInputs.idle = resolve(__dirname, 'idle.games/index.html');
gameInputs.io = resolve(__dirname, 'io.games/index.html');
gameInputs.adventure = resolve(__dirname, 'adventure.games/index.html');
gameInputs.sports = resolve(__dirname, 'sports.games/index.html');
gameInputs.newGames = resolve(__dirname, 'new.games/index.html');
gameInputs.search = resolve(__dirname, 'search/index.html');
gameInputs.aboutUs = resolve(__dirname, 'about-us/index.html');
gameInputs.contactUs = resolve(__dirname, 'contact-us/index.html');
gameInputs.dmca = resolve(__dirname, 'dmca/index.html');
gameInputs.terms = resolve(__dirname, 'terms-of-service/index.html');
gameInputs.cookieClicker2 = resolve(__dirname, 'cookie-clicker-2.html');

// Add games from GAMES data
GAMES.forEach(game => {
    // Generate an input key: camelCase the slug
    const slug = game.url.replace(/^\//, '');
    const key = slug.replace(/-([a-z0-9])/g, (g) => g[1].toUpperCase());
    
    // Check if file exists (safety)
    const fileName = slug + '.html';
    gameInputs[key] = resolve(__dirname, fileName);
});

export default defineConfig({
    build: {
        rollupOptions: {
            input: gameInputs,
        },
    },
});
