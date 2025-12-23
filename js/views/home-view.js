// Home View - Landing page for Trivandrum Top 10 App

async function renderHomeView() {
  const app = document.getElementById('app');

  // Load data for featured items
  const rankingsData = await loadRankings();
  const topLocalities = rankingsData?.all_rankings?.slice(0, 3) || [];

  // Locality image mapping (same as ranking-view)
  const localityImages = {
    'Statue': 'images/localities/locality_statue_1765515536425.png',
    'Pattom': 'images/localities/locality_pattom_1765515551840.png',
    'Kowdiar': 'images/localities/locality_kowdiar_1765515570335.png',
    'Enchakkal': 'images/localities/locality_enchakkal_1765515725097.png',
    'Jagathy': 'images/localities/locality_jagathy_1765515744821.png',
    'default': 'images/skyline.png'
  };

  function getLocalityImage(name) {
    return localityImages[name] || localityImages['default'];
  }

  const html = `
    <!-- Hero Section -->
    <section class="home-hero">
      <div class="home-hero-image">
        <img src="images/hero_main.png" alt="Thiruvananthapuram Cityscape" />
        <div class="home-hero-overlay"></div>
      </div>
      <div class="home-hero-content">
        <h1 class="home-hero-title">Trivandrum <span class="highlight">Top 10</span></h1>
        <p class="home-hero-tagline">Data-driven rankings for Kerala's capital city</p>
        <p class="home-hero-subtitle">Objective insights powered by Google Maps API, travel metrics, and real pricing data — zero bias, zero sponsored content</p>

        <div class="purpose-cards">
          <a href="#/localities" class="purpose-card">
            <span class="purpose-icon">🏘️</span>
            <span class="purpose-text">Find Your Neighborhood</span>
            <span class="purpose-desc">Compare 20+ localities by data</span>
          </a>
          <a href="#/restaurants" class="purpose-card">
            <span class="purpose-icon">🍽️</span>
            <span class="purpose-text">Discover Dining</span>
            <span class="purpose-desc">Top-rated restaurants & cafes</span>
          </a>
          <a href="#/map" class="purpose-card">
            <span class="purpose-icon">🗺️</span>
            <span class="purpose-text">Explore the City</span>
            <span class="purpose-desc">Interactive map explorer</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Explore Section -->
    <section class="explore-section">
      <h2 class="section-title">What Are You Looking For?</h2>
      <p class="section-subtitle">Browse our data-driven rankings across dining, living, and city amenities</p>

      <!-- Primary Categories -->
      <div class="explore-grid">
        <a href="#/localities" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/localities/locality_kowdiar_1765515570335.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Live</span>
            <h3>Localities</h3>
            <p>20+ neighborhoods ranked by accessibility, amenities, safety & more</p>
          </div>
        </a>
        <a href="#/restaurants" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/restaurant_card.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Eat</span>
            <h3>Restaurants</h3>
            <p>Curated dining from casual to fine dining</p>
          </div>
        </a>
        <a href="#/cafes" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/restaurant_card.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Eat</span>
            <h3>Cafes</h3>
            <p>Coffee culture & coworking-friendly spaces</p>
          </div>
        </a>
        <a href="#/hotels" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/hotel_card.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Stay</span>
            <h3>Hotels</h3>
            <p>Accommodations from budget to luxury</p>
          </div>
        </a>
        <a href="#/map" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/tech.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Explore</span>
            <h3>Interactive Map</h3>
            <p>Visualize all locations on one dynamic map</p>
          </div>
        </a>
      </div>

      <!-- More Categories -->
      <h3 class="explore-subsection-title">Additional Services</h3>
      <div class="explore-grid explore-grid-secondary">
        <a href="#/malls" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/skyline.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Shop</span>
            <h3>Shopping Malls</h3>
            <p>Major retail destinations</p>
          </div>
        </a>
        <a href="#/museums" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/palace.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Culture</span>
            <h3>Museums & Heritage</h3>
            <p>Cultural landmarks & attractions</p>
          </div>
        </a>
        <a href="#/healthcare" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/skyline.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Services</span>
            <h3>Healthcare</h3>
            <p>Hospitals & medical facilities</p>
          </div>
        </a>
      </div>
    </section>

    <!-- About Section -->
    <section class="about-section">
      <div class="about-content">
        <h2>Why Trivandrum Top 10?</h2>
        <p class="about-lead">
          The first 100% objective ranking platform for Thiruvananthapuram. We eliminate guesswork by analyzing
          real-world data from Google Maps APIs, travel patterns, property prices, and amenity distributions.
          Zero human bias, zero sponsored rankings — just transparent, data-driven insights.
        </p>

        <div class="about-features">
          <div class="about-feature">
            <span class="feature-icon">🎯</span>
            <div class="feature-text">
              <h3>100% API-Sourced Data</h3>
              <p>Travel times, amenity counts, ratings, and elevation data directly from Google</p>
            </div>
          </div>
          <div class="about-feature">
            <span class="feature-icon">⚖️</span>
            <div class="feature-text">
              <h3>Customizable Priorities</h3>
              <p>Adjust category weights to match what matters most to you</p>
            </div>
          </div>
          <div class="about-feature">
            <span class="feature-icon">🔍</span>
            <div class="feature-text">
              <h3>Transparent Methodology</h3>
              <p>See exactly how every score is calculated — no black boxes</p>
            </div>
          </div>
          <div class="about-feature">
            <span class="feature-icon">🚫</span>
            <div class="feature-text">
              <h3>No Sponsored Content</h3>
              <p>Rankings can't be bought. Pure algorithmic fairness.</p>
            </div>
          </div>
        </div>

        <div class="about-cta">
          <a href="#/methodology" class="btn-learn-more">View Our Methodology</a>
          <a href="#/customize" class="btn-secondary">Customize Rankings</a>
        </div>
      </div>
    </section>
  `;

  app.innerHTML = html;
}
