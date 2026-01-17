import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import sizeOf from 'image-size';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '../Edits');
const GALLERY_DIR = path.join(__dirname, '../public/gallery');
const DATA_FILE = path.join(__dirname, '../src/data/portfolio.js');

// Ensure directories exist
if (!fs.existsSync(GALLERY_DIR)) {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
}

function formatTitle(filename) {
    const name = filename.replace(/\.[^/.]+$/, "");
    return name.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function syncImages() {
    if (!fs.existsSync(SOURCE_DIR)) {
        console.log('Edits directory not found. Skipping sync.');
        return;
    }

    const sourceFiles = fs.readdirSync(SOURCE_DIR);
    const validExtensions = /\.(jpg|jpeg|png|webp)$/i;

    let syncedCount = 0;

    sourceFiles.forEach(file => {
        if (validExtensions.test(file)) {
            const srcPath = path.join(SOURCE_DIR, file);
            const destPath = path.join(GALLERY_DIR, file);

            // Copy if doesn't exist or if newer? For now just copy if missing or overwrite.
            // Using copyFileSync overwrites by default.
            fs.copyFileSync(srcPath, destPath);
            syncedCount++;
        }
    });

    // Optional: Clean up files in gallery that are NOT in Edits?
    // User didn't ask for sync-delete, but "implement my images".
    // "remove the placeholder images" -> implies replacing.
    // Ideally we should mirror Edits.
    // Let's list files in Gallery and delete those not in Edits (if Edits is not empty).
    if (sourceFiles.length > 0) {
        const galleryFiles = fs.readdirSync(GALLERY_DIR);
        galleryFiles.forEach(file => {
            if (!sourceFiles.includes(file) && validExtensions.test(file)) {
                fs.unlinkSync(path.join(GALLERY_DIR, file));
                console.log(`Removed ${file} from gallery (not in Edits).`);
            }
        });
    }

    console.log(`Synced ${syncedCount} images from Edits to public/gallery.`);
}

function generatePortfolioData() {
    // 1. Sync first
    syncImages();

    // 2. Read Gallery
    const files = fs.readdirSync(GALLERY_DIR);
    const images = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

    if (images.length === 0) {
        console.log('No images found in public/gallery.');
        // Write empty array?
        const emptyContent = `export const PORTFOLIO_ITEMS = [];`;
        fs.writeFileSync(DATA_FILE, emptyContent);
        return true;
    }

    const items = images.map((file, index) => {
        const filePath = path.join(GALLERY_DIR, file);
        let orientation = 'landscape';
        try {
            const dimensions = sizeOf(filePath);
            if (dimensions.width && dimensions.height) {
                orientation = dimensions.height > dimensions.width ? 'portrait' : 'landscape';
            }
        } catch (err) {
            console.error(`Error reading dimensions for ${file}:`, err.message);
        }

        return {
            id: index + 1,
            url: `/gallery/${file}`,
            title: formatTitle(file),
            preset: "Custom Edit",
            orientation: orientation
        };
    });

    const fileContent = `export const PORTFOLIO_ITEMS = ${JSON.stringify(items, null, 2)};`;

    let currentContent = '';
    if (fs.existsSync(DATA_FILE)) {
        currentContent = fs.readFileSync(DATA_FILE, 'utf-8');
    }

    if (fileContent !== currentContent) {
        fs.writeFileSync(DATA_FILE, fileContent);
        console.log('Updated src/data/portfolio.js with ' + items.length + ' items.');
        return true;
    } else {
        console.log('No changes detected in gallery data.');
        return false;
    }
}

function gitPush() {
    // Check if we are in CI environment to avoid duplicate pushes or auth errors
    if (process.env.CI) {
        console.log('Running in CI, skipping script-based git push (CI should handle it).');
        return;
    }

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
try {
    const updated = generatePortfolioData();
    if (updated) {
        // Only push if explicitly running in a context where auto-push is desired?
        // The previous script ran gitPush() automatically.
        // We'll keep it, but maybe verify if 'Edits' changed anything.
        gitPush();
    }
} catch (error) {
    console.error("Error in update-gallery:", error);
    process.exit(1);
}

