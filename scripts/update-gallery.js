import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import sizeOf from 'image-size';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '../Edits');
const GALLERY_DIR = path.join(__dirname, '../public/gallery');
const DATA_FILE = path.join(__dirname, '../src/data/portfolio.js');

const MAX_WIDTH = 2500;
const QUALITY = 85;

// Ensure directories exist
if (!fs.existsSync(GALLERY_DIR)) {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
}

function formatTitle(filename) {
    const name = filename.replace(/\.[^/.]+$/, "");
    return name.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

async function syncImages() {
    if (!fs.existsSync(SOURCE_DIR)) {
        console.log('Edits directory not found. Skipping sync.');
        return;
    }

    const sourceFiles = fs.readdirSync(SOURCE_DIR);
    const validExtensions = /\.(jpg|jpeg|png|webp)$/i;

    let syncedCount = 0;

    for (const file of sourceFiles) {
        if (validExtensions.test(file)) {
            const srcPath = path.join(SOURCE_DIR, file);

            // Change extension to .webp for better compression
            const fileNameNoExt = file.replace(/\.[^/.]+$/, "");
            const destFile = `${fileNameNoExt}.webp`;
            const destPath = path.join(GALLERY_DIR, destFile);

            let shouldProcess = true;
            if (fs.existsSync(destPath)) {
                try {
                    const srcStat = fs.statSync(srcPath);
                    const destStat = fs.statSync(destPath);
                    // If src is older than dest, we assume it's up to date
                    if (srcStat.mtime < destStat.mtime) {
                        shouldProcess = false;
                    }
                } catch (e) { }
            }

            if (shouldProcess) {
                try {
                    console.log(`Optimizing ${file} -> ${destFile}...`);
                    await sharp(srcPath)
                        .rotate()
                        .resize({
                            width: MAX_WIDTH,
                            withoutEnlargement: true
                        })
                        .webp({ quality: QUALITY })
                        .toFile(destPath);
                    syncedCount++;
                } catch (error) {
                    console.error(`Failed to process ${file}:`, error.message);
                }
            }
        }
    }

    // Cleanup: Remove files that don't have a source
    const galleryFiles = fs.readdirSync(GALLERY_DIR);
    for (const file of galleryFiles) {
        // If it's a webp, check if there's a matching source file with any valid extension
        if (file.endsWith('.webp')) {
            const nameNoExt = file.replace('.webp', '');
            const hasSource = sourceFiles.some(src => src.startsWith(nameNoExt + '.'));

            if (!hasSource) {
                fs.unlinkSync(path.join(GALLERY_DIR, file));
                console.log(`Removed ${file} from gallery (source deleted).`);
            }
        } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
            // Remove legacy formats - we moving to webp
            fs.unlinkSync(path.join(GALLERY_DIR, file));
            console.log(`Removed legacy format ${file} from gallery.`);
        }
    }

    console.log(`Optimized and synced ${syncedCount} new/updated images.`);
}

async function generatePortfolioData() {
    // 1. Sync first
    await syncImages();

    // 2. Read Gallery
    const files = fs.readdirSync(GALLERY_DIR);
    // Only look for webp now
    const images = files.filter(file => /\.(webp)$/i.test(file));

    if (images.length === 0) {
        console.log('No images found in public/gallery.');
        const emptyContent = `export const PORTFOLIO_ITEMS = [];`;
        fs.writeFileSync(DATA_FILE, emptyContent);
        return true;
    }

    const items = images.map((file, index) => {
        const filePath = path.join(GALLERY_DIR, file);
        let orientation = 'landscape';
        try {
            const buffer = fs.readFileSync(filePath);
            const dimensions = sizeOf(buffer);
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
(async () => {
    try {
        const updated = await generatePortfolioData();
        if (updated) {
            gitPush();
        }
    } catch (error) {
        console.error("Error in update-gallery:", error);
        process.exit(1);
    }
})();
