/**
 * Download all Google Maps photos locally to avoid API key exposure
 * Converts photo URLs to local file paths in JSON data files
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
require('dotenv').config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DATA_DIR = path.join(__dirname, '..', 'data');
const IMAGES_DIR = path.join(__dirname, '..', 'images', 'places');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Files to process
const JSON_FILES = [
    'malls.json', 'boutiques.json', 'specialty_shops.json',
    'museums.json', 'religious_sites.json',
    'banking.json', 'education.json', 'healthcare.json',
    'restaurants.json', 'cafes.json', 'hotels.json',
    'premium_spots.json', 'locality_photos.json'
];

// Download a single image (with redirect support)
function downloadImage(url, filepath, redirectCount = 0) {
    return new Promise((resolve, reject) => {
        // Prevent infinite redirect loops
        if (redirectCount > 5) {
            reject(new Error('Too many redirects'));
            return;
        }

        // Remove any existing API key and add the new one
        let finalUrl = url;
        if (url.includes('googleapis.com')) {
            // Strip old API key if present
            finalUrl = url.replace(/&key=[^&]+/, '');
            // Add new API key
            finalUrl = `${finalUrl}&key=${GOOGLE_MAPS_API_KEY}`;
        }

        // Parse the URL to handle both http and https
        const urlObj = new URL(finalUrl);
        const protocol = urlObj.protocol === 'https:' ? https : require('http');

        protocol.get(finalUrl, (response) => {
            // Handle redirects (301, 302, 307, 308)
            if ([301, 302, 307, 308].includes(response.statusCode)) {
                const redirectUrl = response.headers.location;
                if (!redirectUrl) {
                    reject(new Error('Redirect without location header'));
                    return;
                }
                // Follow redirect
                downloadImage(redirectUrl, filepath, redirectCount + 1)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            const file = fs.createWriteStream(filepath);
            response.pipe(file);

            file.on('finish', () => {
                file.close(() => {
                    // Verify file has content
                    const stats = fs.statSync(filepath);
                    if (stats.size === 0) {
                        fs.unlinkSync(filepath);
                        reject(new Error('Downloaded file is empty'));
                        return;
                    }
                    resolve();
                });
            });

            file.on('error', (err) => {
                fs.unlink(filepath, () => {}); // Delete partial file
                reject(err);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {}); // Delete partial file
            reject(err);
        });
    });
}

// Generate filename from URL
function getFilenameFromUrl(url) {
    // Extract photoreference from URL
    const match = url.match(/photoreference=([^&]+)/);
    if (match) {
        // Use first 16 chars of photo reference as filename
        const photoRef = match[1].substring(0, 16);
        return `${photoRef}.jpg`;
    }
    // Fallback: hash the URL
    const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 16);
    return `${hash}.jpg`;
}

// Delay helper
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processFile(filename) {
    const filepath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filepath)) {
        console.log(`⚠️  Skipping ${filename} (not found)`);
        return;
    }

    console.log(`\n📂 Processing ${filename}...`);

    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    let downloadCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process array or object
    const items = Array.isArray(data) ? data : Object.values(data);

    for (const item of items) {
        if (item.image && item.image.includes('googleapis.com')) {
            const imageUrl = item.image;
            const filename = getFilenameFromUrl(imageUrl);
            const localPath = path.join(IMAGES_DIR, filename);
            const relativePath = `images/places/${filename}`;

            // Check if already downloaded
            if (fs.existsSync(localPath)) {
                console.log(`   ⏭️  Already exists: ${filename}`);
                item.image = relativePath;
                skipCount++;
                continue;
            }

            // Download the image
            try {
                console.log(`   ⬇️  Downloading: ${filename}`);
                await downloadImage(imageUrl, localPath);
                item.image = relativePath;
                downloadCount++;

                // Rate limiting - 5 requests per second
                await delay(200);
            } catch (error) {
                console.error(`   ❌ Failed to download ${filename}: ${error.message}`);
                errorCount++;
                // Keep original URL on error
            }
        }
    }

    // Write updated JSON back
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`   ✅ Downloaded: ${downloadCount} | Skipped: ${skipCount} | Errors: ${errorCount}`);
}

async function main() {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error('❌ ERROR: GOOGLE_MAPS_API_KEY not found in .env file');
        process.exit(1);
    }

    console.log('🚀 Starting photo download process...');
    console.log(`📁 Images will be saved to: ${IMAGES_DIR}`);

    let totalDownloaded = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const file of JSON_FILES) {
        try {
            await processFile(file);
        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
        }
    }

    console.log('\n✅ Photo download complete!');
    console.log('📊 Summary:');
    console.log(`   - Images directory: ${IMAGES_DIR}`);
    console.log(`   - All JSON files updated with local paths`);
    console.log('\n⚠️  Next steps:');
    console.log('   1. Check images/places/ folder to verify photos downloaded');
    console.log('   2. Test your app to ensure images load correctly');
    console.log('   3. Commit changes: git add . && git commit -m "fix: remove API keys and use local photos"');
    console.log('   4. Push to GitHub: git push');
}

main().catch(console.error);
