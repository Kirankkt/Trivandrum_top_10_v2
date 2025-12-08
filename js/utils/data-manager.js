// Data Manager - Load rankings and locality data
async function loadRankings() {
    try {
        const response = await fetch('data/rankings.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading rankings:', error);
        return null;
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
function getWeights() {
    const saved = localStorage.getItem('customWeights');
    if (saved) {
        return JSON.parse(saved);
    }

    // Default weights
    return {
        qol: 0.55,
        economic: 0.20,
        sustainability: 0.25
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
        qol: 0.55,
        economic: 0.20,
        sustainability: 0.25
    };
}

// Recalculate rankings with custom weights
function recalculateRankings(localities, weights) {
    // Deep copy to avoid mutating original
    const recalculated = localities.map(loc => {
        const qolScore = loc.qol_score || 0;
        const economicScore = loc.economic_score || 0;
        const sustainabilityScore = loc.sustainability_score || 0;

        // Calculate new overall score with custom weights
        const newOverallScore =
            (qolScore * weights.qol) +
            (economicScore * weights.economic) +
            (sustainabilityScore * weights.sustainability);

        return {
            ...loc,
            overall_score: newOverallScore
        };
    });

    // Sort by new overall score (descending)
    recalculated.sort((a, b) => b.overall_score - a.overall_score);

    return recalculated;
}
