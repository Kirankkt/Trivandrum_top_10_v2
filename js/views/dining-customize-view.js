// Dining Customize View - Handles Restaurants, Cafes, Hotels customization
// Matches the quality of localities customize-view.js with live preview, presets, and proper styling

async function renderDiningCustomizeView(type) {
    const app = document.getElementById('app');

    // Config based on type
    const configs = {
        restaurants: {
            title: "Customize Restaurant Rankings",
            description: "Adjust the 6 metrics to match your dining priorities",
            metrics: [
                { id: 'sentiment', name: 'Sentiment', icon: '💬', description: 'Positive review sentiment' },
                { id: 'popularity', name: 'Popularity', icon: '👥', description: 'Number of reviews' },
                { id: 'rating', name: 'Rating', icon: '⭐', description: 'Google Maps rating' },
                { id: 'value', name: 'Value', icon: '💰', description: 'Price vs quality' },
                { id: 'convenience', name: 'Location', icon: '📍', description: 'Central accessibility' },
                { id: 'vibe', name: 'Vibe', icon: '✨', description: 'Ambiance & atmosphere' }
            ],
            returnUrl: '#/restaurants',
            color: '#ff6b6b',
            presets: {
                balanced: { sentiment: 17, popularity: 17, rating: 17, value: 17, convenience: 16, vibe: 16 },
                foodies: { sentiment: 25, popularity: 10, rating: 20, value: 10, convenience: 10, vibe: 25 },
                budget: { sentiment: 10, popularity: 20, rating: 15, value: 35, convenience: 15, vibe: 5 },
                trendy: { sentiment: 15, popularity: 25, rating: 15, value: 10, convenience: 10, vibe: 25 },
                family: { sentiment: 20, popularity: 15, rating: 25, value: 20, convenience: 15, vibe: 5 }
            }
        },
        cafes: {
            title: "Customize Cafe Rankings",
            description: "Adjust the 6 metrics to match your cafe preferences",
            metrics: [
                { id: 'sentiment', name: 'Sentiment', icon: '💬', description: 'Positive review sentiment' },
                { id: 'popularity', name: 'Popularity', icon: '👥', description: 'Number of reviews' },
                { id: 'rating', name: 'Rating', icon: '⭐', description: 'Google Maps rating' },
                { id: 'value', name: 'Value', icon: '💰', description: 'Price vs quality' },
                { id: 'convenience', name: 'Location', icon: '📍', description: 'Central accessibility' },
                { id: 'workspace', name: 'Work Friendly', icon: '💻', description: 'Good for working' }
            ],
            returnUrl: '#/cafes',
            color: '#4ecdc4',
            presets: {
                balanced: { sentiment: 17, popularity: 17, rating: 17, value: 17, convenience: 16, workspace: 16 },
                remote_work: { sentiment: 10, popularity: 10, rating: 15, value: 15, convenience: 20, workspace: 30 },
                budget: { sentiment: 10, popularity: 20, rating: 15, value: 35, convenience: 15, workspace: 5 },
                social: { sentiment: 25, popularity: 25, rating: 15, value: 10, convenience: 15, workspace: 10 },
                quality: { sentiment: 25, popularity: 10, rating: 30, value: 15, convenience: 10, workspace: 10 }
            }
        },
        hotels: {
            title: "Customize Hotel Rankings",
            description: "Adjust the 6 metrics to match your stay preferences",
            metrics: [
                { id: 'sentiment', name: 'Sentiment', icon: '💬', description: 'Positive review sentiment' },
                { id: 'popularity', name: 'Popularity', icon: '👥', description: 'Number of reviews' },
                { id: 'rating', name: 'Rating', icon: '⭐', description: 'Google Maps rating' },
                { id: 'value', name: 'Value', icon: '💰', description: 'Price vs amenities' },
                { id: 'location', name: 'Location', icon: '📍', description: 'Proximity to attractions' },
                { id: 'luxury', name: 'Luxury', icon: '🏆', description: 'Premium amenities' }
            ],
            returnUrl: '#/hotels',
            color: '#ffd93d',
            presets: {
                balanced: { sentiment: 17, popularity: 17, rating: 17, value: 17, location: 16, luxury: 16 },
                budget: { sentiment: 10, popularity: 20, rating: 15, value: 40, location: 10, luxury: 5 },
                luxury: { sentiment: 15, popularity: 10, rating: 20, value: 5, location: 15, luxury: 35 },
                tourist: { sentiment: 15, popularity: 15, rating: 20, value: 15, location: 30, luxury: 5 },
                business: { sentiment: 15, popularity: 10, rating: 25, value: 20, location: 20, luxury: 10 }
            }
        }
    };

    const config = configs[type];
    if (!config) {
        app.innerHTML = '<div class="error">Invalid customization type</div>';
        return;
    }

    // Load dining data for live preview
    let diningData = [];
    try {
        const response = await fetch(`data/${type}.json`);
        if (response.ok) {
            diningData = await response.json();
        }
    } catch (e) {
        console.error('Error loading dining data:', e);
    }

    // Get saved weights or defaults
    const storageKey = `${type}Weights`;
    const savedWeights = JSON.parse(localStorage.getItem(storageKey)) || {};
    const defaultWeight = Math.round(100 / config.metrics.length);

    // Build HTML
    const html = `
        <div class="customize-header">
            <h2>${config.title}</h2>
            <p class="subtitle">${config.description}</p>
        </div>
        
        <div class="customization-container">
            <div class="sliders-section">
                ${config.metrics.map(metric => `
                    <div class="weight-slider-group">
                        <div class="slider-header">
                            <span class="slider-icon">${metric.icon}</span>
                            <span class="slider-title">${metric.name}</span>
                            <span class="slider-value" id="${metric.id}-value">${savedWeights[metric.id] || defaultWeight}%</span>
                        </div>
                        <input type="range" id="${metric.id}-slider" class="weight-slider dining-weight-slider" 
                               min="0" max="100" value="${savedWeights[metric.id] || defaultWeight}" step="5"
                               data-metric="${metric.id}">
                        <p class="slider-description">${metric.description}</p>
                    </div>
                `).join('')}
                
                <div class="total-weight">
                    <strong>Total:</strong> <span id="total-weight">100%</span>
                    <span id="weight-warning" class="weight-warning" style="display: none;">
                        ⚠️ Total must equal 100%
                    </span>
                </div>
                
                <div class="action-buttons">
                    <button id="reset-btn" class="btn btn-secondary">Reset to Defaults</button>
                    <button id="apply-btn" class="btn btn-primary" style="background: ${config.color};">Apply & View Rankings</button>
                </div>
            </div>
            
            <div class="preview-section">
                <h3>Live Preview - Top 5</h3>
                <div id="preview-rankings" class="preview-rankings">
                    <!-- Will be populated dynamically -->
                </div>
                
                <div class="profile-presets">
                    <h4>Quick Presets</h4>
                    ${Object.entries(config.presets).map(([key, values]) => {
        const labels = {
            balanced: '🎯 Balanced',
            foodies: '🍴 Foodies',
            budget: '💵 Budget Friendly',
            trendy: '✨ Trendy Spots',
            family: '👨‍👩‍👧 Family Friendly',
            remote_work: '💻 Remote Work',
            social: '🎉 Social Hangout',
            quality: '⭐ Quality First',
            luxury: '👑 Luxury Stay',
            tourist: '🗺️ Tourist Friendly',
            business: '💼 Business Travel'
        };
        return `<button class="preset-btn" data-preset="${key}">${labels[key] || key}</button>`;
    }).join('')}
                </div>
            </div>
        </div>
    `;

    app.innerHTML = html;

    // Get slider elements
    const sliders = {};
    config.metrics.forEach(m => {
        sliders[m.id] = document.getElementById(`${m.id}-slider`);
    });

    const applyBtn = document.getElementById('apply-btn');
    const resetBtn = document.getElementById('reset-btn');

    // Auto-adjust weights function - when one slider changes, others adjust proportionally
    function autoAdjustWeights(changedId, newValue) {
        const otherSliders = config.metrics.filter(m => m.id !== changedId);
        const currentTotal = otherSliders.reduce((sum, m) => sum + parseInt(sliders[m.id].value), 0);
        const remaining = 100 - newValue;

        if (currentTotal === 0) {
            // If all others are 0, distribute equally
            const each = Math.floor(remaining / otherSliders.length);
            let leftover = remaining - (each * otherSliders.length);
            otherSliders.forEach((m, i) => {
                sliders[m.id].value = each + (i < leftover ? 1 : 0);
            });
        } else {
            // Proportionally adjust others
            otherSliders.forEach(m => {
                const currentVal = parseInt(sliders[m.id].value);
                const proportion = currentVal / currentTotal;
                sliders[m.id].value = Math.round(remaining * proportion);
            });

            // Fix rounding errors
            const actualTotal = config.metrics.reduce((sum, m) => sum + parseInt(sliders[m.id].value), 0);
            if (actualTotal !== 100) {
                const diff = 100 - actualTotal;
                // Add/subtract from the first non-changed slider that can accept it
                for (const m of otherSliders) {
                    const val = parseInt(sliders[m.id].value);
                    if (val + diff >= 0 && val + diff <= 100) {
                        sliders[m.id].value = val + diff;
                        break;
                    }
                }
            }
        }
    }

    // Recalculate rankings with custom weights
    function recalculateDiningRankings(data, weights) {
        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
        if (totalWeight === 0) return data;

        return data.map(item => {
            // Normalize score components based on weights
            const metrics = item.metrics || {};
            let customScore = 0;

            // Map metric IDs to actual data fields
            const metricMapping = {
                sentiment: metrics.sentiment || 0,
                popularity: Math.min((item.reviews || 0) / 1000, 100),
                rating: (item.rating || 4) * 20,
                value: (5 - (item.price_level || 2)) * 25,
                convenience: metrics.convenience || 50,
                vibe: (item.vibes?.length || 0) * 20,
                workspace: (item.vibes?.includes('Work Friendly') ? 80 : 20),
                location: metrics.convenience || 50,
                luxury: (item.price_level || 2) * 25
            };

            config.metrics.forEach(m => {
                const weight = (weights[m.id] || 0) / totalWeight;
                customScore += (metricMapping[m.id] || 50) * weight;
            });

            return { ...item, customScore };
        }).sort((a, b) => b.customScore - a.customScore);
    }

    // Update preview function
    function updatePreview() {
        // Update display values
        let total = 0;
        config.metrics.forEach(m => {
            const val = parseInt(sliders[m.id].value);
            document.getElementById(`${m.id}-value`).textContent = `${val}%`;
            total += val;
        });

        // Update total
        document.getElementById('total-weight').textContent = `${total}%`;

        // Show/hide warning
        const warning = document.getElementById('weight-warning');
        if (total !== 100) {
            warning.style.display = 'inline';
            applyBtn.disabled = true;
        } else {
            warning.style.display = 'none';
            applyBtn.disabled = false;
        }

        // Update preview rankings
        if (total === 100 && diningData.length > 0) {
            const weights = {};
            config.metrics.forEach(m => {
                weights[m.id] = parseInt(sliders[m.id].value);
            });
            const recalculated = recalculateDiningRankings(diningData, weights);
            updatePreviewRankings(recalculated.slice(0, 5));
        }
    }

    function updatePreviewRankings(top5) {
        const preview = document.getElementById('preview-rankings');
        if (!preview) return;

        preview.innerHTML = top5.map((item, i) => `
            <div class="preview-item">
                <span class="preview-rank">#${i + 1}</span>
                <span class="preview-name">${item.name}</span>
                <span class="preview-score">${(item.customScore || item.score || 0).toFixed(1)}</span>
            </div>
        `).join('');
    }

    // Event listeners for sliders with auto-adjust
    config.metrics.forEach(m => {
        sliders[m.id].addEventListener('input', (e) => {
            const newValue = parseInt(e.target.value);
            autoAdjustWeights(m.id, newValue);
            updatePreview();
        });
    });

    // Reset button
    resetBtn.addEventListener('click', () => {
        localStorage.removeItem(storageKey);
        config.metrics.forEach(m => {
            sliders[m.id].value = defaultWeight;
        });
        // Fix to exactly 100%
        const remainder = 100 - (defaultWeight * config.metrics.length);
        if (remainder !== 0) {
            sliders[config.metrics[0].id].value = defaultWeight + remainder;
        }
        updatePreview();
    });

    // Apply button
    applyBtn.addEventListener('click', () => {
        const weights = {};
        config.metrics.forEach(m => {
            weights[m.id] = parseInt(sliders[m.id].value);
        });
        localStorage.setItem(storageKey, JSON.stringify(weights));
        window.location.hash = config.returnUrl;
    });

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            const values = config.presets[preset];
            if (values) {
                config.metrics.forEach(m => {
                    sliders[m.id].value = values[m.id] || defaultWeight;
                });
                updatePreview();
            }
        });
    });

    // Initial preview
    updatePreview();
}
