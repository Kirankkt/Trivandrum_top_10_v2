// Dining Customize View - Handles Restaurants, Cafes, Hotels customization

async function renderDiningCustomizeView(type) {
    const app = document.getElementById('app');

    // Config based on type
    const config = {
        restaurants: {
            title: "Customize Restaurant Rankings",
            description: "Adjust weights for how restaurants are scored",
            metrics: [
                { id: 'sentiment', name: 'Sentiment Score', icon: '💬', description: 'Positive review sentiment analysis' },
                { id: 'popularity', name: 'Popularity', icon: '👥', description: 'Number of reviews and visits' },
                { id: 'rating', name: 'Rating', icon: '⭐', description: 'Google Maps rating' },
                { id: 'value', name: 'Value', icon: '💰', description: 'Price relative to quality' },
                { id: 'convenience', name: 'Convenience', icon: '📍', description: 'Central location accessibility' },
                { id: 'vibe', name: 'Vibe Match', icon: '✨', description: 'Ambiance and atmosphere' }
            ],
            returnUrl: '#/restaurants',
            color: '#ff6b6b'
        },
        cafes: {
            title: "Customize Cafe Rankings",
            description: "Adjust weights for how cafes are scored",
            metrics: [
                { id: 'sentiment', name: 'Sentiment Score', icon: '💬', description: 'Positive review sentiment analysis' },
                { id: 'popularity', name: 'Popularity', icon: '👥', description: 'Number of reviews and visits' },
                { id: 'rating', name: 'Rating', icon: '⭐', description: 'Google Maps rating' },
                { id: 'value', name: 'Value', icon: '💰', description: 'Price relative to quality' },
                { id: 'convenience', name: 'Convenience', icon: '📍', description: 'Central location accessibility' },
                { id: 'workspace', name: 'Work Friendly', icon: '💻', description: 'Suitable for working/studying' }
            ],
            returnUrl: '#/cafes',
            color: '#4ecdc4'
        },
        hotels: {
            title: "Customize Hotel Rankings",
            description: "Adjust weights for how hotels are scored",
            metrics: [
                { id: 'sentiment', name: 'Sentiment Score', icon: '💬', description: 'Positive review sentiment analysis' },
                { id: 'popularity', name: 'Popularity', icon: '👥', description: 'Number of reviews and bookings' },
                { id: 'rating', name: 'Rating', icon: '⭐', description: 'Google Maps rating' },
                { id: 'value', name: 'Value', icon: '💰', description: 'Price relative to amenities' },
                { id: 'location', name: 'Location', icon: '📍', description: 'Proximity to attractions' },
                { id: 'luxury', name: 'Luxury', icon: '🏆', description: 'Premium amenities and service' }
            ],
            returnUrl: '#/hotels',
            color: '#ffd93d'
        }
    }[type];

    if (!config) {
        app.innerHTML = '<div class="error">Invalid customization type</div>';
        return;
    }

    // Get saved weights or defaults
    const storageKey = `${type}Weights`;
    const savedWeights = JSON.parse(localStorage.getItem(storageKey)) || {};
    const defaultWeight = 100 / config.metrics.length;

    const html = `
        <div class="customize-header" style="border-bottom-color: ${config.color};">
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
                            <span class="slider-value" id="${metric.id}-value">${Math.round(savedWeights[metric.id] || defaultWeight)}%</span>
                        </div>
                        <input type="range" id="${metric.id}-slider" class="weight-slider dining-slider" 
                               min="0" max="100" value="${savedWeights[metric.id] || defaultWeight}" step="5"
                               data-metric="${metric.id}"
                               style="accent-color: ${config.color};">
                        <p class="slider-description">${metric.description}</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="customize-actions">
                <button class="btn-apply" id="apply-weights" style="background: ${config.color};">
                    Apply & View Rankings
                </button>
                <button class="btn-reset" id="reset-weights">
                    Reset to Defaults
                </button>
            </div>
            
            <div class="customize-note">
                <p>Note: Custom weights are saved in your browser and will persist across sessions.</p>
            </div>
        </div>
        
        <div class="back-nav">
            <a href="${config.returnUrl}" class="btn-back">← Back to ${type.charAt(0).toUpperCase() + type.slice(1)}</a>
        </div>
    `;

    app.innerHTML = html;

    // Add event listeners
    const sliders = document.querySelectorAll('.dining-slider');
    sliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const metricId = e.target.dataset.metric;
            document.getElementById(`${metricId}-value`).textContent = `${e.target.value}%`;
        });
    });

    // Apply button
    document.getElementById('apply-weights').addEventListener('click', () => {
        const weights = {};
        sliders.forEach(slider => {
            weights[slider.dataset.metric] = parseInt(slider.value);
        });
        localStorage.setItem(storageKey, JSON.stringify(weights));
        window.location.hash = config.returnUrl;
    });

    // Reset button
    document.getElementById('reset-weights').addEventListener('click', () => {
        localStorage.removeItem(storageKey);
        sliders.forEach(slider => {
            slider.value = defaultWeight;
            document.getElementById(`${slider.dataset.metric}-value`).textContent = `${Math.round(defaultWeight)}%`;
        });
    });
}
