// Data Fetcher for New Categories
// Run with: node scripts/fetch_new_categories.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyCxkCgpESLmnZ3XmgYJPNHS-Q9RmiKl7b0';
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const DATA_DIR = path.join(__dirname, '..', 'data');

// Categories to fetch
const CATEGORIES = {
  // Shopping
  supermarkets: {
    query: 'supermarkets grocery stores in Thiruvananthapuram',
    filename: 'supermarkets.json'
  },
  clothing_stores: {
    query: 'clothing stores fashion boutiques apparel in Thiruvananthapuram',
    filename: 'clothing_stores.json'
  },

  // Culture
  art_galleries: {
    query: 'art galleries in Thiruvananthapuram',
    filename: 'art_galleries.json'
  },
  cultural_centers: {
    query: 'cultural centers art centers in Thiruvananthapuram Kerala',
    filename: 'cultural_centers.json'
  },
  music_drama_centers: {
    query: 'theatres auditoriums performance venues drama centers in Thiruvananthapuram',
    filename: 'music_drama_centers.json'
  },

  // Landmarks
  landmarks: {
    query: 'palaces landmarks historical buildings monuments in Thiruvananthapuram',
    filename: 'landmarks.json'
  },

  // Healthcare expansions
  ayurveda_wellness: {
    query: 'ayurveda wellness centers spas in Thiruvananthapuram',
    filename: 'ayurveda_wellness.json'
  },
  yoga_meditation: {
    query: 'yoga meditation centers ashrams in Thiruvananthapuram',
    filename: 'yoga_meditation.json'
  },

  // Nature
  beaches: {
    query: 'beaches in Thiruvananthapuram Kerala',
    filename: 'beaches.json'
  },
  nature_sanctuaries: {
    query: 'wildlife sanctuary nature reserve forest in Thiruvananthapuram Kerala',
    filename: 'nature_sanctuaries.json'
  },
  backwaters: {
    query: 'backwaters lakes boating in Thiruvananthapuram Kerala',
    filename: 'backwaters.json'
  },

  // Sports
  sports_clubs: {
    query: 'sports clubs tennis golf badminton clubs in Thiruvananthapuram',
    filename: 'sports_clubs.json'
  },
  training_academies: {
    query: 'sports training academy coaching center in Thiruvananthapuram',
    filename: 'training_academies.json'
  },
  adventure_sports: {
    query: 'adventure sports water sports boating kayaking in Thiruvananthapuram Kerala',
    filename: 'adventure_sports.json'
  }
};

// Fetch JSON from URL
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Search for places
async function searchPlaces(query) {
  const url = `${BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
  const results = [];

  let response = await fetchJSON(url);
  if (response.results) {
    results.push(...response.results);
  }

  // Get more results if available (pagination)
  while (response.next_page_token && results.length < 60) {
    await sleep(2000); // Required delay for next_page_token
    const nextUrl = `${BASE_URL}/textsearch/json?pagetoken=${response.next_page_token}&key=${API_KEY}`;
    response = await fetchJSON(nextUrl);
    if (response.results) {
      results.push(...response.results);
    }
  }

  return results;
}

// Get place details
async function getPlaceDetails(placeId) {
  const fields = 'name,formatted_address,geometry,rating,user_ratings_total,photos,types,opening_hours,website,formatted_phone_number,reviews';
  const url = `${BASE_URL}/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  const response = await fetchJSON(url);
  return response.result;
}

// Calculate score based on rating and reviews
function calculateScore(rating, reviews) {
  if (!rating || !reviews) return 0;

  const ratingScore = (rating / 5) * 50;
  const popularityScore = Math.min((reviews / 100) * 30, 30);
  const sentimentScore = rating >= 4.5 ? 20 : rating >= 4 ? 15 : rating >= 3.5 ? 10 : 5;

  return Math.round(ratingScore + popularityScore + sentimentScore);
}

// Process a single category
async function processCategory(categoryKey, config) {
  console.log(`\nFetching: ${categoryKey}...`);

  try {
    const places = await searchPlaces(config.query);
    console.log(`  Found ${places.length} places`);

    const processed = [];

    for (let i = 0; i < Math.min(places.length, 30); i++) {
      const place = places[i];

      try {
        await sleep(200); // Rate limiting
        const details = await getPlaceDetails(place.place_id);

        if (!details) continue;

        // Skip places with very few reviews (minimum 50)
        const reviews = details.user_ratings_total || 0;
        if (reviews < 50) continue;

        const item = {
          id: place.place_id,
          name: details.name,
          address: details.formatted_address,
          locality: extractLocality(details.formatted_address),
          rating: details.rating || 0,
          reviews: reviews,
          score: calculateScore(details.rating, reviews),
          image: details.photos && details.photos.length > 0
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${details.photos[0].photo_reference}&key=${API_KEY}`
            : null,
          website: details.website || null,
          phone: details.formatted_phone_number || null,
          types: details.types || [],
          vibes: extractVibes(details.types, categoryKey),
          coordinates: details.geometry?.location || null
        };

        processed.push(item);
        console.log(`    [${processed.length}] ${item.name} - ${item.rating} (${item.reviews} reviews)`);

      } catch (err) {
        console.log(`    Error processing ${place.name}: ${err.message}`);
      }
    }

    // Sort by score
    processed.sort((a, b) => b.score - a.score);

    // Save to file
    const filepath = path.join(DATA_DIR, config.filename);
    fs.writeFileSync(filepath, JSON.stringify(processed, null, 2));
    console.log(`  Saved ${processed.length} places to ${config.filename}`);

    return processed.length;

  } catch (err) {
    console.log(`  Error: ${err.message}`);
    return 0;
  }
}

// Extract locality from address
function extractLocality(address) {
  if (!address) return null;
  const parts = address.split(',');
  if (parts.length >= 2) {
    return parts[parts.length - 3]?.trim() || parts[0].trim();
  }
  return parts[0].trim();
}

// Extract vibes/tags from place types
function extractVibes(types, category) {
  const vibeMap = {
    'tourist_attraction': 'Tourist Spot',
    'point_of_interest': 'Must Visit',
    'establishment': 'Established',
    'spa': 'Spa & Wellness',
    'gym': 'Fitness',
    'park': 'Outdoor',
    'natural_feature': 'Natural Beauty',
    'museum': 'Heritage',
    'art_gallery': 'Art',
    'shopping_mall': 'Shopping',
    'store': 'Retail',
    'restaurant': 'Dining Available',
    'lodging': 'Stay Options',
    'health': 'Health',
    'hospital': 'Medical'
  };

  const vibes = [];
  if (types) {
    types.forEach(type => {
      if (vibeMap[type] && !vibes.includes(vibeMap[type])) {
        vibes.push(vibeMap[type]);
      }
    });
  }

  return vibes.slice(0, 3);
}

// Main
async function main() {
  console.log('='.repeat(50));
  console.log('Fetching data for new categories');
  console.log('='.repeat(50));

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let totalPlaces = 0;

  for (const [key, config] of Object.entries(CATEGORIES)) {
    const count = await processCategory(key, config);
    totalPlaces += count;
    await sleep(1000); // Delay between categories
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Done! Total places fetched: ${totalPlaces}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
