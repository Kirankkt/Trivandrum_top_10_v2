// Category Views - Shop, Culture, and Services pages with real data

/**
 * Generic category view renderer
 * Reuses the dining-view pattern for consistency
 */
async function renderCategoryView(type, config) {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="loading">Finding best spots...</div>';

    try {
        const response = await fetch(config.filename);
        if (!response.ok) throw new Error("Data not found");
        let data = await response.json();

        // Check for custom weights and apply them
        const storageKey = `${type}Weights`;
        const savedWeights = JSON.parse(localStorage.getItem(storageKey));
        const isCustomized = savedWeights !== null;

        // Apply custom weights if present (similar to dining-view)
        if (isCustomized && config.metrics) {
            data = data.map(item => {
                const metrics = item.metrics || {};
                let customScore = 0;
                const totalWeight = Object.values(savedWeights).reduce((a, b) => a + b, 0) || 100;

                config.metrics.forEach(metricId => {
                    const weight = (savedWeights[metricId] || 0) / totalWeight;
                    const metricValue = metrics[metricId] || item[metricId] || 50;
                    customScore += metricValue * weight;
                });

                return { ...item, score: customScore };
            }).sort((a, b) => b.score - a.score);
        }

        const allItems = data;
        const top10 = allItems.slice(0, 10);
        const remaining = allItems.slice(10);

        // Customized ranking indicator
        const customizedIndicator = isCustomized ? `
            <span class="customized-indicator">⚖️ Custom weights active</span>
            <button class="btn-restore-small" id="restore-default-btn">Reset</button>
        ` : '';

        let html = `
            <div class="dining-hero" style="background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${config.heroImage || top10[0]?.image || "images/skyline.png"}') center/cover fixed;">
                <div class="hero-content">
                    <h1 style="color: white; text-shadow: 2px 2px 8px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.8); font-size: 3.5rem;">${config.title}</h1>
                    <p class="hero-subtitle" style="color: rgba(255,255,255,0.9); text-shadow: 1px 1px 4px rgba(0,0,0,0.9); font-size: 1.25rem; margin-top: 0.5rem;">${config.subtitle}</p>
                </div>
            </div>

            <div class="dining-container" id="category-section">
                <div class="section-header">
                    <div class="section-header-actions">
                        ${customizedIndicator}
                    </div>
                </div>

                <main class="dining-grid">
                    ${top10.map((item, index) => createCategoryItemCard(item, index + 1, config)).join('')}
                </main>

                ${remaining.length > 0 ? `
                    <div class="show-more-container">
                        <button class="btn-show-more" id="show-more-btn">Show More (${top10.length + 1}-${allItems.length}) ↓</button>
                    </div>

                    <div class="dining-grid hidden-spots" id="hidden-spots" style="display: none;">
                        ${remaining.map((item, index) => createCategoryItemCard(item, index + 11, config)).join('')}
                    </div>

                    <div class="show-less-container" id="show-less-container" style="display: none;">
                        <button class="btn-show-less" id="show-less-btn">Show Less ↑</button>
                    </div>
                ` : ''}
            </div>
        `;

        app.innerHTML = html;
        window.scrollTo(0, 0);

        // Event Listeners for Show More/Less
        setupShowMoreLess();

        // Restore default button
        const restoreBtn = document.getElementById('restore-default-btn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => {
                localStorage.removeItem(storageKey);
                renderCategoryView(type, config);
            });
        }

    } catch (error) {
        console.error(error);
        app.innerHTML = `<div class="error">Failed to load ${type}. Please try again later.</div>`;
    }
}

/**
 * Setup show more/less functionality
 */
function setupShowMoreLess() {
    const showMoreBtn = document.getElementById('show-more-btn');
    const showLessBtn = document.getElementById('show-less-btn');
    const hiddenSpots = document.getElementById('hidden-spots');
    const showLessContainer = document.getElementById('show-less-container');
    const showMoreContainer = showMoreBtn?.parentElement;

    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            hiddenSpots.style.display = 'grid';
            showMoreContainer.style.display = 'none';
            showLessContainer.style.display = 'flex';
            hiddenSpots.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    if (showLessBtn) {
        showLessBtn.addEventListener('click', () => {
            hiddenSpots.style.display = 'none';
            showMoreContainer.style.display = 'flex';
            showLessContainer.style.display = 'none';
            document.getElementById('category-section').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

/**
 * Generic card creator for category items
 */
function createCategoryItemCard(item, rank, config) {
    const rating = item.rating ? item.rating.toFixed(1) : 'N/A';
    const stars = item.rating ? '⭐'.repeat(Math.round(item.rating)) : '';
    const reviews = item.reviews ? item.reviews.toLocaleString() : '0';

    // Vibe Badges (limit to 3)
    const vibeBadges = (item.vibes || []).slice(0, 3).map(vibe =>
        `<span class="vibe-badge">${vibe}</span>`
    ).join('');

    // Featured badge for top 3
    const featuredBadge = rank <= 3 ? `<span class="featured-badge">${rank === 1 ? '🏆 Top Pick' : rank === 2 ? '🥈 Runner Up' : '🥉 Notable'}</span>` : '';

    // Category-specific styling
    const accentColor = config.badgeColor || '#00aa6c';

    return `
        <div class="dining-card ${rank <= 3 ? 'featured' : ''}">
            <div class="card-rank" style="background: ${accentColor}">#${rank}</div>
            ${featuredBadge}
            <div class="card-image-container">
                <img src="${item.image || 'images/skyline.png'}" alt="${item.name}" class="card-image" loading="lazy" onerror="this.src='images/skyline.png'">
                <div class="card-overlay">
                    ${item.price_level ? `<span class="card-price">${'$'.repeat(item.price_level)}</span>` : ''}
                </div>
            </div>

            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-title">${item.name}</h3>
                    <div class="card-rating">
                        <span class="rating-val">${rating}</span>
                        <span class="rating-stars">${stars}</span>
                        <span class="review-count">(${reviews} reviews)</span>
                    </div>
                </div>

                ${item.locality ? `<p class="card-locality">📍 ${item.locality}</p>` : ''}

                <div class="vibe-tags">
                    ${vibeBadges}
                </div>

                <div class="card-footer">
                    <div class="score-pill" style="border-color: ${accentColor}; color: ${accentColor}">
                         Score: ${item.score}/100
                    </div>
                    <a href="${item.map_url || `https://www.google.com/maps/place/?q=place_id:${item.id}`}" target="_blank" class="btn-map">View Map ↗</a>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// SHOP CATEGORY VIEWS
// ========================================

function renderMallsView() {
    renderCategoryView('malls', {
        title: "Top Malls",
        subtitle: "Best Shopping Destinations in Trivandrum",
        icon: "🏬",
        filename: "data/malls.json",
        badgeColor: "#8b5cf6",
        metrics: ['rating', 'popularity', 'sentiment', 'variety']
    });
}

function renderBoutiquesView() {
    renderCategoryView('boutiques', {
        title: "Top Boutiques",
        subtitle: "Fashion Boutiques & Designer Stores",
        icon: "👗",
        filename: "data/boutiques.json",
        badgeColor: "#ec4899",
        metrics: ['rating', 'popularity', 'sentiment', 'exclusivity']
    });
}

function renderSpecialtyShopsView() {
    renderCategoryView('specialty_shops', {
        title: "Specialty Shops",
        subtitle: "Books, Electronics, Ayurveda & More",
        icon: "🛍️",
        filename: "data/specialty_shops.json",
        badgeColor: "#f59e0b",
        metrics: ['rating', 'popularity', 'sentiment', 'specialty']
    });
}

// ========================================
// CULTURE CATEGORY VIEWS
// ========================================

function renderMuseumsView() {
    renderCategoryView('museums', {
        title: "Museums & Galleries",
        subtitle: "Explore Trivandrum's Rich Heritage",
        icon: "🏛️",
        filename: "data/museums.json",
        badgeColor: "#0ea5e9",
        metrics: ['rating', 'popularity', 'sentiment', 'educational_value']
    });
}

function renderReligiousSitesView() {
    renderCategoryView('religious_sites', {
        title: "Religious Sites",
        subtitle: "Temples, Churches & Mosques",
        icon: "🛕",
        filename: "data/religious_sites.json",
        badgeColor: "#ef4444",
        metrics: ['rating', 'popularity', 'sentiment', 'significance']
    });
}

// ========================================
// SERVICES CATEGORY VIEWS
// ========================================

function renderHealthcareView() {
    renderCategoryView('healthcare', {
        title: "Healthcare",
        subtitle: "Hospitals, Clinics & Medical Centers",
        icon: "🏥",
        filename: "data/healthcare.json",
        badgeColor: "#10b981",
        metrics: ['rating', 'popularity', 'sentiment', 'accessibility']
    });
}

function renderEducationView() {
    renderCategoryView('education', {
        title: "Education",
        subtitle: "Schools, Colleges & Universities",
        icon: "🎓",
        filename: "data/education.json",
        badgeColor: "#6366f1",
        metrics: ['rating', 'popularity', 'sentiment', 'reputation']
    });
}

function renderBankingView() {
    renderCategoryView('banking', {
        title: "Banking",
        subtitle: "Banks & Financial Services",
        icon: "🏦",
        filename: "data/banking.json",
        badgeColor: "#14b8a6",
        metrics: ['rating', 'popularity', 'sentiment', 'accessibility']
    });
}

// Combined Services view
function renderServicesView() {
    const app = document.getElementById('app');

    const html = `
        <div class="dining-hero" style="background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('images/skyline.png') center/cover fixed;">
            <div class="hero-content">
                <h1 style="color: white; text-shadow: 2px 2px 8px rgba(0,0,0,1); font-size: 3.5rem;">Services</h1>
                <p class="hero-subtitle" style="color: rgba(255,255,255,0.9); text-shadow: 1px 1px 4px rgba(0,0,0,0.9); font-size: 1.25rem; margin-top: 0.5rem;">Essential Services Across Trivandrum</p>
            </div>
        </div>

        <div class="dining-container">
            <div class="services-grid">
                <a href="#/healthcare" class="service-category-card">
                    <span class="service-icon">🏥</span>
                    <h3>Healthcare</h3>
                    <p>Hospitals, Clinics & Medical Centers</p>
                </a>
                <a href="#/education" class="service-category-card">
                    <span class="service-icon">🎓</span>
                    <h3>Education</h3>
                    <p>Schools, Colleges & Universities</p>
                </a>
                <a href="#/banking" class="service-category-card">
                    <span class="service-icon">🏦</span>
                    <h3>Banking</h3>
                    <p>Banks & Financial Services</p>
                </a>
            </div>
        </div>
    `;

    app.innerHTML = html;
    window.scrollTo(0, 0);
}

// ========================================
// SHOP CATEGORY LANDING PAGE
// ========================================

function renderShopCategoryView() {
    const app = document.getElementById('app');

    const html = `
        <div class="dining-hero" style="background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('images/skyline.png') center/cover fixed;">
            <div class="hero-content">
                <h1 style="color: white; text-shadow: 2px 2px 8px rgba(0,0,0,1); font-size: 3.5rem;">Shop</h1>
                <p class="hero-subtitle" style="color: rgba(255,255,255,0.9); text-shadow: 1px 1px 4px rgba(0,0,0,0.9); font-size: 1.25rem; margin-top: 0.5rem;">Shopping Destinations in Trivandrum</p>
            </div>
        </div>

        <div class="dining-container">
            <div class="services-grid">
                <a href="#/malls" class="service-category-card">
                    <span class="service-icon">🏬</span>
                    <h3>Malls</h3>
                    <p>Shopping Centers & Mega Malls</p>
                </a>
                <a href="#/boutiques" class="service-category-card">
                    <span class="service-icon">👗</span>
                    <h3>Boutiques</h3>
                    <p>Fashion & Designer Stores</p>
                </a>
                <a href="#/specialty-shops" class="service-category-card">
                    <span class="service-icon">🛍️</span>
                    <h3>Specialty Shops</h3>
                    <p>Books, Electronics, Ayurveda</p>
                </a>
            </div>
        </div>
    `;

    app.innerHTML = html;
    window.scrollTo(0, 0);
}

// ========================================
// CULTURE CATEGORY LANDING PAGE
// ========================================

function renderCultureCategoryView() {
    const app = document.getElementById('app');

    const html = `
        <div class="dining-hero" style="background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('images/skyline.png') center/cover fixed;">
            <div class="hero-content">
                <h1 style="color: white; text-shadow: 2px 2px 8px rgba(0,0,0,1); font-size: 3.5rem;">Culture</h1>
                <p class="hero-subtitle" style="color: rgba(255,255,255,0.9); text-shadow: 1px 1px 4px rgba(0,0,0,0.9); font-size: 1.25rem; margin-top: 0.5rem;">Heritage & Spiritual Landmarks</p>
            </div>
        </div>

        <div class="dining-container">
            <div class="services-grid">
                <a href="#/museums" class="service-category-card">
                    <span class="service-icon">🏛️</span>
                    <h3>Museums</h3>
                    <p>Art Galleries & Historical Museums</p>
                </a>
                <a href="#/religious-sites" class="service-category-card">
                    <span class="service-icon">🛕</span>
                    <h3>Religious Sites</h3>
                    <p>Temples, Churches & Mosques</p>
                </a>
            </div>
        </div>
    `;

    app.innerHTML = html;
    window.scrollTo(0, 0);
}
