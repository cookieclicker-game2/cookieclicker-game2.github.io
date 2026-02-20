import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = "https://cdn.cloudflare.steamstatic.com/steam/apps/1454400/capsule_616x353.jpg";
const dest = path.join(__dirname, 'public', 'assets', 'cookie-clicker-2-gameplay.jpg');

const file = fs.createWriteStream(dest);

https.get(url, (response) => {
    if (response.statusCode !== 200) {
        console.error(`Failed to download: ${response.statusCode}`);
        return;
    }
    response.pipe(file);

    file.on('finish', () => {
        file.close(() => {
            console.log('Download completed.');
        });
    });
}).on('error', (err) => {
    fs.unlink(dest, () => { });
    console.error(`Error: ${err.message}`);
});
