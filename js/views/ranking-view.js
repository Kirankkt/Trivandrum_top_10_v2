// Ranking View - TripAdvisor-Style List Layout
async function renderRankingView() {
  const app = document.getElementById('app');

  // Load data
  const rankingsData = await loadRankings();
  if (!rankingsData) {
    app.innerHTML = '<div class="error">Failed to load rankings. Please refresh.</div>';
    return;
  }

  const weights = getWeights();
  const isCustom = weights.qol !== 0.55 || weights.economic !== 0.20 || weights.sustainability !== 0.25;

  // Recalculate with custom weights if needed
  const localities = isCustom ?
    recalculateRankings(rankingsData.all_rankings, weights) :
    rankingsData.all_rankings;

  const top10 = localities.slice(0, 10);

  let html = `
    <div class="rankings-header">
      <h2>Best Places to Live in Thiruvananthapuram</h2>
      <p class="subtitle">Ranked by 41 data points across Quality of Life, Economic Value, and Environment & Charm</p>
      ${isCustom ? `
        <div class="custom-weights-indicator">
          <span class="custom-badge">✨ Custom weights applied</span>
          <button class="btn btn-reset-weights" id="reset-weights-btn">
            ↺ Reset to Defaults
          </button>
        </div>
      ` : ''}
    </div>
    
    <div class="rankings-list">
  `;

  top10.forEach((locality, index) => {
    const rank = index + 1;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

    // Get category info from locality.data
    const categoryIcon = locality.data?.category_icon || '🏘️';
    const primaryCategory = locality.data?.primary_category || 'Residential';
    const tags = locality.data?.tags || [];

    // Get price info safely
    const landPrice = locality.land_price || locality.data?.land_price_per_cent_lakhs || 'N/A';
    const aptPrice = locality.apartment_price || locality.data?.apartment_price_per_sqft || 'N/A';

    // Get travel time
    const techTime = locality.data?.technopark_time || 'N/A';

    html += `
      <div class="locality-card" data-locality="${locality.name}">
        <div class="rank-badge">
          <span class="rank-number">#${rank}</span>
          ${medal ? `<span class="rank-medal">${medal}</span>` : ''}
        </div>
        
        <div class="locality-map-container" id="map-list-${index}" onclick="event.stopPropagation()"></div>

        <div class="locality-info">
          <div class="locality-header">
            <h3 class="locality-name">${locality.name}</h3>
            <span class="category-badge">
              <span>${categoryIcon}</span>
              <span>${primaryCategory}</span>
            </span>
          </div>
          
          <div class="locality-meta">
            <span>🏠 ₹${landPrice}L/cent</span>
            <span>🏢 ₹${aptPrice}/sqft</span>
            <span>🚗 ${techTime} min to Technopark</span>
          </div>
          
          ${tags.length > 0 ? `
          <div class="tags-container">
            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          ` : ''}
          
          <div class="score-bars">
            <div class="score-bar-item">
              <span class="score-bar-label">Quality of Life</span>
              <div class="score-bar">
                <div class="score-fill qol" style="width: ${(locality.qol_score / 10) * 100}%"></div>
              </div>
              <span class="score-value">${locality.qol_score.toFixed(1)}</span>
            </div>
            <div class="score-bar-item">
              <span class="score-bar-label">Economic</span>
              <div class="score-bar">
                <div class="score-fill economic" style="width: ${(locality.economic_score / 10) * 100}%"></div>
              </div>
              <span class="score-value">${locality.economic_score.toFixed(1)}</span>
            </div>
            <div class="score-bar-item">
              <span class="score-bar-label">Charm</span>
              <div class="score-bar">
                <div class="score-fill charm" style="width: ${(locality.sustainability_score / 10) * 100}%"></div>
              </div>
              <span class="score-value">${locality.sustainability_score.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <div class="overall-score">
          <div class="score-circle">
            <span class="score-number">${locality.overall_score.toFixed(1)}</span>
          </div>
          <div class="score-label">Overall</div>
        </div>
      </div>
    `;
  });

  html += '</div>';

  // Show "Also worth considering"
  if (localities.length > 10) {
    html += `
      <div class="also-consider">
        <h3>Also Worth Considering</h3>
        <div class="minor-rankings">
    `;

    localities.slice(10).forEach((locality, index) => {
      const rank = index + 11;
      const categoryIcon = locality.data?.category_icon || '🏘️';
      html += `
        <div class="minor-rank-item" data-locality="${locality.name}">
          <span class="minor-rank">#${rank}</span>
          <span class="minor-icon">${categoryIcon}</span>
          <span class="minor-name">${locality.name}</span>
          <span class="minor-score">${locality.overall_score.toFixed(2)}</span>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  }

  app.innerHTML = html;

  // Initialize Maps for Top 10
  top10.forEach((locality, index) => {
    const lat = locality.latitude || locality.data?.latitude;
    const lng = locality.longitude || locality.data?.longitude;

    if (lat && lng) {
      setTimeout(() => {
        const map = L.map(`map-list-${index}`, {
          center: [lat, lng],
          zoom: 13,
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // Add a marker
        L.marker([lat, lng]).addTo(map);
      }, 100 * index); // Stagger initialization slightly
    }
  });


  // Add click handlers for detail view
  document.querySelectorAll('.locality-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't navigate if clicking map (managed by stopPropagation above, but safety check)
      if (e.target.closest('.locality-map-container')) return;

      const name = card.dataset.locality;
      window.location.hash = `/locality/${name}`;
    });
  });

  // Add click handlers for minor rank items
  document.querySelectorAll('.minor-rank-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const name = item.dataset.locality;
      window.location.hash = `/locality/${name}`;
    });
  });

  // Add click handler for reset weights button
  const resetBtn = document.getElementById('reset-weights-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent any parent click handlers
      resetWeights(); // Reset to default weights
      renderRankingView(); // Re-render the rankings
    });
  }
}

// Recalculate rankings with custom weights
function recalculateRankings(localities, weights) {
  const recalculated = localities.map(loc => {
    // Recalculate overall score with new weights
    const newOverall = (
      (loc.qol_score * weights.qol) +
      (loc.economic_score * weights.economic) +
      (loc.sustainability_score * weights.sustainability)
    );

    return {
      ...loc,
      overall_score: newOverall
    };
  });

  // Re-sort by new overall score
  recalculated.sort((a, b) => b.overall_score - a.overall_score);


  return recalculated;
}

