# Cookie Clicker 2 – Free Online Games

Static site for [Cookie Clicker 2](https://cookieclicker2game.org) and a collection of free browser games (clicker, idle, arcade, .io, adventure, sports).

## Stack

- **Vite** – build & dev server
- **Vanilla JS** (ES modules) – search, sidebars, carousel, game grid
- **CSS** – no framework

## Commands

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # output in dist/
npm run preview
```

## Deploy

- **GitHub Pages:** Push to `main`; set repo → Settings → Pages → Source: GitHub Actions or branch `gh-pages` with `dist/` contents.
- **Custom domain:** `public/CNAME` is set to `cookieclicker2game.org`.

## Structure

- `index.html` – homepage (Cookie Clicker 2)
- `*.html` – game pages
- `search/`, `new.games/`, `arcade.games/`, … – section pages
- `src/main.js` – shared logic (search, sidebars, carousel)
- `src/games-data.js` – central game list
- `public/` – robots.txt, sitemap.xml, favicon, CNAME
