import './style.css'
import { GAMES } from './games-data.js'

// Google Analytics 4 (global for all pages that load main.js)
const GA_MEASUREMENT_ID = 'G-18N88RML8L';
function initGA() {
    // Prevent duplicate initialization if script/tag already exists.
    if (window.gtag || document.querySelector(`script[src*="gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
        return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
        window.dataLayer.push(arguments);
    };

    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(gaScript);

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
}
initGA();

// Embed game in #game-frame: homepage, Cookie Clicker, Cookie Clicker 2 → memelite70; other game pages keep their own iframe
const gameContainer = document.querySelector('#game-frame');
const pathname = (window.location.pathname || '').replace(/\/index\.html$/, '/') || '/';
const isHome = pathname === '/' || pathname === '';
const isCookieClickerOr2 = pathname.includes('cookie-clicker');
if (gameContainer && (isHome || isCookieClickerOr2)) {
    gameContainer.innerHTML = '<iframe src="https://memelite70.github.io/assets/cookie-clicker" width="100%" height="100%" frameborder="0" scrolling="no" allow="autoplay; fullscreen" allowfullscreen></iframe>';
}

const fullscreenBtn = document.querySelector('#fullscreen-btn');
if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
        const elem = document.querySelector('#game-frame');
        if (elem && elem.requestFullscreen) {
            elem.requestFullscreen();
        }
    });
}

const focusModeBtn = document.querySelector('#focus-mode-btn');
if (focusModeBtn) {
    focusModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('focus-mode');
    });
}

// ── Real search: filter games and show dropdown ─────────────────────────────
function normalize(s) {
    return (s || '').toLowerCase().trim();
}

function matchGame(game, query) {
    const q = normalize(query);
    if (!q) return false;
    const nameMatch = normalize(game.name).includes(q);
    const categoryMatch = (game.categories || [game.category]).some(
        (c) => normalize(c).includes(q)
    );
    return nameMatch || categoryMatch;
}

function renderSearchResults(query) {
    const filtered = query.trim() ? GAMES.filter((g) => matchGame(g, query)) : [];
    return filtered.slice(0, 10);
}

/** All matches for the search page (no limit). Used only on /search/ */
function getSearchResultsFull(query) {
    const q = (query || '').trim();
    return q ? GAMES.filter((g) => matchGame(g, q)) : [];
}

/** Pick n random games for "no results" suggestions */
function getRandomGames(n) {
    const arr = GAMES.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, n);
}

function getGameCategoryLabel(game) {
    const cats = game.categories || (game.category ? [game.category] : []);
    return cats[0] || game.category || '';
}

function initSearch() {
    const containers = document.querySelectorAll('.search-container');
    containers.forEach((container) => {
        const input = container.querySelector('.search-input');
        if (!input) return;

        input.setAttribute('autocomplete', 'off');
        input.setAttribute('aria-autocomplete', 'list');
        input.setAttribute('aria-expanded', 'false');

        let dropdown = container.querySelector('.search-results');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'search-results';
            dropdown.setAttribute('role', 'listbox');
            dropdown.setAttribute('id', 'search-results-' + Math.random().toString(36).slice(2, 9));
            container.appendChild(dropdown);
        }
        const listboxId = dropdown.id;
        if (listboxId) input.setAttribute('aria-controls', listboxId);

        function setOpen(open) {
            dropdown.classList.toggle('is-open', open);
            input.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        function updateDropdown() {
            const query = input.value;
            const results = renderSearchResults(query);
            dropdown.innerHTML = '';
            setOpen(false);

            if (!query.trim()) {
                return;
            }
            if (results.length === 0) {
                dropdown.innerHTML = '<div class="search-results-empty">No games found</div>';
                setOpen(true);
                return;
            }
            results.forEach((game) => {
                const a = document.createElement('a');
                a.href = game.url;
                a.className = 'search-results-item';
                a.setAttribute('role', 'option');
                const catLabel = getGameCategoryLabel(game);
                a.innerHTML = '<span class="search-results-item-img"><img src="' + escapeHtml(game.image) + '" alt="" loading="lazy"></span>' +
                    '<span class="search-results-item-info">' +
                    '<span class="search-results-item-name">' + escapeHtml(game.name) + '</span>' +
                    (catLabel ? '<span class="search-results-item-cat">' + escapeHtml(catLabel) + '</span>' : '') +
                    '</span>';
                a.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    input.blur();
                });
                dropdown.appendChild(a);
            });
            setOpen(true);
        }

        let debounceTimer = 0;
        function scheduleUpdate() {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                debounceTimer = 0;
                updateDropdown();
            }, 120);
        }

        input.addEventListener('input', scheduleUpdate);
        input.addEventListener('focus', function () {
            if (input.value.trim()) updateDropdown();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
                input.blur();
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const q = input.value.trim();
                window.location.href = '/search/' + (q ? '?q=' + encodeURIComponent(q) : '');
            }
        });

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) setOpen(false);
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ── New Games sidebars: Arcade / .io / Adventure / Sports, newest first, alternating left/right ──
const SIDEBAR_CATEGORIES = ['Arcade', '.io', 'Adventure', 'Sports'];

function getSidebarGames() {
    const hasSidebarCategory = (g) =>
        (g.categories || [g.category]).some((c) => SIDEBAR_CATEGORIES.includes(c));
    return GAMES.filter(hasSidebarCategory).sort((a, b) => {
        const da = a.addedDate || '';
        const db = b.addedDate || '';
        return db.localeCompare(da);
    });
}

function initSidebars() {
    const leftEl = document.getElementById('sidebar-left-content');
    const rightEl = document.getElementById('sidebar-right-content');
    if (!leftEl || !rightEl) return;
    const list = getSidebarGames();
    const empty = '<div class="sidebar-empty-slot">New games coming soon</div>';
    if (!list.length) {
        leftEl.innerHTML = empty;
        rightEl.innerHTML = empty;
        return;
    }
    leftEl.innerHTML = '';
    rightEl.innerHTML = '';
    list.forEach((game, i) => {
        const card = '<a href="' + escapeHtml(game.url) + '" class="sidebar-game-card">' +
            '<div class="sidebar-game-thumb"><img src="' + escapeHtml(game.image) + '" alt="' + escapeHtml(game.name) + '" loading="lazy"></div>' +
            '<span class="sidebar-game-name">' + escapeHtml(game.name) + '</span></a>';
        if (i % 2 === 0) {
            leftEl.innerHTML += card;
        } else {
            rightEl.innerHTML += card;
        }
    });
    if (!leftEl.innerHTML.trim()) leftEl.innerHTML = empty;
    if (!rightEl.innerHTML.trim()) rightEl.innerHTML = empty;
}

// ── /search/ page: fill form value and results from ?q= (does not affect navbar search) ──
function initSearchPage() {
    const p = (window.location.pathname || '').replace(/\/index\.html$/, '/') || '/';
    if (p !== '/search/') return;

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';

    const formInput = document.getElementById('search-query');
    const navbarInput = document.querySelector('.search-container .search-input');
    const resultsHeading = document.getElementById('search-results-heading');
    const resultsList = document.getElementById('search-results-list');

    if (formInput) formInput.value = q;
    if (navbarInput) navbarInput.value = q;

    if (q) {
        const results = getSearchResultsFull(q);
        if (resultsHeading) {
            resultsHeading.hidden = false;
            resultsHeading.textContent = results.length === 0
                ? 'No games found for "' + escapeHtml(q) + '".'
                : 'Found ' + results.length + (results.length === 1 ? ' game' : ' games') + ' for "' + escapeHtml(q) + '".';
        }
        if (resultsList) {
            if (results.length === 0) {
                const suggested = getRandomGames(6);
                const suggestionCards = suggested.map((game) =>
                    '<a href="' + escapeHtml(game.url) + '" class="game-card">' +
                    '<img src="' + escapeHtml(game.image) + '" alt="' + escapeHtml(game.name) + '" loading="lazy">' +
                    '<div class="game-card-content"><span class="game-card-title">' + escapeHtml(game.name) + '</span></div></a>'
                ).join('');
                resultsList.innerHTML = '<p class="search-suggest-label">You might like:</p><div class="game-grid">' + suggestionCards + '</div>';
                resultsList.classList.remove('game-grid');
            } else {
                resultsList.innerHTML = results.map((game) =>
                    '<a href="' + escapeHtml(game.url) + '" class="game-card">' +
                    '<img src="' + escapeHtml(game.image) + '" alt="' + escapeHtml(game.name) + '" loading="lazy">' +
                    '<div class="game-card-content"><span class="game-card-title">' + escapeHtml(game.name) + '</span></div></a>'
                ).join('');
                resultsList.classList.add('game-grid');
            }
        }
    } else {
        if (resultsHeading) { resultsHeading.hidden = true; resultsHeading.textContent = ''; }
        if (resultsList) { resultsList.innerHTML = ''; resultsList.classList.remove('game-grid'); }
    }
}

// ── /new.games/ page: grid of newest Arcade / .io / Adventure / Sports games ──
function initNewGamesGrid() {
    const grid = document.querySelector('.game-category-section .game-grid');
    if (!grid) return;

    // Only run on the New Games page
    if (pathname !== '/new.games/') return;

    const list = getSidebarGames();
    if (!list.length) {
        grid.innerHTML = '<p>No new games available yet.</p>';
        return;
    }

    grid.innerHTML = list
        .map(
            (game) =>
                '<a href="' + escapeHtml(game.url) + '" class="game-card">' +
                '<img src="' + escapeHtml(game.image) + '" alt="' + escapeHtml(game.name) + '" loading="lazy">' +
                '<div class="game-card-content"><span class="game-card-title">' + escapeHtml(game.name) + '</span></div></a>'
        )
        .join('');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}

// ── Carousel: fill with Clicker + Idle games (exclude current page) ─────────
function getRecommendedForCarousel() {
    const pathname = (window.location.pathname || '').replace(/\/index\.html$/, '/') || '/';
    const isHome = pathname === '/' || pathname === '';
    const currentGameUrl = isHome ? '/cookie-clicker-2' : pathname;
    const hasClickerOrIdle = (g) => (g.categories || [g.category]).some((c) => c === 'Clicker' || c === 'Idle');
    return GAMES.filter(hasClickerOrIdle).filter((g) => g.url !== currentGameUrl);
}

function renderCarouselTrack() {
    const track = document.getElementById('game-carousel-track');
    if (!track) return;
    const recommended = getRecommendedForCarousel();
    track.innerHTML = recommended
        .map(
            (g) =>
                '<a href="' + escapeHtml(g.url) + '" class="carousel-card">' +
                '<img src="' + escapeHtml(g.image) + '" alt="' + escapeHtml(g.name) + '" loading="lazy">' +
                '<div class="carousel-card-title">' + escapeHtml(g.name) + '</div></a>'
        )
        .join('');
}

// Game Carousel + Sidebars + Search page: run when DOM ready (module may load after DOMContentLoaded)
function initCarousel() {
    renderCarouselTrack();
    initSidebars();
    initNewGamesGrid();
    initSearchPage();
    const track = document.getElementById('game-carousel-track');
    const prevBtn = document.querySelector('.carousel-btn.prev-btn');
    const nextBtn = document.querySelector('.carousel-btn.next-btn');
    if (track && prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            const card = track.querySelector('.carousel-card');
            if (card) {
                const cardWidth = card.offsetWidth;
                const gap = 15;
                track.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
            }
        });
        prevBtn.addEventListener('click', () => {
            const card = track.querySelector('.carousel-card');
            if (card) {
                const cardWidth = card.offsetWidth;
                const gap = 15;
                track.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
            }
        });
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
} else {
    initCarousel();
}

console.log('Cookie Clicker 2 initialized');

// Mobile Menu Logic
window.toggleMobileMenu = function () {
    const navUl = document.querySelector('nav ul');
    if (navUl) {
        navUl.classList.toggle('active');
    }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const navUl = document.querySelector('nav ul');
    const btn = document.querySelector('.mobile-menu-btn');

    if (navUl && navUl.classList.contains('active') && btn) {
        if (!navUl.contains(e.target) && !btn.contains(e.target)) {
            navUl.classList.remove('active');
        }
    }
});

