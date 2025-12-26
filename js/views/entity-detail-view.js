// Entity Detail View - Unified detail pages for all entity types
// Handles: restaurants, cafes, hotels, malls, boutiques, specialty_shops,
// museums, religious_sites, healthcare, education, banking

/**
 * Category configurations for detail views
 */
const ENTITY_CATEGORIES = {
    restaurants: {
        title: 'Restaurant',
        icon: '',
        color: '#dc2626', // Red
        dataFile: 'data/restaurants.json',
        metrics: [
            { key: 'rating', label: 'Rating', format: 'rating' },
            { key: 'reviews', label: 'Reviews', format: 'number' },
            { key: 'price_level', label: 'Price', format: 'price' }
        ],
        rankContext: 'restaurant'
    },
    cafes: {
        title: 'Cafe',
        icon: '',
        color: '#7c3aed', // Purple
        dataFile: 'data/cafes.json',
        metrics: [
            { key: 'rating', label: 'Rating', format: 'rating' },
            { key: 'reviews', label: 'Reviews', format: 'number' },
            { key: 'price_level', label: 'Price', format: 'price' }
        ],
        rankContext: 'cafe'
    },
    hotels: {
        title: 'Hotel',
        icon: '',
        color: '#ea580c', // Orange
        dataFile: 'data/hotels.json',
        metrics: [
            { key: 'rating', label: 'Rating', format: 'rating' },
            { key: 'reviews', label: 'Reviews', format: 'number' },
            { key: 'price_level', label: 'Price', format: 'price' }
        ],
        rankContext: 'hotel'
    },
    malls: {
        title: 'Mall',
        icon: '',
        color: '#0891b2', // Cyan
        dataFile: 'data/malls.json',
        metrics: [
            { key: 'rating', label: 'Rating', format: 'rating' },
            { key: 'reviews', label: 'Reviews', format: 'number' }
        ],
        rankContext: 'mall'
    },
    boutiques: {
        title: 'Boutique',
        icon: '',
        color: '#ec4899', // Pink
        dataFile: 'data/boutiques.json',
        metrics: [
            { key: 'rating', label: 'Rating', format: 'rating' },
            { key: 'reviews', label: 'Reviews', format: 'number' }
        ],
        rankContext: 'boutique'
    },
    specialty_shops: {
        title: 'Specialty Shop',
        icon: '',
        color: '#f59e0b', // Amber
        dataFile: 'data/specialty_shops.json',
        metrics: [
            { key: 'rating', label: 'Rating', format: 'rating' },
            { key: 'reviews', label: 'Reviews', format: 'number' }
        ],
        rankContext: 'specialty shop'
    },
    museums: {
        title: 'Museum',
        icon: '',
        color: '#4f46e5', // Indigo
        dataFile: 'data/museums.json',
        metrics: [
            { key: 'rating', label: 'Rating', format: 'rating' },
            { key: 'reviews', label: 'Reviews', format: 'number' }
        ],
        rankContext: 'museum'
    },
    religious_sites: {
        title: 'Religious Site',
        icon: '',
        color: '#be185d', // Pink/Magenta
        dataFile: 'data/religious_sites.json',
        metrics: [
            { key: 'rating', label: 'Rating', format: 'rating' },
            { key: 'reviews', label: 'Reviews', format: 'number' }
        ],
        rankContext: 'religious site'
    },
    healthcare: {
        title: 'Healthcare',
        icon: '',
        color: '#059669', // Emerald green
        dataFile: 'data/healthcare.json',
        metrics: [
            { key: 'rating', label: 'Rating', format: 'rating' },
            { key: 'reviews', label: 'Reviews', format: 'number' }
        ],
        rankContext: 'healthcare facility'
    },
    education: {
        title: 'Education',
        icon: '',
        color: '#ca8a04', // Yellow/Gold
        dataFile: 'data/education.json',
        metrics: [
            { key: 'rating', label: 'Rating', format: 'rating' },
            { key: 'reviews', label: 'Reviews', format: 'number' }
        ],
        rankContext: 'educational institution'
    },
    banking: {
        title: 'Bank',
        icon: '',
        color: '#64748b', // Slate gray
        dataFile: 'data/banking.json',
        metrics: [
            { key: 'rating', label: 'Rating', format: 'rating' },
            { key: 'reviews', label: 'Reviews', format: 'number' }
        ],
        rankContext: 'bank'
    }
};

/**
 * Format metric values
 */
function formatMetricValue(value, format) {
    if (value === null || value === undefined) return 'N/A';

    switch (format) {
        case 'rating':
            return `${value.toFixed(1)} &#9733;`;
        case 'number':
            return value.toLocaleString();
        case 'price':
            return '$'.repeat(value || 2);
        default:
            return value;
    }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Find nearby entities from all categories
 */
async function findNearbyEntities(lat, lng, currentId, limit = 6) {
    const nearby = [];
    const categoriesToSearch = ['restaurants', 'cafes', 'hotels', 'malls', 'museums', 'healthcare'];

    for (const category of categoriesToSearch) {
        try {
            const response = await fetch(ENTITY_CATEGORIES[category].dataFile);
            if (response.ok) {
                const data = await response.json();
                data.forEach(item => {
                    if (item.id !== currentId && item.location) {
                        const distance = calculateDistance(lat, lng, item.location.lat, item.location.lng);
                        if (distance <= 3) { // Within 3km
                            nearby.push({
                                ...item,
                                category,
                                distance,
                                categoryConfig: ENTITY_CATEGORIES[category]
                            });
                        }
                    }
                });
            }
        } catch (e) {
            console.warn(`Could not load ${category} for nearby:`, e);
        }
    }

    // Sort by distance and return top N
    return nearby.sort((a, b) => a.distance - b.distance).slice(0, limit);
}

/**
 * Render entity detail view
 */
async function renderEntityDetailView(category, entityId) {
    const app = document.getElementById('app');
    const config = ENTITY_CATEGORIES[category];

    if (!config) {
        app.innerHTML = '<div class="error">Unknown category</div>';
        return;
    }

    app.innerHTML = '<div class="loading">Loading details...</div>';

    try {
        const response = await fetch(config.dataFile);
        if (!response.ok) throw new Error('Data not found');

        const data = await response.json();
        const entity = data.find(item => item.id === entityId);

        if (!entity) {
            app.innerHTML = '<div class="error">Entity not found</div>';
            return;
        }

        // Find rank
        const rank = data.findIndex(item => item.id === entityId) + 1;
        const totalInCategory = data.length;

        // Get nearby entities
        let nearbyHtml = '';
        if (entity.location) {
            const nearby = await findNearbyEntities(
                entity.location.lat,
                entity.location.lng,
                entity.id
            );

            if (nearby.length > 0) {
                nearbyHtml = `
                    <div class="entity-nearby-section">
                        <h3>Location & Surroundings</h3>
                        <div class="nearby-grid">
                            ${nearby.map(item => `
                                <a href="#/entity/${item.category}/${item.id}" class="nearby-card">
                                    <span class="nearby-icon">${item.categoryConfig.icon}</span>
                                    <div class="nearby-info">
                                        <span class="nearby-name">${item.name}</span>
                                        <span class="nearby-meta">${item.distance.toFixed(1)}km away • ${item.rating ? item.rating.toFixed(1) + ' &#9733;' : ''}</span>
                                    </div>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        }

        // Build vibes/tags HTML
        const vibesHtml = (entity.vibes || []).map(vibe =>
            `<span class="entity-vibe">${vibe}</span>`
        ).join('');

        // Build metrics HTML
        const metricsHtml = config.metrics.map(m => `
            <div class="entity-metric">
                <span class="metric-label">${m.label}</span>
                <span class="metric-value">${formatMetricValue(entity[m.key], m.format)}</span>
            </div>
        `).join('');

        // Rank context message
        const rankContext = rank <= 3
            ? `Top ${rank} ${config.rankContext} in Trivandrum!`
            : rank <= 10
                ? `Top 10 ${config.rankContext} in Trivandrum`
                : `Ranked #${rank} of ${totalInCategory} ${config.rankContext}s`;

        const html = `
            <div class="entity-detail-page">
                <!-- Back Navigation -->
                <div class="entity-back-nav">
                    <a href="#/${category === 'specialty_shops' ? 'specialty-shops' : category}" class="back-link">
                        <span class="ui-arrow-left"></span> Back to ${config.title}s
                    </a>
                </div>

                <!-- Hero Section -->
                <div class="entity-hero" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('${entity.image || 'images/skyline.png'}');">
                    <div class="entity-hero-content">
                        <div class="entity-rank-badge" style="background: ${config.color}">
                            #${rank}
                        </div>
                        <span class="entity-category-icon">${config.icon}</span>
                        <h1 class="entity-title">${entity.name}</h1>
                        <p class="entity-rank-context">${rankContext}</p>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="entity-content">
                    <!-- Key Info Card -->
                    <div class="entity-info-card">
                        <div class="entity-score-section">
                            <div class="entity-score" style="border-color: ${config.color}; color: ${config.color}">
                                <span class="score-number">${entity.score}</span>
                                <span class="score-label">Score</span>
                            </div>
                            <div class="entity-metrics">
                                ${metricsHtml}
                            </div>
                        </div>

                        ${vibesHtml ? `
                            <div class="entity-vibes">
                                ${vibesHtml}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Location Card -->
                    <div class="entity-location-card">
                        <h3>Location</h3>
                        <p class="entity-address">${entity.address}</p>
                        ${entity.locality ? `<p class="entity-locality">Area: <strong>${entity.locality}</strong></p>` : ''}

                        <!-- Mini Map -->
                        ${entity.location ? `
                            <div class="entity-mini-map" id="entity-mini-map"></div>
                        ` : ''}

                        <div class="entity-actions">
                            <a href="${entity.map_url || `https://www.google.com/maps/place/?q=place_id:${entity.id}`}"
                               target="_blank" class="entity-action-btn">
                                Open in Google Maps <span class="ui-arrow-right"></span>
                            </a>
                            ${entity.website ? `
                                <a href="${entity.website}" target="_blank" class="entity-action-btn secondary">
                                    Visit Website <span class="ui-arrow-right"></span>
                                </a>
                            ` : ''}
                            ${entity.phone ? `
                                <a href="tel:${entity.phone}" class="entity-action-btn secondary">
                                    Phone: ${entity.phone}
                                </a>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Nearby Places -->
                    ${nearbyHtml}

                    <!-- View on Explorer Map -->
                    <div class="entity-map-cta">
                        <a href="#/map?highlight=${entity.id}&category=${category}" class="map-explorer-link">
                            <span class="ui-arrow-right"></span> View on City Map Explorer
                        </a>
                    </div>
                </div>
            </div>
        `;

        app.innerHTML = html;
        window.scrollTo(0, 0);

        // Initialize mini map if location available
        if (entity.location && typeof L !== 'undefined') {
            setTimeout(() => {
                const miniMapEl = document.getElementById('entity-mini-map');
                if (miniMapEl) {
                    const miniMap = L.map('entity-mini-map', {
                        zoomControl: false,
                        dragging: false,
                        scrollWheelZoom: false
                    }).setView([entity.location.lat, entity.location.lng], 15);

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap'
                    }).addTo(miniMap);

                    L.marker([entity.location.lat, entity.location.lng], {
                        icon: L.divIcon({
                            className: 'entity-map-marker',
                            html: `<div style="background: ${config.color}; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${config.icon}</div>`,
                            iconSize: [36, 36],
                            iconAnchor: [18, 18]
                        })
                    }).addTo(miniMap);
                }
            }, 100);
        }

    } catch (error) {
        console.error('Error loading entity:', error);
        app.innerHTML = `<div class="error">Failed to load details. Please try again.</div>`;
    }
}

/**
 * Route handlers for each category
 */
function renderRestaurantDetail(id) { renderEntityDetailView('restaurants', id); }
function renderCafeDetail(id) { renderEntityDetailView('cafes', id); }
function renderHotelDetail(id) { renderEntityDetailView('hotels', id); }
function renderMallDetail(id) { renderEntityDetailView('malls', id); }
function renderBoutiqueDetail(id) { renderEntityDetailView('boutiques', id); }
function renderSpecialtyShopDetail(id) { renderEntityDetailView('specialty_shops', id); }
function renderMuseumDetail(id) { renderEntityDetailView('museums', id); }
function renderReligiousSiteDetail(id) { renderEntityDetailView('religious_sites', id); }
function renderHealthcareDetail(id) { renderEntityDetailView('healthcare', id); }
function renderEducationDetail(id) { renderEntityDetailView('education', id); }
function renderBankingDetail(id) { renderEntityDetailView('banking', id); }
