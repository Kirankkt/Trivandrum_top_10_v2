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
