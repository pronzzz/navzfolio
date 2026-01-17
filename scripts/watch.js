import fs from 'fs';
import path from 'path';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WATCH_DIR = path.join(__dirname, '../Edits');
const UPDATE_SCRIPT = path.join(__dirname, 'update-gallery.js');

if (!fs.existsSync(WATCH_DIR)) {
    console.log('Edits directory not found. Waiting for creation...');
} else {
    console.log(`Watching for changes in ${WATCH_DIR}...`);
}

let debounceTimer;

// Watch the directory (if it exists, or handle non-existence)
// fs.watch throws if dir doesn't exist.
try {
    fs.watch(WATCH_DIR, (eventType, filename) => {
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
} catch (e) {
    console.log("Could not start watcher (directory might be missing):", e.message);
}
