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
        <!-- Main Hero Category: Stay & Dine -->
        <div class="explore-card hero-card">
            <div class="explore-card-image">
                <img src="images/categories/stay_dine_hero.png" alt="Stay & Dine in Trivandrum">
            </div>
            <div class="explore-card-content">
                <div class="explore-card-badge">Hospitality</div>
                <h3 class="explore-card-title">Stay & Dine</h3>
                <p class="explore-card-desc">Experience the best hotels, cozy cafes, and world-class restaurants in the city.</p>
                <div class="explore-card-links">
                    <a href="#/restaurants" class="explore-pill-link">Restaurants</a>
                    <a href="#/cafes" class="explore-pill-link">Cafes</a>
                    <a href="#/hotels" class="explore-pill-link">Hotels</a>
                </div>
            </div>
        </div>

        <!-- Secondary Row: Promoting Shopping, Culture, Healthcare -->
        <div class="explore-card">
            <div class="explore-card-image">
                <img src="images/categories/shopping_hero.png" alt="Shopping in Trivandrum">
            </div>
            <div class="explore-card-content">
                <div class="explore-card-badge">Retail</div>
                <h3 class="explore-card-title">Shopping</h3>
                <p class="explore-card-desc">Modern malls or local boutiques?</p>
                <div class="explore-card-links">
                    <a href="#/malls" class="explore-pill-link">Malls</a>
                    <a href="#/boutiques" class="explore-pill-link">Boutiques</a>
                </div>
            </div>
        </div>

        <div class="explore-card">
            <div class="explore-card-image">
                <img src="images/categories/culture_hero.png" alt="Culture in Trivandrum">
            </div>
            <div class="explore-card-content">
                <div class="explore-card-badge">Heritage</div>
                <h3 class="explore-card-title">Culture</h3>
                <p class="explore-card-desc">Museums and spiritual landmarks.</p>
                <div class="explore-card-links">
                    <a href="#/museums" class="explore-pill-link">Museums</a>
                    <a href="#/religious-sites" class="explore-pill-link">Religious Sites</a>
                </div>
            </div>
        </div>

        <a href="#/healthcare" class="explore-card">
            <div class="explore-card-image">
                <img src="images/skyline.png" alt="Healthcare in Trivandrum">
            </div>
            <div class="explore-card-content">
                <div class="explore-card-badge">Wellness</div>
                <h3 class="explore-card-title">Healthcare</h3>
                <p class="explore-card-desc">Top-tier medical centers and clinics.</p>
            </div>
        </a>

        <a href="#/services" class="explore-card">
            <div class="explore-card-image">
                <img src="images/skyline.png" alt="Services in Trivandrum">
            </div>
            <div class="explore-card-content">
                <div class="explore-card-badge">Services</div>
                <h3 class="explore-card-title">Education & More</h3>
                <p class="explore-card-desc">Schools, banking, and essential city services.</p>
            </div>
        </a>

        <a href="#/localities" class="explore-card">
            <div class="explore-card-image">
                <img src="images/hero.png" alt="Neighborhoods in Trivandrum">
            </div>
            <div class="explore-card-content">
                <div class="explore-card-badge">Neighborhoods</div>
                <h3 class="explore-card-title">Localities</h3>
                <p class="explore-card-desc">Browse all 20 ranked residential areas.</p>
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
