// Ranking View - America The Beautiful Inspired Design
async function renderRankingView() {
  const app = document.getElementById('app');

  // Load data
  const rankingsData = await loadRankings();
  if (!rankingsData) {
    app.innerHTML = '<div class="error">Failed to load rankings. Please refresh.</div>';
    return;
  }

  // Get trending localities from Supabase
  const trendingLocalities = window.getTrendingLocalities ? await window.getTrendingLocalities(3) : [];

  const weights = getWeights();
  const isCustom = weights.qol !== 0.55 || weights.economic !== 0.20 || weights.sustainability !== 0.25;

  // Recalculate with custom weights if needed
  const localities = isCustom ?
    recalculateRankings(rankingsData.all_rankings, weights) :
    rankingsData.all_rankings;

  // Locality image mapping
  const localityImages = {
    'Sreekaryam': 'images/localities/locality_sreekaryam_1765123690965.png',
    'Kovalam': 'images/localities/locality_kovalam_1765123711609.png',
    'Kowdiar': 'images/localities/locality_kowdiar_1765123730297.png',
    'Pattom': 'images/localities/locality_pattom_1765123772540.png',
    'Varkala': 'images/localities/locality_varkala_1765123795478.png',
    'Kazhakuttom': 'images/localities/locality_technopark_1765123812360.png',
    'default': 'images/skyline.png'
  };

  function getLocalityImage(name) {
    return localityImages[name] || localityImages['default'];
  }

  // Experience categories
  const categories = [
    { name: 'IT Professional', icon: '💻', localities: ['Sreekaryam', 'Kazhakuttom', 'Technopark'], image: 'images/tech.png' },
    { name: 'Beach Life', icon: '🏖️', localities: ['Kovalam', 'Varkala'], image: 'images/beach.png' },
    { name: 'Heritage & Culture', icon: '🏛️', localities: ['Kowdiar', 'Statue', 'Medical College'], image: 'images/palace.png' },
    { name: 'Family Living', icon: '👨‍👩‍👧', localities: ['Sasthamangalam', 'Pattom', 'Vellayambalam'], image: 'images/skyline.png' }
  ];

  let html = `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-image">
        <img src="images/hero.png" alt="Thiruvananthapuram" />
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title">Discover Thiruvananthapuram</h1>
        <p class="hero-subtitle">Find Your Perfect Neighborhood in Kerala's Capital</p>
          <div class="hero-stats">
            <div class="hero-stat">
              <span class="stat-number">20</span>
              <span class="stat-label">Localities</span>
            </div>
            <div class="hero-stat">
              <span class="stat-number">5</span>
              <span class="stat-label">Categories</span>
            </div>
            <div class="hero-stat">
              <span class="stat-number">100%</span>
              <span class="stat-label">Objective Data</span>
            </div>
          </div>
        <button class="hero-cta" id="explore-btn">Explore Localities</button>
      </div>
    </section>

    <!-- Experience Categories Section -->
    <section class="categories-section">
      <h2 class="section-title">Choose Your Lifestyle</h2>
      <div class="categories-grid">
        ${categories.map(cat => `
          <div class="category-card" data-category="${cat.name}">
            <div class="category-image">
              <img src="${cat.image}" alt="${cat.name}" />
              <div class="category-overlay"></div>
            </div>
            <h3 class="category-name">${cat.icon} ${cat.name}</h3>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Localities Grid Section -->
    <section class="localities-section" id="localities-section">
      <div class="section-header">
        <h2 class="section-title">Top Localities</h2>
        <p class="section-subtitle">Ranked by Accessibility, Amenities, Safety, Environment & Economy</p>
        ${isCustom ? `
          <div class="custom-weights-banner">
            <span>✨ Custom weights applied</span>
            <button class="btn-reset" id="reset-weights-btn">Reset to Defaults</button>
          </div>
        ` : ''}
      </div>
      
      <div class="localities-grid">
  `;

  // Top 10 in featured grid
  localities.slice(0, 10).forEach((locality, index) => {
    const rank = index + 1;
    const isTrending = trendingLocalities.includes(locality.name);
    const image = getLocalityImage(locality.name);

    html += `
      <div class="locality-card-new" data-locality="${locality.name}">
        <div class="locality-image">
          <img src="${image}" alt="${locality.name}" onerror="this.src='images/skyline.png'" />
          <div class="locality-overlay"></div>
          <div class="locality-rank">#${rank}</div>
          ${isTrending ? '<div class="trending-badge-new">🔥 Trending</div>' : ''}
        </div>
        <div class="locality-info-new">
          <h3 class="locality-name-new">${locality.name}</h3>
          <div class="locality-score">
            <span class="score-value">${locality.overall_score?.toFixed(1) || 'N/A'}</span>
            <span class="score-label">/ 10</span>
          </div>
          <div class="locality-meta-new">
            <span>🏠 ₹${locality.land_price || 'N/A'}L</span>
            <span>🚗 ${locality.data?.technopark_time || 'N/A'} min</span>
          </div>
        </div>
      </div>
    `;
  });

  html += `
      </div>
      
      <!-- Show More Button -->
      <div class="show-more-container">
        <button class="btn-show-more" id="show-more-btn">View All 20 Localities</button>
      </div>
      
      <!-- Hidden: Remaining localities -->
      <div class="localities-grid hidden" id="more-localities">
  `;

  // Remaining localities (11-20)
  localities.slice(10, 20).forEach((locality, index) => {
    const rank = index + 11;
    const isTrending = trendingLocalities.includes(locality.name);
    const image = getLocalityImage(locality.name);

    html += `
      <div class="locality-card-new" data-locality="${locality.name}">
        <div class="locality-image">
          <img src="${image}" alt="${locality.name}" onerror="this.src='images/skyline.png'" />
          <div class="locality-overlay"></div>
          <div class="locality-rank">#${rank}</div>
          ${isTrending ? '<div class="trending-badge-new">🔥 Trending</div>' : ''}
        </div>
        <div class="locality-info-new">
          <h3 class="locality-name-new">${locality.name}</h3>
          <div class="locality-score">
            <span class="score-value">${locality.overall_score?.toFixed(1) || 'N/A'}</span>
            <span class="score-label">/ 10</span>
          </div>
          <div class="locality-meta-new">
            <span>🏠 ₹${locality.land_price || 'N/A'}L</span>
            <span>🚗 ${locality.data?.technopark_time || 'N/A'} min</span>
          </div>
        </div>
      </div>
    `;
  });

  html += `
      </div>
      
      <!-- Show Less Button (appears after expanding) -->
      <div class="show-less-container hidden" id="show-less-container">
        <button class="btn-show-less" id="show-less-btn">Show Less</button>
      </div>
    </section>

    <!-- Methodology CTA -->
    <section class="cta-section">
      <h2>How We Rank</h2>
      <p>Our transparent, data-driven methodology uses 100% API-sourced metrics. No AI guessing, no subjective ratings.</p>
      <div class="cta-buttons">
        <a href="#/methodology" class="btn-primary">Learn Our Methodology</a>
        <a href="#/customize" class="btn-secondary">Customize Rankings</a>
      </div>
    </section>
  `;

  app.innerHTML = html;

  // Event Listeners

  // Locality card clicks
  document.querySelectorAll('.locality-card-new').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.locality;
      window.location.hash = `#/locality/${encodeURIComponent(name)}`;
    });
  });

  // Category card clicks
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const category = card.dataset.category;
      // TODO: Filter localities by category
      document.getElementById('localities-section').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Show more/less buttons
  const showMoreBtn = document.getElementById('show-more-btn');
  const showLessBtn = document.getElementById('show-less-btn');
  const moreLocalities = document.getElementById('more-localities');
  const showLessContainer = document.getElementById('show-less-container');

  if (showMoreBtn && moreLocalities) {
    showMoreBtn.addEventListener('click', () => {
      moreLocalities.classList.remove('hidden');
      showMoreBtn.parentElement.classList.add('hidden'); // Hide "View All" button
      if (showLessContainer) showLessContainer.classList.remove('hidden'); // Show "Show Less" at bottom
    });
  }

  if (showLessBtn && moreLocalities) {
    showLessBtn.addEventListener('click', () => {
      moreLocalities.classList.add('hidden');
      showMoreBtn.parentElement.classList.remove('hidden'); // Show "View All" button again
      if (showLessContainer) showLessContainer.classList.add('hidden'); // Hide "Show Less"
      // Scroll back to top of localities section
      document.getElementById('localities-section').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Reset weights button
  const resetBtn = document.getElementById('reset-weights-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('customWeights');
      window.location.reload();
    });
  }

  // Explore button - scroll to localities
  const exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      document.getElementById('localities-section').scrollIntoView({ behavior: 'smooth' });
    });
  }
}
