// Customize View - 5-Category Objective System
async function renderCustomizeView() {
  const app = document.getElementById('app');
  const weights = getWeights();
  const rankingsData = await loadRankings();

  let html = `
        <div class="customize-header">
            <h2>⚖️ Customize Your Rankings</h2>
            <p class="subtitle">Adjust the 5 objective categories to match your priorities</p>
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

  // Initialize sliders
  const accessibilitySlider = document.getElementById('accessibility-slider');
  const amenitiesSlider = document.getElementById('amenities-slider');
  const safetySlider = document.getElementById('safety-slider');
  const environmentSlider = document.getElementById('environment-slider');
  const economySlider = document.getElementById('economy-slider');
  const applyBtn = document.getElementById('apply-btn');
  const resetBtn = document.getElementById('reset-btn');

  // Update preview function
  function updatePreview() {
    const accessibility = parseInt(accessibilitySlider.value) / 100;
    const amenities = parseInt(amenitiesSlider.value) / 100;
    const safety = parseInt(safetySlider.value) / 100;
    const environment = parseInt(environmentSlider.value) / 100;
    const economy = parseInt(economySlider.value) / 100;

    // Update display values
    document.getElementById('accessibility-value').textContent = `${Math.round(accessibility * 100)}%`;
    document.getElementById('amenities-value').textContent = `${Math.round(amenities * 100)}%`;
    document.getElementById('safety-value').textContent = `${Math.round(safety * 100)}%`;
    document.getElementById('environment-value').textContent = `${Math.round(environment * 100)}%`;
    document.getElementById('economy-value').textContent = `${Math.round(economy * 100)}%`;

    // Check total
    const total = Math.round((accessibility + amenities + safety + environment + economy) * 100);
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
      const customWeights = { accessibility, amenities, safety, environment, economy };
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

  // Event listeners
  accessibilitySlider.addEventListener('input', updatePreview);
  amenitiesSlider.addEventListener('input', updatePreview);
  safetySlider.addEventListener('input', updatePreview);
  environmentSlider.addEventListener('input', updatePreview);
  economySlider.addEventListener('input', updatePreview);

  resetBtn.addEventListener('click', () => {
    const defaults = resetWeights();
    accessibilitySlider.value = defaults.accessibility * 100;
    amenitiesSlider.value = defaults.amenities * 100;
    safetySlider.value = defaults.safety * 100;
    environmentSlider.value = defaults.environment * 100;
    economySlider.value = defaults.economy * 100;
    updatePreview();
  });

  applyBtn.addEventListener('click', () => {
    const newWeights = {
      accessibility: parseInt(accessibilitySlider.value) / 100,
      amenities: parseInt(amenitiesSlider.value) / 100,
      safety: parseInt(safetySlider.value) / 100,
      environment: parseInt(environmentSlider.value) / 100,
      economy: parseInt(economySlider.value) / 100
    };
    saveWeights(newWeights);
    window.location.hash = '/';
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
      const presets = {
        balanced: { accessibility: 25, amenities: 25, safety: 15, environment: 15, economy: 20 },
        families: { accessibility: 20, amenities: 30, safety: 20, environment: 15, economy: 15 },
        professionals: { accessibility: 30, amenities: 20, safety: 10, environment: 10, economy: 30 },
        retirees: { accessibility: 15, amenities: 30, safety: 20, environment: 25, economy: 10 },
        environment: { accessibility: 10, amenities: 20, safety: 15, environment: 40, economy: 15 }
      };

      const values = presets[preset];
      accessibilitySlider.value = values.accessibility;
      amenitiesSlider.value = values.amenities;
      safetySlider.value = values.safety;
      environmentSlider.value = values.environment;
      economySlider.value = values.economy;
      updatePreview();
    });
  });

  // Initial preview
  updatePreview();
}
