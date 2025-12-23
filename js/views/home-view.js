// Home View - Landing page for Trivandrum Top 10 App

async function renderHomeView() {
  const app = document.getElementById('app');

  // Load data for featured items
  const rankingsData = await loadRankings();
  const topLocalities = rankingsData?.all_rankings?.slice(0, 3) || [];

  const html = `
    <!-- Hero Section -->
    <section class="home-hero">
      <div class="home-hero-image">
        <img src="images/hero_main.png" alt="Trivandrum" />
        <div class="home-hero-overlay"></div>
      </div>
      <div class="home-hero-content">
        <h1 class="home-hero-title">Trivandrum <span class="highlight">Top 10</span></h1>
        <p class="home-hero-tagline">Data-driven rankings for Kerala's capital city — neighborhoods, dining, & lifestyle</p>
        
        <div class="purpose-cards">
          <a href="#/localities" class="purpose-card">
            <span class="purpose-text">Find a Home</span>
          </a>
          <a href="#/restaurants" class="purpose-card">
            <span class="purpose-text">Dine Out</span>
          </a>
          <a href="#/experiences" class="purpose-card">
            <span class="purpose-text">Explore Culture</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Explore Section -->
    <section class="explore-section">
      <h2 class="section-title">Explore by Category</h2>

      <!-- Premium Grid Layout -->
      <div class="explore-grid premium-grid">
        
        <!-- Localities Card -->
        <a href="#/localities" class="explore-card large-card">
          <div class="explore-card-bg" style="background-image: url('images/localities/locality_kowdiar_1765515570335.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Live</span>
            <h3>Localities</h3>
            <p>20+ neighborhoods ranked by accessibility, amenities, & safety</p>
          </div>
        </a>

        <!-- Stay & Dine (Grouped Hospitality) -->
        <a href="#/restaurants" class="explore-card large-card">
          <!-- Using new premium asset -->
          <div class="explore-card-bg" style="background-image: url('images/categories/stay_dine_hero.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Eat & Stay</span>
            <h3>Stay & Dine</h3>
            <p>Curated restaurants, cafes, and luxury hotels</p>
          </div>
        </a>

        <!-- Shopping -->
        <a href="#/malls" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/shopping_hero.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Shop</span>
            <h3>Shopping</h3>
            <p>Malls, boutiques & specialty shops</p>
          </div>
        </a>

        <!-- Culture -->
        <a href="#/museums" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/culture_hero.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Culture</span>
            <h3>Heritage</h3>
            <p>Museums, temples & history</p>
          </div>
        </a>

        <!-- Healthcare -->
        <a href="#/healthcare" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/skyline.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Services</span>
            <h3>Healthcare</h3>
            <p>Top medical centers & hospitals</p>
          </div>
        </a>

        <!-- Services -->
        <a href="#/education" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/skyline.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Services</span>
            <h3>Education & More</h3>
            <p>Schools, banking & essential services</p>
          </div>
        </a>

      </div>
    </section>

    <!-- About Section -->
    <section class="about-section">
      <div class="about-content">
        <h2>Why trust our rankings?</h2>
        <p>Objective insights powered by Google Maps API, travel metrics, and real pricing data — zero bias, zero sponsored content.</p>
        <div class="about-features">
          <div class="about-feature">
            <span class="feature-icon">📊</span>
            <span>Data-Driven</span>
          </div>
          <div class="about-feature">
            <span class="feature-icon">⚖️</span>
            <span>Objective Weights</span>
          </div>
          <div class="about-feature">
            <span class="feature-icon">🔍</span>
            <span>Real Local Research</span>
          </div>
        </div>
        <a href="#/methodology" class="btn-learn-more">Our Methodology</a>
      </div>
    </section>
  `;

  app.innerHTML = html;
}
