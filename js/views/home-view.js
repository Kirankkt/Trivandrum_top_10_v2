// Home View - Vibrant landing page for Top 10 Trivandrum

async function renderHomeView() {
  const app = document.getElementById('app');

  const html = `
    <!-- Hero Section with Background Image -->
    <section class="hero-vibrant">
      <div class="hero-bg-image"></div>
      <div class="hero-gradient-overlay"></div>


      <!-- Main Content -->
      <div class="hero-vibrant-content">
        <div class="brand-lockup-vibrant">
          <h1 class="brand-top10-large">Top 10</h1>
          <span class="brand-city-large">Trivandrum</span>
        </div>

        <p class="hero-tagline-vibrant">
          Discover the best experiences in Kerala's capital
        </p>

        <a href="#explore-categories" class="cta-explore-vibrant" id="explore-btn">
          <span>Explore Now</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
          </svg>
        </a>
      </div>

      <!-- Scroll Indicator -->
      <div class="scroll-indicator-vibrant">
        <div class="scroll-mouse">
          <div class="scroll-wheel"></div>
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>

    <!-- Floating Cards Section -->
    <section class="explore-section-vibrant" id="explore-categories">
      <div class="section-header-vibrant">
        <h2 class="section-title-vibrant">Explore Experiences</h2>
        <p class="section-subtitle-vibrant">Six categories, hundreds of places, one objective scoring system</p>
      </div>

      <!-- Floating Cards Grid -->
      <div class="floating-cards-grid">

        <!-- Stay & Dine - Large Card -->
        <div class="floating-card floating-card-large" data-category="hospitality">
          <div class="floating-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/stay_dine_premium.png') || 'images/categories/stay_dine_premium.png'}')"></div>
          <div class="floating-card-shine"></div>
          <div class="floating-card-content">
            <span class="floating-card-label">Hospitality</span>
            <h3>Stay & Dine</h3>
            <p>Experience the best hotels, cozy cafes, and world-class restaurants.</p>
            <div class="floating-card-links">
              <a href="#/restaurants" class="card-pill">Restaurants</a>
              <a href="#/cafes" class="card-pill">Cafes</a>
              <a href="#/hotels" class="card-pill">Hotels</a>
            </div>
          </div>
        </div>

        <!-- Shopping -->
        <div class="floating-card" data-category="shopping">
          <div class="floating-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/shopping_hero.png') || 'images/categories/shopping_hero.png'}')"></div>
          <div class="floating-card-shine"></div>
          <div class="floating-card-content">
            <span class="floating-card-label">Retail</span>
            <h3>Shopping</h3>
            <p>Malls, boutiques and supermarkets.</p>
            <div class="floating-card-links">
              <a href="#/malls" class="card-pill">Malls</a>
              <a href="#/boutiques" class="card-pill">Boutiques</a>
              <a href="#/supermarkets" class="card-pill">Supermarkets</a>
            </div>
          </div>
        </div>

        <!-- Culture & Heritage -->
        <div class="floating-card" data-category="culture">
          <div class="floating-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/culture_premium.png') || 'images/categories/culture_premium.png'}')"></div>
          <div class="floating-card-shine"></div>
          <div class="floating-card-content">
            <span class="floating-card-label">Heritage</span>
            <h3>Culture</h3>
            <p>Museums, galleries and historic landmarks.</p>
            <div class="floating-card-links">
              <a href="#/landmarks" class="card-pill">Landmarks</a>
              <a href="#/museums" class="card-pill">Museums</a>
              <a href="#/theatres" class="card-pill">Theatres</a>
            </div>
          </div>
        </div>

        <!-- Nature -->
        <div class="floating-card" data-category="nature">
          <div class="floating-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/nature.png') || 'images/categories/nature.png'}')"></div>
          <div class="floating-card-shine"></div>
          <div class="floating-card-content">
            <span class="floating-card-label">Outdoors</span>
            <h3>Nature</h3>
            <p>Beaches, sanctuaries and backwaters.</p>
            <div class="floating-card-links">
              <a href="#/beaches" class="card-pill">Beaches</a>
              <a href="#/nature-sanctuaries" class="card-pill">Wildlife</a>
              <a href="#/backwaters" class="card-pill">Backwaters</a>
            </div>
          </div>
        </div>

        <!-- Sports & Adventure -->
        <div class="floating-card" data-category="sports">
          <div class="floating-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/sports.png') || 'images/categories/sports.png'}')"></div>
          <div class="floating-card-shine"></div>
          <div class="floating-card-content">
            <span class="floating-card-label">Active</span>
            <h3>Sports</h3>
            <p>Sports clubs and adventure activities.</p>
            <div class="floating-card-links">
              <a href="#/sports-clubs" class="card-pill">Sports Clubs</a>
              <a href="#/adventure-sports" class="card-pill">Adventure</a>
            </div>
          </div>
        </div>

        <!-- Wellness -->
        <div class="floating-card" data-category="wellness">
          <div class="floating-card-bg" style="background-image: url('${window.ImageOptimizer?.getOptimizedUrl('images/categories/healthcare_premium.png') || 'images/categories/healthcare_premium.png'}')"></div>
          <div class="floating-card-shine"></div>
          <div class="floating-card-content">
            <span class="floating-card-label">Wellness</span>
            <h3>Health & Wellness</h3>
            <p>Healthcare, ayurveda and yoga retreats.</p>
            <div class="floating-card-links">
              <a href="#/healthcare" class="card-pill">Healthcare</a>
              <a href="#/ayurveda" class="card-pill">Ayurveda</a>
              <a href="#/yoga" class="card-pill">Yoga</a>
            </div>
          </div>
        </div>

      </div>

      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-number">400+</span>
          <span class="stat-label">Places Ranked</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">22</span>
          <span class="stat-label">Categories</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">100%</span>
          <span class="stat-label">Data-Driven</span>
        </div>
      </div>

      <!-- About Rankings Link -->
      <div class="about-rankings-cta-vibrant">
        <a href="#/about-rankings" class="cta-secondary-vibrant">
          <span>How We Rank</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
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

  // Add floating animation on scroll
  const cards = document.querySelectorAll('.floating-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('float-in');
        }, index * 100);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => observer.observe(card));
}
