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

    <!-- About Section -->
    <section class="about-section">
      <div class="about-content">
        <h2>Why trust our rankings?</h2>
        <p class="about-lead">Our objective scoring system removes human bias and marketing noise to give you the truth about Thiruvananthapuram's neighborhoods and lifestyle.</p>
        
        <div class="about-features">
          <div class="about-feature-card">
            <div class="about-feature-icon">
              <span class="icon-chart"></span>
            </div>
            <div class="about-feature-text">
              <h3>Data-Driven</h3>
              <p>Scores are calculated using live data from Google Maps, travel metrics, and verified property benchmarks.</p>
            </div>
          </div>
          
          <div class="about-feature-card">
            <div class="about-feature-icon">
              <span class="icon-scale"></span>
            </div>
            <div class="about-feature-text">
              <h3>Objective Weights</h3>
              <p>Our algorithms use standardized weighting for safety, schools, and transit to ensure fair comparisons.</p>
            </div>
          </div>
          
          <div class="about-feature-card">
            <div class="about-feature-icon">
              <span class="icon-search"></span>
            </div>
            <div class="about-feature-text">
              <h3>Real Research</h3>
              <p>Ground-level insights and community trends are analyzed to ensure our digital rankings match reality.</p>
            </div>
          </div>
        </div>
        
        <div class="about-cta">
          <a href="#/methodology" class="btn-learn-more">
            <span>Explore Methodology</span>
            <span class="ui-arrow-right"></span>
          </a>
        </div>
      </div>
    </section>
  `;

  app.innerHTML = html;
}
