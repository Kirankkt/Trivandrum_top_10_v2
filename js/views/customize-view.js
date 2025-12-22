// Customize View - 5-Category Objective System
async function renderCustomizeView() {
    const app = document.getElementById('app');
    const weights = getWeights();
    const rankingsData = await loadRankings();

    let html = `
        <div class="customize-header">
            <h2>⚖️ Customize Your Rankings</h2>
            <p class="subtitle">Adjust the 6 objective categories to match your priorities</p>
        </div>
        
        <div class="customization-container">
            <div class="sliders-section">
                <div class="weight-slider-group">
                    <div class="slider-header">
                        <span class="slider-icon">🚗</span>
                        <span class="slider-title">Accessibility</span>
                        <span class="slider-value" id="accessibility-value">${Math.round(weights.accessibility * 100)}%</span>
                    </div>
                    <input type="range" id="accessibility-slider" class="weight-slider" 
                           min="0" max="100" value="${weights.accessibility * 100}" step="5">
                    <p class="slider-description">
                        Travel times to Technopark, City Centre, Airport, Secretariat
                    </p>
                </div>
                
                <div class="weight-slider-group">
                    <div class="slider-header">
                        <span class="slider-icon">🏫</span>
                        <span class="slider-title">Amenities</span>
                        <span class="slider-value" id="amenities-value">${Math.round(weights.amenities * 100)}%</span>
                    </div>
                    <input type="range" id="amenities-slider" class="weight-slider" 
                           min="0" max="100" value="${weights.amenities * 100}" step="5">
                    <p class="slider-description">
                        Schools, hospitals, supermarkets, pharmacies, restaurants
                    </p>
                </div>
                
                <div class="weight-slider-group">
                    <div class="slider-header">
                        <span class="slider-icon">🛡️</span>
                        <span class="slider-title">Safety</span>
                        <span class="slider-value" id="safety-value">${Math.round(weights.safety * 100)}%</span>
                    </div>
                    <input type="range" id="safety-slider" class="weight-slider" 
                           min="0" max="100" value="${weights.safety * 100}" step="5">
                    <p class="slider-description">
                        Police stations and fire stations within 5km radius
                    </p>
                </div>
                
                <div class="weight-slider-group">
                    <div class="slider-header">
                        <span class="slider-icon">🌳</span>
                        <span class="slider-title">Environment</span>
                        <span class="slider-value" id="environment-value">${Math.round(weights.environment * 100)}%</span>
                    </div>
                    <input type="range" id="environment-slider" class="weight-slider" 
                           min="0" max="100" value="${weights.environment * 100}" step="5">
                    <p class="slider-description">
                        Parks, green cover, noise level, flood safety
                    </p>
                </div>
                
                <div class="weight-slider-group">
                    <div class="slider-header">
                        <span class="slider-icon">💼</span>
                        <span class="slider-title">Economy</span>
                        <span class="slider-value" id="economy-value">${Math.round(weights.economy * 100)}%</span>
                    </div>
                    <input type="range" id="economy-slider" class="weight-slider" 
                           min="0" max="100" value="${weights.economy * 100}" step="5">
                    <p class="slider-description">
                        Job proximity, commercial activity, developer presence
                    </p>
                </div>

                <div class="weight-slider-group">
                    <div class="slider-header">
                        <span class="slider-icon">👑</span>
                        <span class="slider-title">Prestige</span>
                        <span class="slider-value" id="prestige-value">${Math.round(weights.prestige * 100)}%</span>
                    </div>
                    <input type="range" id="prestige-slider" class="weight-slider" 
                           min="0" max="100" value="${weights.prestige * 100}" step="5">
                    <p class="slider-description">
                        Land price percentile (higher price = higher prestige)
                    </p>
                </div>
                
                <div class="total-weight">
                    <strong>Total:</strong> <span id="total-weight">100%</span>
                    <span id="weight-warning" class="weight-warning" style="display: none;">
                        ⚠️ Total must equal 100%
                    </span>
                </div>
                
                <div class="action-buttons">
                    <button id="reset-btn" class="btn btn-secondary">Reset to Defaults</button>
                    <button id="apply-btn" class="btn btn-primary" disabled>Apply & View Rankings</button>
                </div>
            </div>
            
            <div class="preview-section">
                <h3>Live Preview - Top 5</h3>
                <div id="preview-rankings" class="preview-rankings">
                    <!-- Will be populated dynamically -->
                </div>
                
                <div class="profile-presets">
                    <h4>Quick Presets</h4>
                    <button class="preset-btn" data-preset="balanced">
                        🎯 Balanced (25-25-15-15-20)
                    </button>
                    <button class="preset-btn" data-preset="families">
                        👨‍👩‍👧 Families (20-30-20-15-15)
                    </button>
                    <button class="preset-btn" data-preset="professionals">
                        💼 IT Professionals (30-20-10-10-30)
                    </button>
                    <button class="preset-btn" data-preset="retirees">
                        🏖️ Retirees (15-30-20-25-10)
                    </button>
                    <button class="preset-btn" data-preset="environment">
                        🌳 Nature Lovers (10-20-15-40-15)
                    </button>
                </div>
            </div>
        </div>
    `;

    app.innerHTML = html;

    // Initialize sliders - using object for easier management
    const sliders = {
        accessibility: document.getElementById('accessibility-slider'),
        amenities: document.getElementById('amenities-slider'),
        safety: document.getElementById('safety-slider'),
        environment: document.getElementById('environment-slider'),
        economy: document.getElementById('economy-slider'),
        prestige: document.getElementById('prestige-slider')
    };
    const sliderIds = Object.keys(sliders);
    const applyBtn = document.getElementById('apply-btn');
    const resetBtn = document.getElementById('reset-btn');

    // Auto-adjust weights - when one slider changes, others adjust proportionally to keep total at 100%
    function autoAdjustWeights(changedId, newValue) {
        const otherIds = sliderIds.filter(id => id !== changedId);
        const currentTotal = otherIds.reduce((sum, id) => sum + parseInt(sliders[id].value), 0);
        const remaining = 100 - newValue;

        if (currentTotal === 0) {
            // If all others are 0, distribute equally
            const each = Math.floor(remaining / otherIds.length);
            let leftover = remaining - (each * otherIds.length);
            otherIds.forEach((id, i) => {
                sliders[id].value = each + (i < leftover ? 1 : 0);
            });
        } else {
            // Proportionally adjust others
            otherIds.forEach(id => {
                const currentVal = parseInt(sliders[id].value);
                const proportion = currentVal / currentTotal;
                sliders[id].value = Math.round(remaining * proportion);
            });

            // Fix rounding errors
            const actualTotal = sliderIds.reduce((sum, id) => sum + parseInt(sliders[id].value), 0);
            if (actualTotal !== 100) {
                const diff = 100 - actualTotal;
                for (const id of otherIds) {
                    const val = parseInt(sliders[id].value);
                    if (val + diff >= 0 && val + diff <= 100) {
                        sliders[id].value = val + diff;
                        break;
                    }
                }
            }
        }
    }

    // Update preview function
    function updatePreview() {
        const accessibility = parseInt(sliders.accessibility.value) / 100;
        const amenities = parseInt(sliders.amenities.value) / 100;
        const safety = parseInt(sliders.safety.value) / 100;
        const environment = parseInt(sliders.environment.value) / 100;
        const economy = parseInt(sliders.economy.value) / 100;
        const prestige = parseInt(sliders.prestige.value) / 100;

        // Update display values
        document.getElementById('accessibility-value').textContent = `${Math.round(accessibility * 100)}%`;
        document.getElementById('amenities-value').textContent = `${Math.round(amenities * 100)}%`;
        document.getElementById('safety-value').textContent = `${Math.round(safety * 100)}%`;
        document.getElementById('environment-value').textContent = `${Math.round(environment * 100)}%`;
        document.getElementById('economy-value').textContent = `${Math.round(economy * 100)}%`;
        document.getElementById('prestige-value').textContent = `${Math.round(prestige * 100)}%`;

        // Check total
        const total = Math.round((accessibility + amenities + safety + environment + economy + prestige) * 100);
        document.getElementById('total-weight').textContent = `${total}%`;

        const warning = document.getElementById('weight-warning');
        if (total !== 100) {
            warning.style.display = 'inline';
            applyBtn.disabled = true;
        } else {
            warning.style.display = 'none';
            applyBtn.disabled = false;
        }

        // Update preview rankings
        if (total === 100) {
            const customWeights = { accessibility, amenities, safety, environment, economy, prestige };
            const recalculated = recalculateRankings(rankingsData.all_rankings, customWeights);
            updatePreviewRankings(recalculated.slice(0, 5));
        }
    }

    function updatePreviewRankings(top5) {
        const preview = document.getElementById('preview-rankings');
        let html = '';

        top5.forEach((loc, i) => {
            html += `
                <div class="preview-item">
                    <span class="preview-rank">#${i + 1}</span>
                    <span class="preview-name">${loc.name}</span>
                    <span class="preview-score">${loc.overall_score.toFixed(2)}</span>
                </div>
            `;
        });

        preview.innerHTML = html;
    }

    // Event listeners with auto-adjust
    sliderIds.forEach(id => {
        sliders[id].addEventListener('input', (e) => {
            const newValue = parseInt(e.target.value);
            autoAdjustWeights(id, newValue);
            updatePreview();
        });
    });

    resetBtn.addEventListener('click', () => {
        const defaults = resetWeights();
        sliders.accessibility.value = defaults.accessibility * 100;
        sliders.amenities.value = defaults.amenities * 100;
        sliders.safety.value = defaults.safety * 100;
        sliders.environment.value = defaults.environment * 100;
        sliders.economy.value = defaults.economy * 100;
        sliders.prestige.value = defaults.prestige * 100;
        updatePreview();
    });

    applyBtn.addEventListener('click', () => {
        const newWeights = {
            accessibility: parseInt(sliders.accessibility.value) / 100,
            amenities: parseInt(sliders.amenities.value) / 100,
            safety: parseInt(sliders.safety.value) / 100,
            environment: parseInt(sliders.environment.value) / 100,
            economy: parseInt(sliders.economy.value) / 100,
            prestige: parseInt(sliders.prestige.value) / 100
        };

        // Tracking Analytics
        if (window.analytics) {
            window.analytics.trackEvent('weights_updated', {
                weights: newWeights
            });
        }

        saveWeights(newWeights);
        window.location.hash = '/localities';
        // Scroll to localities section after page fully renders
        setTimeout(() => {
            const localitiesSection = document.getElementById('localities-section');
            if (localitiesSection) {
                localitiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 500);
    });

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;

            // Tracking Analytics
            if (window.analytics) {
                window.analytics.trackEvent('preset_clicked', {
                    preset_name: preset
                });
            }

            const presets = {
                balanced: { accessibility: 20, amenities: 20, safety: 15, environment: 15, economy: 15, prestige: 15 },
                families: { accessibility: 20, amenities: 30, safety: 20, environment: 15, economy: 10, prestige: 5 },
                professionals: { accessibility: 25, amenities: 20, safety: 10, environment: 10, economy: 25, prestige: 10 },
                retirees: { accessibility: 15, amenities: 30, safety: 20, environment: 25, economy: 5, prestige: 5 },
                environment: { accessibility: 10, amenities: 15, safety: 15, environment: 40, economy: 10, prestige: 10 }
            };

            const values = presets[preset];
            sliders.accessibility.value = values.accessibility;
            sliders.amenities.value = values.amenities;
            sliders.safety.value = values.safety;
            sliders.environment.value = values.environment;
            sliders.economy.value = values.economy;
            sliders.prestige.value = values.prestige;
            updatePreview();
        });
    });

    // Initial preview
    updatePreview();
}
