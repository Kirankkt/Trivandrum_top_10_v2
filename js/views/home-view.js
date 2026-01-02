// Home View - Landing page for Top 10 Trivandrum

async function renderHomeView() {
  const app = document.getElementById('app');

  const html = `
    <!-- Single Hero Section with Cards -->
    <section class="hero-with-cards">
      <div class="hero-bg-image"></div>
      <div class="hero-gradient-overlay"></div>

      <div class="hero-main-content">
        <!-- Branding -->
        <div class="hero-branding">
          <h1 class="hero-title">Top 10</h1>
          <span class="hero-subtitle">Trivandrum</span>
          <p class="hero-tagline">Discover the best experiences in Kerala's capital</p>
        </div>

        <!-- Category Cards Grid -->
        <div class="hero-cards-grid">

          <!-- Stay & Dine -->
          <div class="hero-card hero-card-featured">
            <div class="hero-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/stay_dine_premium.png') || 'images/categories/stay_dine_premium.png'}')"></div>
            <div class="hero-card-content">
              <span class="hero-card-label">Hospitality</span>
              <h3>Stay & Dine</h3>
              <div class="hero-card-links">
                <a href="#/restaurants">Restaurants</a>
                <a href="#/cafes">Cafes</a>
                <a href="#/hotels">Hotels</a>
              </div>
            </div>
          </div>

          <!-- Shopping -->
          <div class="hero-card">
            <div class="hero-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/shopping_hero.png') || 'images/categories/shopping_hero.png'}')"></div>
            <div class="hero-card-content">
              <span class="hero-card-label">Retail</span>
              <h3>Shopping</h3>
              <div class="hero-card-links">
                <a href="#/malls">Malls</a>
                <a href="#/boutiques">Boutiques</a>
                <a href="#/supermarkets">Supermarkets</a>
              </div>
            </div>
          </div>

          <!-- Culture -->
          <div class="hero-card">
            <div class="hero-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/culture_premium.png') || 'images/categories/culture_premium.png'}')"></div>
            <div class="hero-card-content">
              <span class="hero-card-label">Heritage</span>
              <h3>Culture</h3>
              <div class="hero-card-links">
                <a href="#/landmarks">Landmarks</a>
                <a href="#/museums">Museums</a>
                <a href="#/theatres">Theatres</a>
              </div>
            </div>
          </div>

          <!-- Nature -->
          <div class="hero-card">
            <div class="hero-card-bg" style="background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)"></div>
            <div class="hero-card-content">
              <span class="hero-card-label">Outdoors</span>
              <h3>Nature</h3>
              <div class="hero-card-links">
                <a href="#/beaches">Beaches</a>
                <a href="#/nature-sanctuaries">Wildlife</a>
                <a href="#/backwaters">Backwaters</a>
              </div>
            </div>
          </div>

          <!-- Sports -->
          <div class="hero-card">
            <div class="hero-card-bg" style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%)"></div>
            <div class="hero-card-content">
              <span class="hero-card-label">Active</span>
              <h3>Sports</h3>
              <div class="hero-card-links">
                <a href="#/sports-clubs">Sports Clubs</a>
                <a href="#/adventure-sports">Adventure</a>
              </div>
            </div>
          </div>

          <!-- Wellness -->
          <div class="hero-card">
            <div class="hero-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/healthcare_premium.png') || 'images/categories/healthcare_premium.png'}')"></div>
            <div class="hero-card-content">
              <span class="hero-card-label">Wellness</span>
              <h3>Health</h3>
              <div class="hero-card-links">
                <a href="#/healthcare">Healthcare</a>
                <a href="#/ayurveda">Ayurveda</a>
                <a href="#/yoga">Yoga</a>
              </div>
            </div>
          </div>

        </div>

        <!-- Bottom Stats & Link -->
        <div class="hero-bottom">
          <div class="hero-stats">
            <span><strong>400+</strong> Places</span>
            <span><strong>22</strong> Categories</span>
            <span><strong>100%</strong> Data-Driven</span>
          </div>
          <a href="#/about-rankings" class="hero-link">How We Rank →</a>
        </div>
      </div>
    </section>
  `;

  app.innerHTML = html;
}
