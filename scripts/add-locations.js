/**
 * Script to add location coordinates to dining data files
 * Uses Google Places API to fetch lat/lng from place IDs
 */

const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = 'AIzaSyCoD9cHQYn_EdCJOqNedXQjXQYlYtrVz3I';

const DATA_DIR = path.join(__dirname, '..', 'data');

// Files that need location data
const FILES_TO_UPDATE = ['restaurants.json', 'cafes.json', 'hotels.json'];

// Rate limiting - 10 requests per second max
const DELAY_MS = 150;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getPlaceDetails(placeId) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.result?.geometry?.location) {
            return {
                lat: data.result.geometry.location.lat,
                lng: data.result.geometry.location.lng
            };
        }
        console.warn(`No location found for ${placeId}: ${data.status}`);
        return null;
    } catch (error) {
        console.error(`Error fetching ${placeId}:`, error.message);
        return null;
    }
}

async function updateFile(filename) {
    const filepath = path.join(DATA_DIR, filename);
    console.log(`\nProcessing ${filename}...`);

    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < data.length; i++) {
        const item = data[i];

        // Skip if already has location
        if (item.location && item.location.lat && item.location.lng) {
            skipped++;
            continue;
        }

        console.log(`  [${i + 1}/${data.length}] Fetching location for: ${item.name}`);

        const location = await getPlaceDetails(item.id);

        if (location) {
            data[i].location = location;
            updated++;
        } else {
            failed++;
        }

        await delay(DELAY_MS);
    }

    // Save updated data
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    console.log(`\n${filename} complete:`);
    console.log(`  - Updated: ${updated}`);
    console.log(`  - Skipped (had location): ${skipped}`);
    console.log(`  - Failed: ${failed}`);

    return { updated, skipped, failed };
}

async function main() {
    console.log('Adding location coordinates to dining data files...');
    console.log('='.repeat(50));

    const results = {};

    for (const file of FILES_TO_UPDATE) {
        try {
            results[file] = await updateFile(file);
        } catch (error) {
            console.error(`Error processing ${file}:`, error.message);
            results[file] = { error: error.message };
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('SUMMARY:');
    for (const [file, result] of Object.entries(results)) {
        if (result.error) {
            console.log(`  ${file}: ERROR - ${result.error}`);
        } else {
            console.log(`  ${file}: ${result.updated} updated, ${result.skipped} skipped, ${result.failed} failed`);
        }
    }
}

main().catch(console.error);
