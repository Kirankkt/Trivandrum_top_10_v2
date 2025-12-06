// Customize View - Interactive weight sliders
async function renderCustomizeView() {
  const app = document.getElementById('app');
  const weights = getWeights();
  const rankingsData = await loadRankings();

  let html = `
        <div class="customize-header">
            <h2>⚖️ Customize Your Rankings</h2>
            <p class="subtitle">Adjust priorities to match what matters most to you</p>
        </div>
        
        <div class="customization-container">
            <div class="sliders-section">
                <div class="weight-slider-group">
                    <div class="slider-header">
                        <span class="slider-icon">🏘️</span>
                        <span class="slider-title">Quality of Life</span>
                        <span class="slider-value" id="qol-value">${Math.round(weights.qol * 100)}%</span>
                    </div>
                    <input type="range" id="qol-slider" class="weight-slider" 
                           min="0" max="100" value="${weights.qol * 100}" step="5">
                    <p class="slider-description">
                        Accessibility, safety, education, healthcare, recreation, environment
                    </p>
                </div>
                
                <div class="weight-slider-group">
                    <div class="slider-header">
                        <span class="slider-icon">💰</span>
                        <span class="slider-title">Economic Value</span>
                        <span class="slider-value" id="economic-value">${Math.round(weights.economic * 100)}%</span>
                    </div>
                    <input type="range" id="economic-slider" class="weight-slider" 
                           min="0" max="100" value="${weights.economic * 100}" step="5">
                    <p class="slider-description">
                        Property prices, job access, commercial vibrancy
                    </p>
                </div>
                
                <div class="weight-slider-group">
                    <div class="slider-header">
                        <span class="slider-icon">🌱</span>
                        <span class="slider-title">Environment & Charm</span>
                        <span class="slider-value" id="sustainability-value">${Math.round(weights.sustainability * 100)}%</span>
                    </div>
                    <input type="range" id="sustainability-slider" class="weight-slider" 
                           min="0" max="100" value="${weights.sustainability * 100}" step="5">
                    <p class="slider-description">
                        Green cover, cleanliness, prestige, urban character, and infrastructure quality
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
                        🎯 Balanced (55-20-25)
                    </button>
                    <button class="preset-btn" data-preset="families">
                        👨‍👩‍👧 Families (70-10-20)
                    </button>
                    <button class="preset-btn" data-preset="professionals">
                        💼 IT Professionals (40-40-20)
                    </button>
                    <button class="preset-btn" data-preset="investors">
                        💎 Investors/NRIs (30-30-40)
                    </button>
                    <button class="preset-btn" data-preset="environment">
                        🌳 Environment Lovers (30-20-50)
                    </button>
                </div>
            </div>
        </div>
    `;

  app.innerHTML = html;

  // Initialize
  const qolSlider = document.getElementById('qol-slider');
  const economicSlider = document.getElementById('economic-slider');
  const sustainabilitySlider = document.getElementById('sustainability-slider');
  const applyBtn = document.getElementById('apply-btn');
  const resetBtn = document.getElementById('reset-btn');

  // Update preview function
  function updatePreview() {
    const qol = parseInt(qolSlider.value) / 100;
    const economic = parseInt(economicSlider.value) / 100;
    const sustainability = parseInt(sustainabilitySlider.value) / 100;

    // Update display values
    document.getElementById('qol-value').textContent = `${Math.round(qol * 100)}%`;
    document.getElementById('economic-value').textContent = `${Math.round(economic * 100)}%`;
    document.getElementById('sustainability-value').textContent = `${Math.round(sustainability * 100)}%`;

    // Check total
    const total = Math.round((qol + economic + sustainability) * 100);
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
      const customWeights = { qol, economic, sustainability };
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
  qolSlider.addEventListener('input', updatePreview);
  economicSlider.addEventListener('input', updatePreview);
  sustainabilitySlider.addEventListener('input', updatePreview);

  resetBtn.addEventListener('click', () => {
    const defaults = resetWeights();
    qolSlider.value = defaults.qol * 100;
    economicSlider.value = defaults.economic * 100;
    sustainabilitySlider.value = defaults.sustainability * 100;
    updatePreview();
  });

  applyBtn.addEventListener('click', () => {
    const newWeights = {
      qol: parseInt(qolSlider.value) / 100,
      economic: parseInt(economicSlider.value) / 100,
      sustainability: parseInt(sustainabilitySlider.value) / 100
    };
    saveWeights(newWeights);
    window.location.hash = '/';
  });

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      const presets = {
        balanced: { qol: 55, economic: 20, sustainability: 25 },
        families: { qol: 70, economic: 10, sustainability: 20 },
        professionals: { qol: 40, economic: 40, sustainability: 20 },
        investors: { qol: 30, economic: 30, sustainability: 40 },
        environment: { qol: 30, economic: 20, sustainability: 50 }
      };

      const values = presets[preset];
      qolSlider.value = values.qol;
      economicSlider.value = values.economic;
      sustainabilitySlider.value = values.sustainability;
      updatePreview();
    });
  });

  // Initial preview
  updatePreview();
}
