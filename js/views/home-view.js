// Home View - Modern dark-themed landing page for Trivandrum Top 10 App

async function renderHomeView() {
  const app = document.getElementById('app');

  // Load data for stats
  const rankingsData = await loadRankings();
  const totalLocalities = rankingsData?.all_rankings?.length || 20;

  const html = `
    <!-- Hero Section - Dark Theme -->
    <section class="hero-dark">
      <div class="hero-dark-bg">
        <div class="hero-glow hero-glow-1"></div>
        <div class="hero-glow hero-glow-2"></div>
      </div>

      <!-- Floating Stats -->
      <div class="floating-stat stat-1">
        <span class="stat-dot"></span>
        <span class="stat-label">Neighborhoods</span>
        <span class="stat-value">${totalLocalities}</span>
      </div>
      <div class="floating-stat stat-2">
        <span class="stat-dot"></span>
        <span class="stat-label">Categories</span>
        <span class="stat-value">12</span>
      </div>
      <div class="floating-stat stat-3">
        <span class="stat-dot"></span>
        <span class="stat-label">Ranked Places</span>
        <span class="stat-value">200+</span>
      </div>

      <!-- Main Content -->
      <div class="hero-dark-content">
        <div class="hero-badge">
          <span class="badge-icon">&#9679;</span>
          <span>Kerala's First Data-Driven City Guide</span>
          <span class="badge-arrow">&rarr;</span>
        </div>

        <h1 class="hero-dark-title">
          The Definitive Guide to<br>
          <span class="highlight">Trivandrum</span>
        </h1>

        <p class="hero-dark-tagline">
          Objective, API-verified rankings for neighborhoods, dining, hotels, and lifestyle — zero bias, zero sponsored placements.
        </p>

        <div class="hero-ctas">
          <a href="#/localities" class="cta-primary">
            <span>Explore Rankings</span>
            <span class="cta-arrow">&nearr;</span>
          </a>
          <a href="#/methodology" class="cta-secondary">
            View Methodology
          </a>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="scroll-indicator">
        <span class="scroll-icon">&darr;</span>
        <span class="scroll-text">Scroll to explore</span>
      </div>
    </section>

    <!-- Explore Section -->
    <section class="explore-section explore-dark">
      <h2 class="section-title">Explore by Category</h2>
      <p class="section-subtitle">12 categories, hundreds of places, one objective scoring system</p>

      <!-- Premium Grid Layout -->
      <div class="explore-grid premium-grid">

        <!-- Stay & Dine (Grouped Hospitality) -->
        <div class="explore-card hero-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/stay_dine_premium.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Hospitality</span>
            <h3>Stay & Dine</h3>
            <p>Experience the best hotels, cozy cafes, and world-class restaurants.</p>
            <div class="explore-card-links">
              <a href="#/restaurants" class="explore-pill-link">Restaurants</a>
              <a href="#/cafes" class="explore-pill-link">Cafes</a>
              <a href="#/hotels" class="explore-pill-link">Hotels</a>
            </div>
          </div>
        </div>

        <!-- Shopping -->
        <div class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/shopping_hero.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Retail</span>
            <h3>Shopping</h3>
            <p>Modern malls or traditional boutiques?</p>
            <div class="explore-card-links">
              <a href="#/malls" class="explore-pill-link">Malls</a>
              <a href="#/boutiques" class="explore-pill-link">Boutiques</a>
            </div>
          </div>
        </div>

        <!-- Culture -->
        <div class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/culture_premium.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Heritage</span>
            <h3>Culture</h3>
            <p>Explore museums and spiritual landmarks.</p>
            <div class="explore-card-links">
              <a href="#/museums" class="explore-pill-link">Museums</a>
              <a href="#/religious-sites" class="explore-pill-link">Religious Sites</a>
            </div>
          </div>
        </div>

        <!-- Healthcare -->
        <a href="#/healthcare" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/healthcare_premium.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Wellness</span>
            <h3>Healthcare</h3>
            <p>Top-tier medical centers and specialized clinics.</p>
          </div>
        </a>

        <!-- Education & More -->
        <a href="#/services" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/education_brick.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Services</span>
            <h3>Education & More</h3>
            <p>Schools, banking, and essential city services.</p>
          </div>
        </a>

        <!-- Localities -->
        <a href="#/localities" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/localities_premium.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Neighborhoods</span>
            <h3>Localities</h3>
            <p>Browse all 20 ranked residential areas.</p>
          </div>
        </a>
      </div>
    </section>

    <!-- Why Trust Us Section -->
    <section class="why-section">
      <div class="why-content">
        <h2>Why Trust Our Rankings?</h2>
        <p class="why-lead">Every score is calculated from verifiable API data — no opinions, no paid placements, no editorial bias.</p>

        <div class="why-grid">
          <div class="why-card">
            <div class="why-icon-box">
              <span class="why-icon-text">API</span>
            </div>
            <h3>API-Sourced</h3>
            <p>All data comes directly from Google Maps APIs with explicit formulas.</p>
          </div>

          <div class="why-card">
            <div class="why-icon-box">
              <span class="why-icon-text">100%</span>
            </div>
            <h3>Fully Transparent</h3>
            <p>Every weight and calculation is documented in our methodology.</p>
          </div>

          <div class="why-card">
            <div class="why-icon-box">
              <span class="why-icon-text">YOU</span>
            </div>
            <h3>Customizable</h3>
            <p>Adjust weights to match your priorities and see rankings update live.</p>
          </div>
        </div>

        <div class="why-cta">
          <a href="#/about" class="cta-secondary">Learn More About Us</a>
        </div>
      </div>
    </section>
  `;

  app.innerHTML = html;
}
