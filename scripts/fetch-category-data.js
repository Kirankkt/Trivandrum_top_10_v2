/**
 * Phase 2: Data Acquisition Script for New Categories
 *
 * Categories:
 * - Shop: Malls, Boutiques, Specialty Shops
 * - Culture: Museums, Religious Sites
 * - Services: Healthcare, Education, Banking
 *
 * Metrics Philosophy:
 * - All data sourced from Google Places API (100% objective)
 * - Sentiment derived from rating distribution
 * - Popularity from review count
 * - Convenience from locality mapping
 */

require('dotenv').config();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Trivandrum center coordinates
const TRIVANDRUM_LAT = 8.5241;
const TRIVANDRUM_LNG = 76.9366;
const SEARCH_RADIUS = 25000; // 25km radius to cover all localities

// Locality mapping for convenience scoring
const LOCALITIES = [
    'Statue', 'Pattom', 'Kowdiar', 'Enchakkal', 'Jagathy', 'Ambalamukku',
    'Vazhuthacaud', 'PMG', 'Kesavadasapuram', 'Sasthamangalam', 'Vellayambalam',
    'Peroorkada', 'Kuravankonam', 'Ulloor', 'Medical College', 'Thampanoor',
    'Sreekaryam', 'Kovalam', 'Varkala', 'Kazhakuttom', 'Technopark', 'Akkulam',
    'Nalanchira', 'Palayam', 'East Fort', 'Attingal', 'Nedumangad', 'Neyyattinkara'
];

// Category configurations with Google Places types
const CATEGORY_CONFIG = {
    // SHOP CATEGORIES
    malls: {
        searchTerms: ['shopping mall Trivandrum', 'mall Thiruvananthapuram'],
        types: ['shopping_mall'],
        vibeKeywords: {
            'Family Friendly': ['family', 'kids', 'children', 'play'],
            'Premium': ['luxury', 'premium', 'branded', 'international'],
            'Budget Friendly': ['affordable', 'cheap', 'budget', 'discount'],
            'Entertainment': ['movie', 'cinema', 'food court', 'arcade', 'gaming']
        },
        metrics: ['rating', 'reviews', 'sentiment', 'popularity', 'variety']
    },
    boutiques: {
        searchTerms: ['boutique Trivandrum', 'designer store Thiruvananthapuram', 'fashion store Trivandrum'],
        types: ['clothing_store', 'store'],
        vibeKeywords: {
            'Designer': ['designer', 'exclusive', 'couture'],
            'Traditional': ['kerala', 'saree', 'traditional', 'ethnic', 'kasavu'],
            'Bridal': ['bridal', 'wedding', 'marriage'],
            'Contemporary': ['modern', 'trendy', 'western', 'casual']
        },
        metrics: ['rating', 'reviews', 'sentiment', 'popularity', 'exclusivity']
    },
    specialty_shops: {
        searchTerms: [
            'bookstore Trivandrum', 'book shop Thiruvananthapuram',
            'electronics store Trivandrum', 'home decor Trivandrum',
            'ayurveda shop Trivandrum', 'spice shop Trivandrum',
            'handicraft store Trivandrum'
        ],
        types: ['book_store', 'electronics_store', 'home_goods_store', 'store'],
        vibeKeywords: {
            'Books': ['book', 'reading', 'literature'],
            'Electronics': ['electronics', 'gadget', 'computer', 'mobile'],
            'Home Decor': ['decor', 'furniture', 'home', 'interior'],
            'Ayurveda': ['ayurveda', 'herbal', 'natural', 'organic'],
            'Handicrafts': ['handicraft', 'handmade', 'artisan', 'craft']
        },
        metrics: ['rating', 'reviews', 'sentiment', 'popularity', 'specialty']
    },

    // CULTURE CATEGORIES
    museums: {
        searchTerms: ['museum Trivandrum', 'museum Thiruvananthapuram', 'art gallery Trivandrum'],
        types: ['museum', 'art_gallery'],
        vibeKeywords: {
            'Historical': ['history', 'heritage', 'ancient', 'historical'],
            'Art': ['art', 'painting', 'sculpture', 'gallery'],
            'Science': ['science', 'natural', 'technology'],
            'Cultural': ['culture', 'tradition', 'ethnic']
        },
        metrics: ['rating', 'reviews', 'sentiment', 'popularity', 'educational_value']
    },
    religious_sites: {
        searchTerms: [
            'temple Trivandrum', 'temple Thiruvananthapuram',
            'church Trivandrum', 'mosque Trivandrum'
        ],
        types: ['hindu_temple', 'church', 'mosque', 'place_of_worship'],
        vibeKeywords: {
            'Historic': ['ancient', 'historic', 'heritage', 'old'],
            'Architectural': ['architecture', 'beautiful', 'stunning', 'carved'],
            'Spiritual': ['peaceful', 'serene', 'spiritual', 'divine'],
            'Popular': ['famous', 'popular', 'crowded', 'visited']
        },
        metrics: ['rating', 'reviews', 'sentiment', 'popularity', 'significance']
    },

    // SERVICES CATEGORIES
    healthcare: {
        searchTerms: ['hospital Trivandrum', 'clinic Thiruvananthapuram', 'medical center Trivandrum'],
        types: ['hospital', 'doctor', 'health'],
        vibeKeywords: {
            'Multi-specialty': ['multi', 'specialty', 'super'],
            'Emergency': ['emergency', '24/7', 'trauma'],
            'Affordable': ['affordable', 'government'],
            'Premium': ['premium', 'private', 'corporate']
        },
        metrics: ['rating', 'reviews', 'sentiment', 'popularity', 'accessibility']
    },
    education: {
        searchTerms: ['school Trivandrum', 'college Thiruvananthapuram', 'university Trivandrum'],
        types: ['school', 'university', 'secondary_school', 'primary_school'],
        vibeKeywords: {
            'CBSE': ['cbse', 'central'],
            'State': ['state', 'kerala', 'government'],
            'ICSE': ['icse', 'isc'],
            'International': ['international', 'ib', 'cambridge']
        },
        metrics: ['rating', 'reviews', 'sentiment', 'popularity', 'reputation']
    },
    banking: {
        searchTerms: ['bank Trivandrum', 'ATM Thiruvananthapuram'],
        types: ['bank', 'atm'],
        vibeKeywords: {
            'Public Sector': ['sbi', 'pnb', 'canara', 'indian', 'government'],
            'Private': ['hdfc', 'icici', 'axis', 'kotak'],
            'Cooperative': ['cooperative', 'district', 'service']
        },
        metrics: ['rating', 'reviews', 'sentiment', 'popularity', 'accessibility']
    }
};

/**
 * Fetch places from Google Places API using Text Search
 */
async function searchPlaces(query, type = null) {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('query', query);
    url.searchParams.set('location', `${TRIVANDRUM_LAT},${TRIVANDRUM_LNG}`);
    url.searchParams.set('radius', SEARCH_RADIUS);
    url.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    if (type) {
        url.searchParams.set('type', type);
    }

    try {
        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.status === 'OK') {
            return data.results;
        } else {
            console.error(`API Error for "${query}":`, data.status, data.error_message);
            return [];
        }
    } catch (error) {
        console.error(`Fetch error for "${query}":`, error.message);
        return [];
    }
}

/**
 * Get detailed place information
 */
async function getPlaceDetails(placeId) {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'name,rating,user_ratings_total,price_level,formatted_address,formatted_phone_number,website,photos,reviews,types,opening_hours,geometry');
    url.searchParams.set('key', GOOGLE_MAPS_API_KEY);

    try {
        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.status === 'OK') {
            return data.result;
        }
        return null;
    } catch (error) {
        console.error(`Details fetch error for ${placeId}:`, error.message);
        return null;
    }
}

/**
 * Extract locality from address
 */
function extractLocality(address) {
    if (!address) return 'Unknown';

    const addressLower = address.toLowerCase();

    for (const locality of LOCALITIES) {
        if (addressLower.includes(locality.toLowerCase())) {
            return locality;
        }
    }

    // Try to extract from address parts
    const parts = address.split(',').map(p => p.trim());
    for (const part of parts) {
        for (const locality of LOCALITIES) {
            if (part.toLowerCase().includes(locality.toLowerCase())) {
                return locality;
            }
        }
    }

    return 'Trivandrum';
}

/**
 * Calculate sentiment score from reviews (if available) or rating
 */
function calculateSentiment(place, reviews = []) {
    // Base sentiment from rating (rating 4.5+ = positive, 3.5-4.5 = neutral, <3.5 = negative)
    const rating = place.rating || 4.0;
    let baseSentiment = ((rating - 1) / 4) * 100; // Normalize to 0-100

    // Adjust based on review count (more reviews = more reliable)
    const reviewCount = place.user_ratings_total || 0;
    const confidenceBoost = Math.min(reviewCount / 500, 1) * 10; // Up to 10 point boost

    return Math.min(Math.round(baseSentiment + confidenceBoost), 100);
}

/**
 * Extract vibes/tags from place data and reviews
 */
function extractVibes(place, categoryConfig) {
    const vibes = new Set();
    const searchText = [
        place.name || '',
        ...(place.reviews || []).map(r => r.text || ''),
        ...(place.types || [])
    ].join(' ').toLowerCase();

    for (const [vibe, keywords] of Object.entries(categoryConfig.vibeKeywords || {})) {
        for (const keyword of keywords) {
            if (searchText.includes(keyword.toLowerCase())) {
                vibes.add(vibe);
                break;
            }
        }
    }

    return Array.from(vibes).slice(0, 4); // Max 4 vibes
}

/**
 * Build photo URL
 */
function getPhotoUrl(photos) {
    if (!photos || photos.length === 0) return null;

    const photoRef = photos[0].photo_reference;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${GOOGLE_MAPS_API_KEY}`;
}

/**
 * Calculate category-specific score
 */
function calculateScore(place, category) {
    const rating = place.rating || 3.5;
    const reviews = place.user_ratings_total || 0;
    const sentiment = calculateSentiment(place);

    // Scoring weights by category
    const weights = {
        malls: { rating: 30, popularity: 35, sentiment: 25, variety: 10 },
        boutiques: { rating: 35, popularity: 25, sentiment: 30, exclusivity: 10 },
        specialty_shops: { rating: 35, popularity: 25, sentiment: 30, specialty: 10 },
        museums: { rating: 30, popularity: 20, sentiment: 25, educational_value: 25 },
        religious_sites: { rating: 25, popularity: 25, sentiment: 30, significance: 20 },
        healthcare: { rating: 40, popularity: 20, sentiment: 30, accessibility: 10 },
        education: { rating: 35, popularity: 20, sentiment: 25, reputation: 20 },
        banking: { rating: 30, popularity: 30, sentiment: 25, accessibility: 15 }
    };

    const w = weights[category] || { rating: 35, popularity: 30, sentiment: 35 };

    // Normalize metrics
    const ratingScore = (rating / 5) * 100;
    const popularityScore = Math.min((reviews / 1000) * 100, 100);
    const sentimentScore = sentiment;
    const bonusScore = 50; // Placeholder for category-specific bonus

    // Calculate weighted score
    let score = 0;
    score += (w.rating || 0) * (ratingScore / 100);
    score += (w.popularity || 0) * (popularityScore / 100);
    score += (w.sentiment || 0) * (sentimentScore / 100);

    // Add remaining weight as bonus
    const bonusWeight = 100 - (w.rating || 0) - (w.popularity || 0) - (w.sentiment || 0);
    score += bonusWeight * (bonusScore / 100);

    return Math.round(score * 10) / 10;
}

/**
 * Process and format place data
 */
function formatPlaceData(place, details, category, categoryConfig) {
    const rating = details?.rating || place.rating || null;
    const reviews = details?.user_ratings_total || place.user_ratings_total || 0;

    return {
        id: place.place_id,
        name: place.name,
        score: calculateScore({ ...place, ...details }, category),
        rating: rating,
        reviews: reviews,
        price_level: details?.price_level || place.price_level || null,
        address: details?.formatted_address || place.formatted_address || '',
        image: getPhotoUrl(details?.photos || place.photos),
        category: category,
        vibes: extractVibes({ ...place, ...details }, categoryConfig),
        website: details?.website || null,
        phone: details?.formatted_phone_number || null,
        map_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        metrics: {
            sentiment: calculateSentiment({ ...place, ...details }),
            popularity: reviews,
            convenience: 5 // Default, will be updated based on locality
        },
        locality: extractLocality(details?.formatted_address || place.formatted_address),
        types: place.types || [],
        location: place.geometry?.location || null
    };
}

/**
 * Fetch all data for a category
 */
async function fetchCategoryData(categoryKey) {
    const config = CATEGORY_CONFIG[categoryKey];
    if (!config) {
        console.error(`Unknown category: ${categoryKey}`);
        return [];
    }

    console.log(`\n📦 Fetching ${categoryKey}...`);

    const allPlaces = new Map(); // Use Map to deduplicate by place_id

    // Search using all search terms
    for (const term of config.searchTerms) {
        console.log(`  🔍 Searching: "${term}"`);
        const results = await searchPlaces(term);

        for (const place of results) {
            if (!allPlaces.has(place.place_id)) {
                allPlaces.set(place.place_id, place);
            }
        }

        // Rate limiting - wait 200ms between requests
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`  📍 Found ${allPlaces.size} unique places`);

    // Get details for each place
    const detailedPlaces = [];
    let count = 0;

    for (const [placeId, place] of allPlaces) {
        count++;
        process.stdout.write(`  ⏳ Getting details ${count}/${allPlaces.size}\r`);

        const details = await getPlaceDetails(placeId);
        const formatted = formatPlaceData(place, details, categoryKey, config);

        // Only include places with valid data
        if (formatted.rating && formatted.reviews > 0) {
            detailedPlaces.push(formatted);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n  ✅ Processed ${detailedPlaces.length} valid places`);

    // Sort by score
    detailedPlaces.sort((a, b) => b.score - a.score);

    return detailedPlaces;
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Phase 2: Data Acquisition Starting...\n');
    console.log('Categories to fetch:');
    console.log('  - Shop: malls, boutiques, specialty_shops');
    console.log('  - Culture: museums, religious_sites');
    console.log('  - Services: healthcare, education, banking\n');

    const fs = require('fs');
    const path = require('path');
    const dataDir = path.join(__dirname, '..', 'data');

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const results = {};

    // Fetch each category
    const categories = [
        'malls', 'boutiques', 'specialty_shops',
        'museums', 'religious_sites',
        'healthcare', 'education', 'banking'
    ];

    for (const category of categories) {
        try {
            const data = await fetchCategoryData(category);
            results[category] = data;

            // Save individual category file
            const filename = path.join(dataDir, `${category}.json`);
            fs.writeFileSync(filename, JSON.stringify(data, null, 2));
            console.log(`  💾 Saved to ${filename}`);

        } catch (error) {
            console.error(`  ❌ Error fetching ${category}:`, error.message);
            results[category] = [];
        }
    }

    // Generate summary
    console.log('\n📊 Summary:');
    console.log('─'.repeat(40));
    for (const [category, data] of Object.entries(results)) {
        console.log(`  ${category}: ${data.length} places`);
    }

    console.log('\n✅ Data acquisition complete!');
}

// Export for use as module
module.exports = {
    fetchCategoryData,
    CATEGORY_CONFIG,
    searchPlaces,
    getPlaceDetails
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
