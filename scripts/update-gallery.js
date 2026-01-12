import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GALLERY_DIR = path.join(__dirname, '../public/gallery');
const DATA_FILE = path.join(__dirname, '../src/data/portfolio.js');
const REMOTE_REPO = 'https://github.com/pronzzz/pranav-clicks';

// Ensure gallery directory exists
if (!fs.existsSync(GALLERY_DIR)) {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
    console.log('Created gallery directory at:', GALLERY_DIR);
}

function formatTitle(filename) {
    // remote extension
    const name = filename.replace(/\.[^/.]+$/, "");
    // replace dashes/underscores with spaces
    return name.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function generatePortfolioData() {
    const files = fs.readdirSync(GALLERY_DIR);
    const images = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

    if (images.length === 0) {
        console.log('No images found in public/gallery. Skipping update.');
        return;
    }

    const items = images.map((file, index) => ({
        id: index + 1,
        url: `/gallery/${file}`,
        title: formatTitle(file),
        preset: "Custom Edit", // Default text
        orientation: "landscape" // Default, advanced: could use image-size to detect
    }));

    const fileContent = `export const PORTFOLIO_ITEMS = ${JSON.stringify(items, null, 2)};`;

    const currentContent = fs.existsSync(DATA_FILE) ? fs.readFileSync(DATA_FILE, 'utf-8') : '';

    if (fileContent !== currentContent) {
        fs.writeFileSync(DATA_FILE, fileContent);
        console.log('Updated src/data/portfolio.js with ' + items.length + ' items.');
        return true; // updated
    } else {
        console.log('No changes detected in gallery data.');
        return false; // no changes
    }
}

function gitPush() {
    exec('git add . && git commit -m "Auto-update gallery" && git push origin main', (error, stdout, stderr) => {
        if (error) {
            console.error(`Git Error: ${error.message}`);
            return;
        }
        if (stderr) console.error(`Git Stderr: ${stderr}`);
        console.log(`Git Stdout: ${stdout}`);
    });
}

// Main execution
const updated = generatePortfolioData();
if (updated) {
    // Optional: Run git push if requested
    // gitPush(); 
    // Commented out to prevent accidental pushes during dev, but user requested automation.
    // We will expose this via a flag or separate command.
}
