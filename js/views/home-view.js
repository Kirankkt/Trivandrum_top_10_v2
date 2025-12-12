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
        <img src="images/hero_main.png" alt="Trivandrum" />
        <div class="home-hero-overlay"></div>
      </div>
      <div class="home-hero-content">
        <h1 class="home-hero-title">Trivandrum <span class="highlight">Top 10</span></h1>
        <p class="home-hero-tagline">Discover the best of Kerala's capital — neighborhoods, dining, experiences & more</p>
        
        <div class="purpose-cards">
          <a href="#/localities" class="purpose-card">
            <span class="purpose-text">Looking to Relocate?</span>
          </a>
          <a href="#/restaurants" class="purpose-card">
            <span class="purpose-text">Hungry?</span>
          </a>
          <a href="#/experiences" class="purpose-card">
            <span class="purpose-text">Exploring the City?</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Explore Section -->
    <section class="explore-section">
      <h2 class="section-title">Explore by Category</h2>
      <div class="explore-grid">
        <a href="#/localities" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/localities/locality_kowdiar_1765515570335.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <h3>Localities</h3>
            <p>Find your perfect neighborhood</p>
          </div>
        </a>
        <a href="#/restaurants" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/restaurant_card.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <h3>Restaurants</h3>
            <p>Best dining experiences</p>
          </div>
        </a>
        <a href="#/cafes" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AZLasHppzWCQbZcQ1TN6p6T5HiDnZp7BBd1ZBK82eRSCMGUH5l-AJheR04UgXHIiOzPhHpesMtAFt2bIiYDMxuc99iMYghAnjFEoBd5PyHX6JZ8fGyEts17uI2XN9SQSotdyfF34cFefN25csXUkOLXKtE1zLJJtnbIjwWt-765426bG13JFIejN5oCmDYn2yC_jn2PasRG0iwpDZEEi5gXbdafbEwTjAO8SetoQLX2_Y6NkKVtp8ho-WmS2CoUuMymf1vH7PoZKFeLg8BPScubUn8LkyWjfHXmAIgggsOLXdGqDnw&key=AIzaSyCoD9cHQYn_EdCJOqNedXQjXQYlYtrVz3I')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <h3>Cafes</h3>
            <p>Coffee, tea & hangouts</p>
          </div>
        </a>
        <a href="#/hotels" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/hotel_card.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <h3>Hotels</h3>
            <p>Where to stay</p>
          </div>
        </a>
        <a href="#/experiences" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('images/categories/experiences_card.png')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <h3>Experiences</h3>
            <p>Things to do</p>
          </div>
        </a>
      </div>
    </section>

    <!-- About Section -->
    <section class="about-section">
      <div class="about-content">
        <h2>Why Trivandrum Top 10?</h2>
        <p>We use real data from Google Maps, travel times, and local pricing to rank neighborhoods and experiences — no guesswork, no sponsored listings.</p>
        <div class="about-features">
          <div class="about-feature">
            <span class="feature-icon">📊</span>
            <span>Data-Driven Rankings</span>
          </div>
          <div class="about-feature">
            <span class="feature-icon">⚖️</span>
            <span>Customize Your Priorities</span>
          </div>
          <div class="about-feature">
            <span class="feature-icon">🔍</span>
            <span>Transparent Methodology</span>
          </div>
        </div>
        <a href="#/methodology" class="btn-learn-more">Learn How We Rank</a>
      </div>
    </section>
  `;

  app.innerHTML = html;
}
