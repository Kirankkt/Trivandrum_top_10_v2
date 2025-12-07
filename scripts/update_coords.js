const fs = require('fs');
const path = require('path');

const rankingsPath = path.join(__dirname, '../data/rankings.json');

try {
    const rawData = fs.readFileSync(rankingsPath, 'utf8');
    const rankings = JSON.parse(rawData);

    // Coordinates to create
    const coordsMap = {
        'Pattom': { lat: 8.5215, lng: 76.9360 },
        'Kowdiar': { lat: 8.5241, lng: 76.9538 },
        'Vazhuthacaud': { lat: 8.4988, lng: 76.9577 },
        'Sreekaryam': { lat: 8.5467, lng: 76.9163 },
        'Kazhakkoottam': { lat: 8.5676, lng: 76.8767 },
        'Vellayambalam': { lat: 8.5110, lng: 76.9530 },
        'Thampanoor': { lat: 8.4870, lng: 76.9472 },
        'Palayam': { lat: 8.5029, lng: 76.9529 },
        'Sasthamangalam': { lat: 8.5085, lng: 76.9698 },
        'Peroorkada': { lat: 8.5350, lng: 76.9650 }
    };

    let updatedCount = 0;

    // Helper to update specific locality object
    function updateLocality(loc) {
        if (coordsMap[loc.name]) {
            let changed = false;
            // Update top level
            if (!loc.latitude) {
                loc.latitude = coordsMap[loc.name].lat;
                loc.longitude = coordsMap[loc.name].lng;
                changed = true;
            }
            // Update nested data if exists
            if (loc.data && !loc.data.latitude) {
                loc.data.latitude = coordsMap[loc.name].lat;
                loc.data.longitude = coordsMap[loc.name].lng;
                changed = true;
            }
            if (changed) {
                console.log(`Updated ${loc.name}`);
                updatedCount++;
            }
        }
    }

    // Process top_10
    if (rankings.top_10) {
        rankings.top_10.forEach(updateLocality);
    }

    // Process all_rankings if exists
    if (rankings.all_rankings) {
        rankings.all_rankings.forEach(updateLocality);
    }

    if (updatedCount > 0) {
        fs.writeFileSync(rankingsPath, JSON.stringify(rankings, null, 2));
        console.log(`Successfully updated ${updatedCount} localities.`);
    } else {
        console.log('No updates needed.');
    }

} catch (err) {
    console.error('Error:', err);
}
