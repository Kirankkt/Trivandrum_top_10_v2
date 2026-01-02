// Compare View - Side-by-side comparison of localities or places

async function renderCompareView(category) {
    const app = document.getElementById('app');
    const state = CompareManager.getState();

    // Validate
    if (!state.category || state.items.length < 2) {
        app.innerHTML = `
            <div class="compare-empty">
                <h2>Nothing to Compare</h2>
                <p>Add at least 2 items to compare them side by side.</p>
                <a href="#/" class="btn-primary">Browse Categories</a>
            </div>
        `;
        return;
    }

    // Show loading
    app.innerHTML = `<div class="loading">Loading comparison...</div>`;

    try {
        // Load full data based on category
        let fullData;
        if (state.category === 'localities') {
            fullData = await loadLocalitiesForCompare(state.items);
        } else {
            fullData = await loadPlacesForCompare(state.category, state.items);
        }

        if (state.category === 'localities') {
            renderLocalitiesCompare(app, fullData);
        } else {
            renderPlacesCompare(app, state.category, fullData);
        }

    } catch (error) {
        console.error('Compare error:', error);
        app.innerHTML = `<div class="error">Error loading comparison data</div>`;
    }
}

// Load full locality data for comparison
async function loadLocalitiesForCompare(items) {
    const response = await fetch('data/clean_rankings.json');
    const data = await response.json();
    const allLocalities = data.all_rankings || data.top_10 || [];

    return items.map(item => {
        const full = allLocalities.find(l => l.name === item.name || l.name === item.id);
        return full || item;
    });
}

// Load full place data for comparison
async function loadPlacesForCompare(category, items) {
    const response = await fetch(`data/${category}.json`);
    const data = await response.json();

    return items.map(item => {
        const full = data.find(p => p.name === item.name || p.id === item.id);
        return full || item;
    });
}

// Render localities comparison
function renderLocalitiesCompare(app, localities) {
    const metrics = [
        { key: 'overall_score', label: 'Overall Score', format: 'score', icon: '🏆' },
        { key: 'accessibility_score', label: 'Accessibility', format: 'score', icon: '🚗' },
        { key: 'amenities_score', label: 'Amenities', format: 'score', icon: '🏪' },
        { key: 'safety_score', label: 'Safety', format: 'score', icon: '🛡️' },
        { key: 'environment_score', label: 'Environment', format: 'score', icon: '🌳' },
        { key: 'economy_score', label: 'Economy', format: 'score', icon: '💼' },
        { key: 'prestige_score', label: 'Prestige', format: 'score', icon: '✨' },
        { key: 'city_centre_time', label: 'To City Centre', format: 'time', icon: '🏛️' },
        { key: 'technopark_time', label: 'To Technopark', format: 'time', icon: '💻' },
        { key: 'airport_time', label: 'To Airport', format: 'time', icon: '✈️' },
        { key: 'land_price_per_cent', label: 'Land Price/Cent', format: 'price', icon: '🏠' },
        { key: 'apartment_price_per_sqft', label: 'Apt Price/Sqft', format: 'rupees', icon: '🏢' }
    ];

    const html = `
        <div class="compare-page">
            <div class="compare-header">
                <a href="#/localities" class="compare-back">← Back to Localities</a>
                <h1>Compare Localities</h1>
                <p class="compare-subtitle">Side-by-side comparison of ${localities.length} neighborhoods</p>
            </div>

            <div class="compare-table-wrapper">
                <table class="compare-table">
                    <thead>
                        <tr>
                            <th class="compare-metric-header">Metric</th>
                            ${localities.map(loc => `
                                <th class="compare-item-header">
                                    <div class="compare-item-name">${loc.name}</div>
                                    <div class="compare-item-score">${(loc.overall_score || 0).toFixed(1)}</div>
                                    <button class="compare-remove-btn" onclick="CompareManager.remove('${loc.name}'); location.reload();">Remove</button>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${metrics.map(metric => {
                            const values = localities.map(loc => loc[metric.key]);
                            const best = getBestValue(values, metric.format);

                            return `
                                <tr>
                                    <td class="compare-metric-name">
                                        <span class="metric-icon">${metric.icon}</span>
                                        ${metric.label}
                                    </td>
                                    ${localities.map((loc, idx) => {
                                        const value = loc[metric.key];
                                        const isBest = values[idx] === best && best !== null && best !== undefined;
                                        const formatted = formatCompareValue(value, metric.format);

                                        return `
                                            <td class="compare-value ${isBest ? 'compare-best' : ''}">
                                                ${formatted}
                                                ${isBest ? '<span class="best-badge">Best</span>' : ''}
                                            </td>
                                        `;
                                    }).join('')}
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <div class="compare-actions">
                <button class="btn-secondary" onclick="CompareManager.clear(); window.location.hash='/localities';">
                    Clear & Start Over
                </button>
            </div>
        </div>
    `;

    app.innerHTML = html;
    window.scrollTo(0, 0);
}

// Render places comparison (restaurants, cafes, etc.)
function renderPlacesCompare(app, category, places) {
    const categoryConfig = {
        restaurants: { label: 'Restaurants', backUrl: '#/restaurants', icon: '🍽️' },
        cafes: { label: 'Cafes', backUrl: '#/cafes', icon: '☕' },
        hotels: { label: 'Hotels', backUrl: '#/hotels', icon: '🏨' },
        malls: { label: 'Malls', backUrl: '#/malls', icon: '🛒' },
        clothing_stores: { label: 'Clothing Stores', backUrl: '#/clothing-stores', icon: '👗' },
        specialty_shops: { label: 'Specialty Shops', backUrl: '#/specialty-shops', icon: '🎁' },
        museums: { label: 'Museums', backUrl: '#/museums', icon: '🏛️' },
        religious_sites: { label: 'Religious Sites', backUrl: '#/religious-sites', icon: '🛕' },
        healthcare: { label: 'Healthcare', backUrl: '#/healthcare', icon: '🏥' },
        education: { label: 'Education', backUrl: '#/education', icon: '🎓' }
    };

    const config = categoryConfig[category] || { label: category, backUrl: '#/', icon: '📍' };

    const metrics = [
        { key: 'score', label: 'Overall Score', format: 'score', icon: '🏆' },
        { key: 'rating', label: 'Google Rating', format: 'rating', icon: '⭐' },
        { key: 'reviews', label: 'Reviews', format: 'number', icon: '💬' },
        { key: 'price_level', label: 'Price Level', format: 'price_level', icon: '💰' },
        { key: 'locality', label: 'Location', format: 'text', icon: '📍' }
    ];

    // Add sentiment if available
    if (places.some(p => p.metrics?.sentiment)) {
        metrics.splice(2, 0, { key: 'metrics.sentiment', label: 'Sentiment', format: 'percent', icon: '😊' });
    }

    const html = `
        <div class="compare-page">
            <div class="compare-header">
                <a href="${config.backUrl}" class="compare-back">← Back to ${config.label}</a>
                <h1>Compare ${config.label}</h1>
                <p class="compare-subtitle">Side-by-side comparison of ${places.length} places</p>
            </div>

            <div class="compare-cards-wrapper">
                ${places.map((place, idx) => `
                    <div class="compare-card">
                        <div class="compare-card-image" style="background-image: url('${place.photo_url || place.image || 'images/placeholder.png'}')">
                            <button class="compare-card-remove" onclick="CompareManager.remove('${place.id || place.name}'); location.reload();">×</button>
                        </div>
                        <div class="compare-card-content">
                            <h3 class="compare-card-name">${place.name}</h3>
                            <div class="compare-card-score">${(place.score || 0).toFixed(1)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="compare-table-wrapper">
                <table class="compare-table">
                    <thead>
                        <tr>
                            <th class="compare-metric-header">Metric</th>
                            ${places.map(place => `
                                <th class="compare-item-header">${place.name}</th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${metrics.map(metric => {
                            const values = places.map(p => getNestedValue(p, metric.key));
                            const best = getBestValue(values, metric.format);

                            return `
                                <tr>
                                    <td class="compare-metric-name">
                                        <span class="metric-icon">${metric.icon}</span>
                                        ${metric.label}
                                    </td>
                                    ${places.map((place, idx) => {
                                        const value = getNestedValue(place, metric.key);
                                        const isBest = values[idx] === best && best !== null && best !== undefined;
                                        const formatted = formatCompareValue(value, metric.format);

                                        return `
                                            <td class="compare-value ${isBest ? 'compare-best' : ''}">
                                                ${formatted}
                                                ${isBest && metric.format !== 'text' ? '<span class="best-badge">Best</span>' : ''}
                                            </td>
                                        `;
                                    }).join('')}
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <div class="compare-actions">
                <button class="btn-secondary" onclick="CompareManager.clear(); window.location.hash='${config.backUrl.replace('#', '')}';">
                    Clear & Start Over
                </button>
            </div>
        </div>
    `;

    app.innerHTML = html;
    window.scrollTo(0, 0);
}

// Helper: Get nested object value (e.g., 'metrics.sentiment')
function getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => (o || {})[k], obj);
}

// Helper: Determine best value (highest for scores, lowest for times/prices)
function getBestValue(values, format) {
    const validValues = values.filter(v => v !== null && v !== undefined && v !== 'N/A');
    if (validValues.length === 0) return null;

    if (format === 'time' || format === 'price' || format === 'rupees' || format === 'price_level') {
        return Math.min(...validValues.map(Number).filter(n => !isNaN(n)));
    }
    return Math.max(...validValues.map(Number).filter(n => !isNaN(n)));
}

// Helper: Format values for display
function formatCompareValue(value, format) {
    if (value === null || value === undefined) return '<span class="no-data">N/A</span>';

    switch (format) {
        case 'score':
            return `<strong>${Number(value).toFixed(1)}</strong>`;
        case 'rating':
            return `${Number(value).toFixed(1)} ⭐`;
        case 'time':
            return `${value} min`;
        case 'price':
            return `₹${Number(value).toLocaleString('en-IN')} L`;
        case 'rupees':
            return `₹${Number(value).toLocaleString('en-IN')}`;
        case 'number':
            return Number(value).toLocaleString();
        case 'percent':
            return `${Number(value).toFixed(0)}%`;
        case 'price_level':
            return value ? '₹'.repeat(value) : 'N/A';
        case 'text':
            return value || 'N/A';
        default:
            return value;
    }
}
