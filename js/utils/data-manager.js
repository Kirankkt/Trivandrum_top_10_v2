// Data Manager - Load objective rankings and locality data
async function loadRankings() {
    try {
        // Load clean objective rankings (100% API-sourced data + price-based prestige)
        const response = await fetch('data/clean_rankings.json');
        const data = await response.json();

        // Transform to expected format for backwards compatibility
        return {
            methodology: data.methodology,
            category_weights: data.category_weights,
            data_sources: data.data_sources,
            all_rankings: data.all_rankings,
            top_10: data.top_10,
            rankings: data.all_rankings
        };
    } catch (error) {
        console.error('Error loading rankings:', error);
        console.log('Falling back to legacy rankings...');

        // Fallback to old rankings if new file doesn't exist
        try {
            const fallback = await fetch('data/rankings.json');
            const fallbackData = await fallback.json();
            return fallbackData;
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            return null;
        }
    }
}

async function loadLocalitiesData() {
    try {
        const response = await fetch('data/localities_full.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading localities data:', error);
        return null;
    }
}

// Get custom weights from localStorage or use defaults
// NEW: 6-category system (Accessibility, Amenities, Safety, Environment, Economy, Prestige)
function getWeights() {
    const saved = localStorage.getItem('customWeights');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Check if it's new 6-category format
        if (parsed.prestige !== undefined) {
            return parsed;
        }
    }

    // Default weights (match generate_clean_rankings.py)
    return {
        accessibility: 0.20,
        amenities: 0.25,
        safety: 0.15,
        environment: 0.15,
        economy: 0.15,
        prestige: 0.10
    };
}

// Save custom weights
function saveWeights(weights) {
    localStorage.setItem('customWeights', JSON.stringify(weights));
}

// Reset to defaults
function resetWeights() {
    localStorage.removeItem('customWeights');
    return {
        accessibility: 0.20,
        amenities: 0.25,
        safety: 0.15,
        environment: 0.15,
        economy: 0.15,
        prestige: 0.10
    };
}

// Recalculate rankings with custom weights
function recalculateRankings(localities, weights) {
    // Deep copy to avoid mutating original
    const recalculated = localities.map(loc => {
        const breakdown = loc.breakdown || {};

        // Calculate new overall score with custom weights (6 categories)
        const newOverallScore =
            (breakdown.accessibility || 0) * weights.accessibility +
            (breakdown.amenities || 0) * weights.amenities +
            (breakdown.safety || 0) * weights.safety +
            (breakdown.environment || 0) * weights.environment +
            (breakdown.economy || 0) * weights.economy +
            (breakdown.prestige || 0) * weights.prestige;

        return {
            ...loc,
            overall_score: newOverallScore
        };
    });

    // Sort by new overall score (descending)
    recalculated.sort((a, b) => b.overall_score - a.overall_score);

    // Reassign ranks
    recalculated.forEach((loc, index) => {
        loc.rank = index + 1;
    });

    return recalculated;
}

// Category metadata for display
const CATEGORY_INFO = {
    accessibility: {
        name: 'Accessibility',
        icon: '🚗',
        description: 'Travel times to Technopark, City Centre, Airport'
    },
    amenities: {
        name: 'Amenities',
        icon: '🏫',
        description: 'Schools, hospitals, supermarkets, pharmacies nearby'
    },
    safety: {
        name: 'Safety',
        icon: '🛡️',
        description: 'Police & fire stations within 5km radius'
    },
    environment: {
        name: 'Environment',
        icon: '🌳',
        description: 'Parks, noise level, flood safety'
    },
    economy: {
        name: 'Economy',
        icon: '💼',
        description: 'Job proximity, commercial activity'
    },
    prestige: {
        name: 'Prestige',
        icon: '👑',
        description: 'Land price percentile (higher price = higher prestige)'
    }
};
