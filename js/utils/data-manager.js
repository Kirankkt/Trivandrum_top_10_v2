// Data Manager - Load objective rankings and locality data
async function loadRankings() {
    try {
        // Load new objective rankings (100% API-sourced data)
        const response = await fetch('data/objective_rankings.json');
        const data = await response.json();

        // Transform to expected format for backwards compatibility
        return {
            methodology: data.methodology,
            category_weights: data.category_weights,
            all_rankings: data.rankings,
            top_10: data.rankings.slice(0, 10),
            rankings: data.rankings
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
// NEW: 5-category system (Accessibility, Amenities, Safety, Environment, Economy)
function getWeights() {
    const saved = localStorage.getItem('customWeights');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Check if it's new format
        if (parsed.accessibility !== undefined) {
            return parsed;
        }
    }

    // Default weights (match objective_scoring_engine.py)
    return {
        accessibility: 0.25,
        amenities: 0.25,
        safety: 0.15,
        environment: 0.15,
        economy: 0.20
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
        accessibility: 0.25,
        amenities: 0.25,
        safety: 0.15,
        environment: 0.15,
        economy: 0.20
    };
}

// Recalculate rankings with custom weights
function recalculateRankings(localities, weights) {
    // Deep copy to avoid mutating original
    const recalculated = localities.map(loc => {
        const breakdown = loc.breakdown || {};

        // Calculate new overall score with custom weights
        const newOverallScore =
            (breakdown.accessibility || 0) * weights.accessibility +
            (breakdown.amenities || 0) * weights.amenities +
            (breakdown.safety || 0) * weights.safety +
            (breakdown.environment || 0) * weights.environment +
            (breakdown.economy || 0) * weights.economy;

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
        description: 'Parks, green cover, noise level, flood safety'
    },
    economy: {
        name: 'Economy',
        icon: '💼',
        description: 'Job proximity, commercial activity, development'
    }
};
