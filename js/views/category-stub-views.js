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
            <span class="customized-indicator">Custom weights active</span>
            <button class="btn-restore-small" id="restore-default-btn">Reset</button>
        ` : '';

        // Map type to customize route (handle underscores to hyphens)
        const customizeRoute = type.replace(/_/g, '-');

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
                        <a href="#/customize/${customizeRoute}" class="btn-customize-inline">Customize</a>
                    </div>
                </div>

                <main class="dining-grid">
                    ${top10.map((item, index) => createCategoryItemCard(item, index + 1, config, type)).join('')}
                </main>

                ${remaining.length > 0 ? `
                    <div class="show-more-container">
                        <button class="btn-show-more" id="show-more-btn">Show More (${top10.length + 1}-${allItems.length}) ↓</button>
                    </div>

                    <div class="dining-grid hidden-spots" id="hidden-spots" style="display: none;">
                        ${remaining.map((item, index) => createCategoryItemCard(item, index + 11, config, type)).join('')}
                    </div>

                    <div class="show-less-container" id="show-less-container" style="display: none;">
                        <button class="btn-show-less" id="show-less-btn">Show Less ↑</button>
                    </div>
                ` : ''}
            </div>
        `;

        app.innerHTML = html;
        window.scrollTo(0, 0);

        // Note: Compare button clicks are handled globally by CompareManager

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
function createCategoryItemCard(item, rank, config, type) {
    const rating = item.rating ? item.rating.toFixed(1) : 'N/A';
    const stars = item.rating ? '&#9733;'.repeat(Math.round(item.rating)) : '';
    const reviews = item.reviews ? item.reviews.toLocaleString() : '0';

    // Vibe Badges (limit to 3)
    const vibeBadges = (item.vibes || []).slice(0, 3).map(vibe =>
        `<span class="vibe-badge">${vibe}</span>`
    ).join('');

    // Featured badge for top 3
    const featuredBadge = rank <= 3 ? `<span class="badge-rank-${rank}">${rank === 1 ? 'Top Pick' : rank === 2 ? 'Runner Up' : 'Notable'}</span>` : '';

    // Category-specific styling
    const accentColor = config.badgeColor || '#00aa6c';

    // Detail page link - use underscore format for route matching
    const routeType = type.replace(/-/g, '_');
    const detailUrl = `#/entity/${routeType}/${encodeURIComponent(item.id)}`;

    return `
        <a href="${detailUrl}" class="dining-card-link">
            <div class="dining-card ${rank <= 3 ? 'featured' : ''}">
                <div class="card-rank" style="background: ${accentColor}">#${rank}</div>
                ${featuredBadge}
                <div class="card-image-container">
                    <img src="${item.image || 'images/skyline.png'}" alt="${item.name}" class="card-image" loading="lazy" onerror="this.src='images/skyline.png'">
                    <div class="card-overlay">
                        ${item.price_level ? `<span class="card-price">${'$'.repeat(item.price_level)}</span>` : ''}
                    </div>
                    <button class="compare-add-btn" data-category="${type}" data-id="${item.id}" data-name="${item.name}" data-score="${item.score || 0}" title="Add to compare">+</button>
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

                    ${item.locality ? `<p class="card-locality">${item.locality}</p>` : ''}

                    <div class="vibe-tags">
                        ${vibeBadges}
                    </div>

                    <div class="card-footer">
                        <div class="score-pill" style="border-color: ${accentColor}; color: ${accentColor}">
                             Score: ${item.score}/100
                        </div>
                        <span class="btn-details">View Details <span class="ui-arrow-right"></span></span>
                    </div>
                </div>
            </div>
        </a>
    `;
}

// ========================================
// SHOP CATEGORY VIEWS
// ========================================

function renderMallsView() {
    renderCategoryView('malls', {
        title: "Top Malls",
        subtitle: "Best Shopping Destinations in Trivandrum",
        icon: "",
        filename: "data/malls.json",
        badgeColor: "#8b5cf6",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

function renderSpecialtyShopsView() {
    renderCategoryView('specialty_shops', {
        title: "Specialty Shops",
        subtitle: "Books, Electronics, Ayurveda & More",
        icon: "",
        filename: "data/specialty_shops.json",
        badgeColor: "#f59e0b",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

// ========================================
// CULTURE CATEGORY VIEWS
// ========================================

function renderMuseumsView() {
    renderCategoryView('museums', {
        title: "Museums & Galleries",
        subtitle: "Explore Trivandrum's Rich Heritage",
        icon: "",
        filename: "data/museums.json",
        badgeColor: "#0ea5e9",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

function renderReligiousSitesView() {
    renderCategoryView('religious_sites', {
        title: "Religious Sites",
        subtitle: "Temples, Churches & Mosques",
        icon: "",
        filename: "data/religious_sites.json",
        badgeColor: "#ef4444",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

// ========================================
// SERVICES CATEGORY VIEWS
// ========================================

function renderHealthcareView() {
    renderCategoryView('healthcare', {
        title: "Healthcare",
        subtitle: "Ranked by patient experience reviews, not clinical outcomes",
        icon: "",
        filename: "data/healthcare.json",
        badgeColor: "#10b981",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

// ========================================
// NEW SHOP CATEGORIES
// ========================================

function renderSupermarketsView() {
    renderCategoryView('supermarkets', {
        title: "Top Supermarkets",
        subtitle: "Best Grocery Stores & Hypermarkets",
        icon: "",
        filename: "data/supermarkets.json",
        badgeColor: "#22c55e",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

function renderClothingStoresView() {
    renderCategoryView('clothing_stores', {
        title: "Clothing Stores",
        subtitle: "Fashion Boutiques & Apparel Shops",
        icon: "",
        filename: "data/clothing_stores.json",
        badgeColor: "#f472b6",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

// ========================================
// NEW CULTURE CATEGORIES
// ========================================

function renderArtGalleriesView() {
    renderCategoryView('art_galleries', {
        title: "Art Galleries",
        subtitle: "Art Galleries & Exhibition Spaces",
        icon: "",
        filename: "data/art_galleries.json",
        badgeColor: "#a855f7",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

function renderCulturalCentersView() {
    renderCategoryView('cultural_centers', {
        title: "Cultural Centers",
        subtitle: "Arts, Crafts & Cultural Institutions",
        icon: "",
        filename: "data/cultural_centers.json",
        badgeColor: "#f97316",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

function renderTheatresView() {
    renderCategoryView('theatres', {
        title: "Theatres & Auditoriums",
        subtitle: "Performance Venues & Drama Centers",
        icon: "",
        filename: "data/music_drama_centers.json",
        badgeColor: "#dc2626",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

function renderLandmarksView() {
    renderCategoryView('landmarks', {
        title: "Landmarks",
        subtitle: "Palaces, Monuments & Historic Buildings",
        icon: "",
        filename: "data/landmarks.json",
        badgeColor: "#ca8a04",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

// ========================================
// NATURE CATEGORIES (NEW)
// ========================================

function renderBeachesView() {
    renderCategoryView('beaches', {
        title: "Beaches",
        subtitle: "Scenic Coastal Getaways",
        icon: "",
        filename: "data/beaches.json",
        badgeColor: "#0891b2",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

function renderNatureSanctuariesView() {
    renderCategoryView('nature_sanctuaries', {
        title: "Wildlife & Nature",
        subtitle: "Sanctuaries, Forests & Nature Reserves",
        icon: "",
        filename: "data/nature_sanctuaries.json",
        badgeColor: "#16a34a",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

function renderBackwatersView() {
    renderCategoryView('backwaters', {
        title: "Backwaters",
        subtitle: "Lakes, Lagoons & Boating Experiences",
        icon: "",
        filename: "data/backwaters.json",
        badgeColor: "#0284c7",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

// ========================================
// SPORTS CATEGORIES (NEW)
// ========================================

function renderSportsClubsView() {
    renderCategoryView('sports_clubs', {
        title: "Sports Clubs",
        subtitle: "Tennis, Badminton, Golf & More",
        icon: "",
        filename: "data/sports_clubs.json",
        badgeColor: "#059669",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

function renderTrainingAcademiesView() {
    renderCategoryView('training_academies', {
        title: "Training Academies",
        subtitle: "Sports Coaching & Skill Development",
        icon: "",
        filename: "data/training_academies.json",
        badgeColor: "#7c3aed",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

function renderAdventureSportsView() {
    renderCategoryView('adventure_sports', {
        title: "Adventure Sports",
        subtitle: "Kayaking, Water Sports & Outdoor Activities",
        icon: "",
        filename: "data/adventure_sports.json",
        badgeColor: "#ea580c",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

// ========================================
// WELLNESS CATEGORIES (NEW)
// ========================================

function renderAyurvedaView() {
    renderCategoryView('ayurveda', {
        title: "Ayurveda & Spa",
        subtitle: "Traditional Wellness & Rejuvenation Centers",
        icon: "",
        filename: "data/ayurveda_wellness.json",
        badgeColor: "#65a30d",
        metrics: ['rating', 'popularity', 'sentiment']
    });
}

function renderYogaView() {
    renderCategoryView('yoga', {
        title: "Yoga & Meditation",
        subtitle: "Ashrams, Yoga Centers & Spiritual Retreats",
        icon: "",
        filename: "data/yoga_meditation.json",
        badgeColor: "#8b5cf6",
        metrics: ['rating', 'popularity', 'sentiment']
    });
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
                    <span class="service-icon"></span>
                    <h3>Malls</h3>
                    <p>Shopping Centers & Mega Malls</p>
                </a>
                <a href="#/clothing-stores" class="service-category-card">
                    <span class="service-icon"></span>
                    <h3>Clothing Stores</h3>
                    <p>Fashion Boutiques & Apparel</p>
                </a>
                <a href="#/specialty-shops" class="service-category-card">
                    <span class="service-icon"></span>
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
                    <span class="service-icon"></span>
                    <h3>Museums</h3>
                    <p>Art Galleries & Historical Museums</p>
                </a>
                <a href="#/religious-sites" class="service-category-card">
                    <span class="service-icon"></span>
                    <h3>Religious Sites</h3>
                    <p>Temples, Churches & Mosques</p>
                </a>
            </div>
        </div>
    `;

    app.innerHTML = html;
    window.scrollTo(0, 0);
}
