const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const FORCE_DOWNLOAD = process.argv.includes('--force');
const LOCALITY_PHOTOS_PATH = path.join(__dirname, '..', 'data', 'locality_photos.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'images', 'localities');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}`);
}

// Read locality photos JSON
const localityPhotos = JSON.parse(fs.readFileSync(LOCALITY_PHOTOS_PATH, 'utf8'));

// Helper function to sanitize locality name for filename
function sanitizeFilename(localityName) {
    return localityName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
}

// Helper function to download image (with redirect support)
function downloadImage(url, filepath, redirectCount = 0) {
    return new Promise((resolve, reject) => {
        // Check if file already exists (skip check if force download enabled)
        if (!FORCE_DOWNLOAD && fs.existsSync(filepath)) {
            console.log(`✓ Already exists: ${path.basename(filepath)} (skipping)`);
            resolve(filepath);
            return;
        }

        // Prevent infinite redirect loops
        if (redirectCount > 5) {
            reject(new Error('Too many redirects'));
            return;
        }

        if (redirectCount === 0) {
            console.log(`Downloading: ${path.basename(filepath)}`);
        }

        https.get(url, (response) => {
            // Handle redirects (302, 301, etc.)
            if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
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
                file.close();
                console.log(`✓ Downloaded: ${path.basename(filepath)}`);
                resolve(filepath);
            });

            file.on('error', (err) => {
                fs.unlink(filepath, () => {}); // Delete partial file
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function downloadAllPhotos() {
    console.log('\n📸 Starting locality photo download...\n');
    console.log(`Using API key: ${GOOGLE_MAPS_API_KEY ? '✓ Found' : '✗ Missing'}`);
    if (FORCE_DOWNLOAD) {
        console.log('Force download mode: ✓ Enabled\n');
    } else {
        console.log('');
    }

    if (!GOOGLE_MAPS_API_KEY) {
        console.error('❌ ERROR: GOOGLE_MAPS_API_KEY not found in .env file!');
        process.exit(1);
    }

    const results = {
        downloaded: 0,
        skipped: 0,
        failed: 0,
        total: 0
    };

    const updates = {}; // Track updated photo_url paths

    for (const [localityName, data] of Object.entries(localityPhotos)) {
        results.total++;

        // Skip if already local (unless force download is enabled)
        if (!FORCE_DOWNLOAD && (data.is_local || (data.photo_url && data.photo_url.startsWith('images/')))) {
            console.log(`⊘ Skipping ${localityName}: Already uses local image`);
            results.skipped++;
            updates[localityName] = data; // Keep as-is
            continue;
        }

        // Skip if no photo reference
        if (!data.photo_reference) {
            console.log(`⊘ Skipping ${localityName}: No photo reference`);
            results.skipped++;
            updates[localityName] = data; // Keep as-is
            continue;
        }

        try {
            // Build new URL with fresh API key
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${data.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`;

            // Create filename
            const filename = `locality_${sanitizeFilename(localityName)}.jpg`;
            const filepath = path.join(OUTPUT_DIR, filename);

            // Download image
            await downloadImage(photoUrl, filepath);

            // Update with local path
            updates[localityName] = {
                ...data,
                photo_url: `images/localities/${filename}`,
                is_local: true
            };

            // Check if file exists
            if (fs.existsSync(filepath)) {
                results.downloaded++;
            } else {
                results.skipped++;
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
            console.error(`✗ Failed to download ${localityName}:`, error.message);
            results.failed++;
            updates[localityName] = data; // Keep original if failed
        }
    }

    // Save updated locality_photos.json
    console.log('\n💾 Updating locality_photos.json...');
    fs.writeFileSync(LOCALITY_PHOTOS_PATH, JSON.stringify(updates, null, 2), 'utf8');
    console.log('✓ Updated locality_photos.json\n');

    // Print summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total localities:     ${results.total}`);
    console.log(`✓ Downloaded:         ${results.downloaded}`);
    console.log(`⊘ Skipped:            ${results.skipped}`);
    console.log(`✗ Failed:             ${results.failed}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (results.failed === 0) {
        console.log('✅ All photos processed successfully!\n');
        console.log('🎉 Your app is now fully local - no API key needed for locality photos!\n');
    } else {
        console.log('⚠️  Some photos failed to download. Check errors above.\n');
    }
}

// Run the download
downloadAllPhotos().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
