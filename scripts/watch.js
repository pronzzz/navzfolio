import fs from 'fs';
import path from 'path';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GALLERY_DIR = path.join(__dirname, '../public/gallery');
const UPDATE_SCRIPT = path.join(__dirname, 'update-gallery.js');

console.log(`Watching for changes in ${GALLERY_DIR}...`);

let debounceTimer;

fs.watch(GALLERY_DIR, (eventType, filename) => {
    if (filename && !filename.startsWith('.')) {
        console.log(`Detected change: ${eventType} on ${filename}`);

        // Debounce to avoid multiple triggers
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            console.log('Running update script...');
            fork(UPDATE_SCRIPT);
        }, 1000);
    }
});
