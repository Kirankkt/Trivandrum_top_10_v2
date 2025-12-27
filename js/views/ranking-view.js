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
  // Check if weights differ from 6-category defaults
  const defaultWeights = {
    accessibility: 0.20, amenities: 0.25, safety: 0.15,
    environment: 0.15, economy: 0.15, prestige: 0.10
  };
  const isCustom = localStorage.getItem('customWeights') !== null;

  // Recalculate with custom weights if needed
  const localities = isCustom ?
    recalculateRankings(rankingsData.all_rankings, weights) :
    rankingsData.all_rankings;

  // Locality image mapping - Lifestyle-based placeholders for the grid view
  // Each locality is mapped to one of the 4 lifestyle archetypes
  const localityImages = {
    // IT Professional (tech.png)
    'Kazhakuttom': 'images/tech.png',
    'Sreekaryam': 'images/tech.png',
    'Ulloor': 'images/tech.png',

    // Beach Life (beach.png)
    'Kovalam': 'images/beach.png',
    'Varkala': 'images/beach.png',

    // Heritage & Culture (palace.png)
    'Statue': 'images/palace.png',
    'Kowdiar': 'images/palace.png',
    'Vellayambalam': 'images/palace.png',
    'PMG': 'images/palace.png',
    'Vazhuthacaud': 'images/palace.png',
    'Jagathy': 'images/palace.png',
    'Kuravankonam': 'images/palace.png',

    // Family Living (skyline.png)
    'Pattom': 'images/skyline.png',
    'Enchakkal': 'images/skyline.png',
    'Ambalamukku': 'images/skyline.png',
    'Kesavadasapuram': 'images/skyline.png',
    'Sasthamangalam': 'images/skyline.png',
    'Peroorkada': 'images/skyline.png',
    'Medical College': 'images/skyline.png',
    'Poojapura': 'images/skyline.png',
    'Thampanoor': 'images/skyline.png',

    'default': 'images/skyline.png'
  };

  function getLocalityImage(name) {
    return localityImages[name] || localityImages['default'];
  }

  // Experience categories with associated localities (Icons removed for professional feel)
  const categories = [
    { name: 'IT Professional', localities: ['Kazhakuttom', 'Sreekaryam', 'Ulloor'], image: 'images/tech.png' },
    { name: 'Beach Life', localities: ['Kovalam', 'Varkala'], image: 'images/beach.png' },
    { name: 'Heritage & Culture', localities: ['Kowdiar', 'Statue', 'Vellayambalam', 'PMG', 'Vazhuthacaud', 'Jagathy', 'Kuravankonam'], image: 'images/palace.png' },
    { name: 'Family Living', localities: ['Sasthamangalam', 'Pattom', 'Ambalamukku', 'Kesavadasapuram', 'Enchakkal', 'Medical College', 'Peroorkada', 'Poojapura'], image: 'images/skyline.png' }
  ];

  // Store categories globally for filter access
  window.lifestyleCategories = categories;

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
              <span class="stat-number">6</span>
              <span class="stat-label">Categories</span>
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
              <img src="${cat.image}" alt="${cat.name}" loading="lazy" />
              <div class="category-overlay"></div>
            </div>
            <h3 class="category-name">${cat.name}</h3>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Localities Grid Section -->
    <section class="localities-section" id="localities-section">
      <div class="section-header">
        <div class="section-header-top">
          <h2 class="section-title">Top Localities</h2>
        </div>
        <p class="section-subtitle">Ranked by Accessibility, Amenities, Safety, Environment & Economy</p>
        ${isCustom ? `
          <div class="custom-weights-banner">
            <span>✨ Custom weights applied</span>
            <button class="btn-reset" id="reset-weights-btn">Reset to Defaults</button>
          </div>
        ` : ''}
        <div id="category-filter-banner" class="category-filter-banner hidden">
          <span id="filter-label"></span>
          <button class="btn-reset" id="clear-filter-btn">✕ Clear Filter</button>
        </div>
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
          <img src="${image}" alt="${locality.name}" loading="lazy" onerror="this.src='images/skyline.png'" />
          <div class="locality-overlay"></div>
          <div class="locality-rank">#${rank}</div>
          ${isTrending ? '<div class="badge-trending">Trending</div>' : ''}
        </div>
        <div class="locality-info-new">
          <h3 class="locality-name-new">${locality.name}</h3>
          <div class="locality-score">
            <span class="score-value">${locality.overall_score?.toFixed(1) || 'N/A'}</span>
            <span class="score-label">/ 10</span>
          </div>
          <div class="locality-meta-new">
            <span>Land: ₹${locality.land_price || locality.data?.land_price_per_cent_lakhs || 'N/A'}L/cent</span>
            <span>Apartment: ₹${locality.apartment_price || locality.data?.apartment_price_per_sqft || 'N/A'}/sqft</span>
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
          <img src="${image}" alt="${locality.name}" loading="lazy" onerror="this.src='images/skyline.png'" />
          <div class="locality-overlay"></div>
          <div class="locality-rank">#${rank}</div>
          ${isTrending ? '<div class="badge-trending">Trending</div>' : ''}
        </div>
        <div class="locality-info-new">
          <h3 class="locality-name-new">${locality.name}</h3>
          <div class="locality-score">
            <span class="score-value">${locality.overall_score?.toFixed(1) || 'N/A'}</span>
            <span class="score-label">/ 10</span>
          </div>
          <div class="locality-meta-new">
            <span>Land: ₹${locality.land_price || locality.data?.land_price_per_cent_lakhs || 'N/A'}L/cent</span>
            <span>Apartment: ₹${locality.apartment_price || locality.data?.apartment_price_per_sqft || 'N/A'}/sqft</span>
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

  // Category card clicks - MULTI-SELECT filter localities
  // Track active filters
  window.activeFilters = window.activeFilters || new Set();

  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const categoryName = card.dataset.category;
      const category = window.lifestyleCategories.find(c => c.name === categoryName);

      if (!category) return;

      // Toggle this category in active filters
      if (window.activeFilters.has(categoryName)) {
        window.activeFilters.delete(categoryName);
        card.classList.remove('active');
      } else {
        window.activeFilters.add(categoryName);
        card.classList.add('active');
      }

      // Update filter banner
      const filterBanner = document.getElementById('category-filter-banner');
      const filterLabel = document.getElementById('filter-label');

      if (window.activeFilters.size === 0) {
        // No filters active - hide banner and show all
        if (filterBanner) filterBanner.classList.add('hidden');
        document.querySelectorAll('.locality-card-new').forEach(c => c.style.display = '');

        // Restore default view
        const moreLocalities = document.getElementById('more-localities');
        const showMoreBtnParent = document.getElementById('show-more-btn')?.parentElement;
        if (moreLocalities) moreLocalities.classList.add('hidden');
        if (showMoreBtnParent) showMoreBtnParent.classList.remove('hidden');
        return;
      }

      // Build combined list of localities from all active filters
      const activeCategories = window.lifestyleCategories.filter(c => window.activeFilters.has(c.name));
      const allMatchingLocalities = new Set();
      activeCategories.forEach(cat => {
        cat.localities.forEach(loc => allMatchingLocalities.add(loc));
      });

      // Update banner with active filter names
      const filterNames = activeCategories.map(c => c.name).join(' + ');
      if (filterBanner && filterLabel) {
        filterLabel.textContent = `Showing: ${filterNames}`;
        filterBanner.classList.remove('hidden');
      }

      // Expand 'more localities' section
      const moreLocalities = document.getElementById('more-localities');
      const showMoreBtnParent = document.getElementById('show-more-btn')?.parentElement;
      const showLessContainer = document.getElementById('show-less-container');

      if (moreLocalities) moreLocalities.classList.remove('hidden');
      if (showMoreBtnParent) showMoreBtnParent.classList.add('hidden');
      if (showLessContainer) showLessContainer.classList.add('hidden');

      // Filter locality cards - show if in ANY active filter
      document.querySelectorAll('.locality-card-new').forEach(locCard => {
        const localityName = locCard.dataset.locality;
        locCard.style.display = allMatchingLocalities.has(localityName) ? '' : 'none';
      });

      // Scroll to localities section
      document.getElementById('localities-section').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Clear filter button
  const clearFilterBtn = document.getElementById('clear-filter-btn');
  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', () => {
      // Clear active filters tracking
      window.activeFilters = new Set();

      // Show all localities
      document.querySelectorAll('.locality-card-new').forEach(card => {
        card.style.display = '';
      });

      // Hide filter banner
      const filterBanner = document.getElementById('category-filter-banner');
      if (filterBanner) filterBanner.classList.add('hidden');

      // Remove active state from categories
      document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));

      // Restore show more/less to default state (hide more localities, show "View All" button)
      const moreLocalities = document.getElementById('more-localities');
      const showMoreBtnParent = document.getElementById('show-more-btn')?.parentElement;
      const showLessContainer = document.getElementById('show-less-container');

      if (moreLocalities) moreLocalities.classList.add('hidden');
      if (showMoreBtnParent) showMoreBtnParent.classList.remove('hidden');
      if (showLessContainer) showLessContainer.classList.add('hidden');
    });
  }

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
