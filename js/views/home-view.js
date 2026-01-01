// Home View - Redesigned splash page for Top 10 Trivandrum

async function renderHomeView() {
  const app = document.getElementById('app');

  const html = `
    <!-- Hero Section - Minimal Splash -->
    <section class="hero-splash">
      <div class="hero-splash-bg">
        <div class="hero-glow hero-glow-1"></div>
        <div class="hero-glow hero-glow-2"></div>
      </div>

      <!-- Main Content -->
      <div class="hero-splash-content">
        <div class="brand-lockup">
          <h1 class="brand-top10">Top 10</h1>
          <span class="brand-city">Trivandrum</span>
        </div>

        <p class="hero-tagline">
          Discover the best experiences in Kerala's capital
        </p>

        <a href="#explore-categories" class="cta-explore" id="explore-btn">
          Explore
        </a>
      </div>

      <!-- Scroll Indicator -->
      <div class="scroll-indicator">
        <span class="scroll-icon">&darr;</span>
      </div>
    </section>

    <!-- Explore Section -->
    <section class="explore-section explore-dark" id="explore-categories">
      <h2 class="section-title">Explore Experiences</h2>
      <p class="section-subtitle">10 categories, hundreds of places, one objective scoring system</p>

      <!-- Premium Grid Layout -->
      <div class="explore-grid premium-grid">

        <!-- Stay & Dine (Grouped Hospitality) -->
        <div class="explore-card hero-card">
          <div class="explore-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/stay_dine_premium.png') || 'images/categories/stay_dine_premium.png'}')"></div>
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
          <div class="explore-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/shopping_hero.png') || 'images/categories/shopping_hero.png'}')"></div>
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
          <div class="explore-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/culture_premium.png') || 'images/categories/culture_premium.png'}')"></div>
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
          <div class="explore-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/healthcare_premium.png') || 'images/categories/healthcare_premium.png'}')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Wellness</span>
            <h3>Healthcare</h3>
            <p>Top-tier medical centers and specialized clinics.</p>
          </div>
        </a>

        <!-- Education -->
        <a href="#/education" class="explore-card">
          <div class="explore-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/education_brick.png') || 'images/categories/education_brick.png'}')"></div>
          <div class="explore-card-overlay"></div>
          <div class="explore-card-content">
            <span class="explore-card-label">Education</span>
            <h3>Education</h3>
            <p>Schools, colleges, and universities.</p>
          </div>
        </a>
      </div>

      <!-- About Rankings Link -->
      <div class="about-rankings-cta">
        <a href="#/about-rankings" class="cta-secondary">About Our Rankings</a>
      </div>
    </section>
  `;

  app.innerHTML = html;

  // Smooth scroll for Explore button
  const exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('explore-categories');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}
