/**
 * Image Optimization Script
 * Converts PNG and JPG images to WebP format for better performance
 *
 * Usage: npm run optimize-images
 *
 * This creates WebP versions of all images while keeping originals as fallbacks.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'images');
const QUALITY = 85; // WebP quality (0-100)

// Recursively get all image files
function getImageFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...getImageFiles(fullPath));
        } else if (/\.(png|jpg|jpeg)$/i.test(item.name)) {
            files.push(fullPath);
        }
    }

    return files;
}

// Convert a single image to WebP
async function convertToWebP(inputPath) {
    const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

    // Skip if WebP already exists and is newer than source
    if (fs.existsSync(outputPath)) {
        const srcStat = fs.statSync(inputPath);
        const webpStat = fs.statSync(outputPath);
        if (webpStat.mtime >= srcStat.mtime) {
            return { skipped: true, path: outputPath };
        }
    }

    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // Resize if larger than 1920px wide (for web optimization)
        let pipeline = image;
        if (metadata.width > 1920) {
            pipeline = pipeline.resize(1920, null, {
                withoutEnlargement: true,
                fit: 'inside'
            });
        }

        await pipeline
            .webp({ quality: QUALITY })
            .toFile(outputPath);

        // Get file sizes for comparison
        const originalSize = fs.statSync(inputPath).size;
        const webpSize = fs.statSync(outputPath).size;
        const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);

        return {
            converted: true,
            path: outputPath,
            originalSize,
            webpSize,
            savings
        };
    } catch (error) {
        return {
            error: true,
            path: inputPath,
            message: error.message
        };
    }
}

async function main() {
    console.log('Image Optimization Script');
    console.log('=========================\n');

    if (!fs.existsSync(IMAGES_DIR)) {
        console.error('Images directory not found:', IMAGES_DIR);
        process.exit(1);
    }

    const imageFiles = getImageFiles(IMAGES_DIR);
    console.log(`Found ${imageFiles.length} images to process\n`);

    let converted = 0;
    let skipped = 0;
    let errors = 0;
    let totalSaved = 0;

    for (const file of imageFiles) {
        const relativePath = path.relative(IMAGES_DIR, file);
        process.stdout.write(`Processing: ${relativePath}... `);

        const result = await convertToWebP(file);

        if (result.skipped) {
            console.log('Skipped (up to date)');
            skipped++;
        } else if (result.error) {
            console.log(`Error: ${result.message}`);
            errors++;
        } else {
            console.log(`Saved ${result.savings}% (${formatBytes(result.originalSize)} -> ${formatBytes(result.webpSize)})`);
            converted++;
            totalSaved += result.originalSize - result.webpSize;
        }
    }

    console.log('\n=========================');
    console.log('Summary:');
    console.log(`  Converted: ${converted}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Errors: ${errors}`);
    console.log(`  Total saved: ${formatBytes(totalSaved)}`);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

main().catch(console.error);
