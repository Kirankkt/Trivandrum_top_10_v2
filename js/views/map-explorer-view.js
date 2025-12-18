// Enhanced Map Explorer - City-wide map with all entity categories
// Allows category toggling, shows spatial clustering, links to detail views

/**
 * Category configurations for map markers
 */
const MAP_CATEGORIES = {
    localities: {
        label: 'Localities',
        icon: '🏘️',
        color: '#00aa6c',
        dataFile: null, // Loaded via loadRankings()
        detailRoute: '/locality/'
    },
    restaurants: {
        label: 'Restaurants',
        icon: '🍽️',
        color: '#ff6b6b',
        dataFile: 'data/restaurants.json',
        detailRoute: '/entity/restaurants/'
    },
    cafes: {
        label: 'Cafes',
        icon: '☕',
        color: '#4ecdc4',
        dataFile: 'data/cafes.json',
        detailRoute: '/entity/cafes/'
    },
    hotels: {
        label: 'Hotels',
        icon: '🏨',
        color: '#ffd93d',
        dataFile: 'data/hotels.json',
        detailRoute: '/entity/hotels/'
    },
    malls: {
        label: 'Malls',
        icon: '🏬',
        color: '#8b5cf6',
        dataFile: 'data/malls.json',
        detailRoute: '/entity/malls/'
    },
    museums: {
        label: 'Museums',
        icon: '🏛️',
        color: '#0ea5e9',
        dataFile: 'data/museums.json',
        detailRoute: '/entity/museums/'
    },
    religious_sites: {
        label: 'Religious Sites',
        icon: '🛕',
        color: '#ef4444',
        dataFile: 'data/religious_sites.json',
        detailRoute: '/entity/religious_sites/'
    },
    healthcare: {
        label: 'Healthcare',
        icon: '🏥',
        color: '#10b981',
        dataFile: 'data/healthcare.json',
        detailRoute: '/entity/healthcare/'
    },
    education: {
        label: 'Education',
        icon: '🎓',
        color: '#6366f1',
        dataFile: 'data/education.json',
        detailRoute: '/entity/education/'
    },
    banking: {
        label: 'Banking',
        icon: '🏦',
        color: '#14b8a6',
        dataFile: 'data/banking.json',
        detailRoute: '/entity/banking/'
    }
};

// Global state for map
let mapInstance = null;
let categoryLayers = {};
let activeCategories = new Set(['localities']);

/**
 * Create marker icon for category
 */
function createCategoryMarker(category, rank = null, highlighted = false) {
    const config = MAP_CATEGORIES[category];
    const size = highlighted ? 44 : (rank && rank <= 10 ? 32 : 28);
    const fontSize = highlighted ? '20px' : (rank && rank <= 10 ? '14px' : '12px');

    let content = config.icon;
    if (rank && category === 'localities') {
        content = `#${rank}`;
    }

    return L.divIcon({
        className: `map-marker-${category}`,
        html: `<div style="
            background: ${config.color};
            color: white;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${fontSize};
            font-weight: ${rank ? 'bold' : 'normal'};
            border: ${highlighted ? '4px' : '2px'} solid white;
            box-shadow: ${highlighted ? '0 4px 16px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.3)'};
            cursor: pointer;
            transition: transform 0.2s;
        ">${content}</div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
    });
}

/**
 * Create popup content for entity
 */
function createPopupContent(entity, category, rank = null) {
    const config = MAP_CATEGORIES[category];
    const rankText = rank ? `<span style="color: ${config.color}; font-weight: bold;">Rank #${rank}</span>` : '';

    const detailUrl = category === 'localities'
        ? `#/locality/${encodeURIComponent(entity.name)}`
        : `#/entity/${category}/${entity.id}`;

    let scoreDisplay = '';
    if (entity.overall_score) {
        scoreDisplay = `<div style="font-size: 20px; color: ${config.color}; font-weight: bold;">${entity.overall_score.toFixed(1)}/10</div>`;
    } else if (entity.score) {
        scoreDisplay = `<div style="font-size: 18px; color: ${config.color}; font-weight: bold;">Score: ${entity.score}</div>`;
    }

    let ratingDisplay = '';
    if (entity.rating) {
        ratingDisplay = `<div style="font-size: 14px; margin: 4px 0;">${entity.rating.toFixed(1)} ⭐ (${entity.reviews?.toLocaleString() || 0} reviews)</div>`;
    }

    return `
        <div style="text-align: center; min-width: 180px; padding: 8px;">
            <div style="font-size: 24px; margin-bottom: 4px;">${config.icon}</div>
            <strong style="font-size: 15px; display: block; margin-bottom: 4px;">${entity.name}</strong>
            ${rankText}
            ${scoreDisplay}
            ${ratingDisplay}
            ${entity.locality ? `<div style="font-size: 12px; color: #666; margin: 4px 0;">📍 ${entity.locality}</div>` : ''}
            <a href="${detailUrl}"
               style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: ${config.color}; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500;">
                View Details →
            </a>
        </div>
    `;
}

/**
 * Load entities for a category
 */
async function loadCategoryData(category) {
    const config = MAP_CATEGORIES[category];

    if (category === 'localities') {
        const rankingsData = await loadRankings();
        return rankingsData?.all_rankings || [];
    }

    try {
        const response = await fetch(config.dataFile);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn(`Failed to load ${category}:`, e);
    }
    return [];
}

/**
 * Add markers for a category to the map
 */
async function addCategoryToMap(category) {
    if (categoryLayers[category]) {
        mapInstance.addLayer(categoryLayers[category]);
        return;
    }

    const data = await loadCategoryData(category);
    const markers = [];

    data.forEach((entity, index) => {
        let lat, lng;

        if (category === 'localities') {
            lat = entity.latitude || entity.data?.latitude;
            lng = entity.longitude || entity.data?.longitude;
        } else {
            lat = entity.location?.lat;
            lng = entity.location?.lng;
        }

        if (lat && lng) {
            const rank = index + 1;
            const marker = L.marker([lat, lng], {
                icon: createCategoryMarker(category, category === 'localities' ? rank : null)
            });

            marker.bindPopup(createPopupContent(entity, category, rank));

            // Hover effect
            marker.on('mouseover', function() {
                this.setIcon(createCategoryMarker(category, category === 'localities' ? rank : null, true));
            });
            marker.on('mouseout', function() {
                this.setIcon(createCategoryMarker(category, category === 'localities' ? rank : null, false));
            });

            markers.push(marker);
        }
    });

    categoryLayers[category] = L.layerGroup(markers);
    mapInstance.addLayer(categoryLayers[category]);
}

/**
 * Remove category markers from map
 */
function removeCategoryFromMap(category) {
    if (categoryLayers[category]) {
        mapInstance.removeLayer(categoryLayers[category]);
    }
}

/**
 * Toggle category visibility
 */
async function toggleCategory(category, enabled) {
    if (enabled) {
        activeCategories.add(category);
        await addCategoryToMap(category);
    } else {
        activeCategories.delete(category);
        removeCategoryFromMap(category);
    }
    updateCategoryButtonStates();
}

/**
 * Update button active states
 */
function updateCategoryButtonStates() {
    document.querySelectorAll('.map-category-toggle').forEach(btn => {
        const category = btn.dataset.category;
        if (activeCategories.has(category)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update counter
    const counter = document.getElementById('active-layers-count');
    if (counter) {
        counter.textContent = activeCategories.size;
    }
}

/**
 * Get category stats for legend
 */
async function getCategoryStats() {
    const stats = {};

    for (const [category, config] of Object.entries(MAP_CATEGORIES)) {
        const data = await loadCategoryData(category);
        const withLocation = data.filter(e => {
            if (category === 'localities') {
                return e.latitude || e.data?.latitude;
            }
            return e.location;
        });
        stats[category] = {
            total: data.length,
            mapped: withLocation.length,
            label: config.label,
            icon: config.icon,
            color: config.color
        };
    }

    return stats;
}

/**
 * Render enhanced map explorer
 */
async function renderMapExplorerView() {
    const app = document.getElementById('app');

    // Parse URL params for highlighting
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const highlightId = urlParams.get('highlight');
    const highlightCategory = urlParams.get('category');

    app.innerHTML = `
        <div class="map-explorer-page">
            <!-- Map Controls Sidebar -->
            <div class="map-controls-sidebar">
                <div class="map-controls-header">
                    <h2>🗺️ City Explorer</h2>
                    <p class="map-controls-subtitle">Toggle categories to explore Trivandrum</p>
                </div>

                <div class="map-category-toggles">
                    <div class="category-section">
                        <h4>Places to Live</h4>
                        <button class="map-category-toggle active" data-category="localities" style="--toggle-color: ${MAP_CATEGORIES.localities.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.localities.icon}</span>
                            <span class="toggle-label">Localities</span>
                            <span class="toggle-count" id="count-localities">-</span>
                        </button>
                    </div>

                    <div class="category-section">
                        <h4>Eat & Stay</h4>
                        <button class="map-category-toggle" data-category="restaurants" style="--toggle-color: ${MAP_CATEGORIES.restaurants.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.restaurants.icon}</span>
                            <span class="toggle-label">Restaurants</span>
                            <span class="toggle-count" id="count-restaurants">-</span>
                        </button>
                        <button class="map-category-toggle" data-category="cafes" style="--toggle-color: ${MAP_CATEGORIES.cafes.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.cafes.icon}</span>
                            <span class="toggle-label">Cafes</span>
                            <span class="toggle-count" id="count-cafes">-</span>
                        </button>
                        <button class="map-category-toggle" data-category="hotels" style="--toggle-color: ${MAP_CATEGORIES.hotels.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.hotels.icon}</span>
                            <span class="toggle-label">Hotels</span>
                            <span class="toggle-count" id="count-hotels">-</span>
                        </button>
                    </div>

                    <div class="category-section">
                        <h4>Shop</h4>
                        <button class="map-category-toggle" data-category="malls" style="--toggle-color: ${MAP_CATEGORIES.malls.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.malls.icon}</span>
                            <span class="toggle-label">Malls</span>
                            <span class="toggle-count" id="count-malls">-</span>
                        </button>
                    </div>

                    <div class="category-section">
                        <h4>Culture</h4>
                        <button class="map-category-toggle" data-category="museums" style="--toggle-color: ${MAP_CATEGORIES.museums.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.museums.icon}</span>
                            <span class="toggle-label">Museums</span>
                            <span class="toggle-count" id="count-museums">-</span>
                        </button>
                        <button class="map-category-toggle" data-category="religious_sites" style="--toggle-color: ${MAP_CATEGORIES.religious_sites.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.religious_sites.icon}</span>
                            <span class="toggle-label">Religious Sites</span>
                            <span class="toggle-count" id="count-religious_sites">-</span>
                        </button>
                    </div>

                    <div class="category-section">
                        <h4>Services</h4>
                        <button class="map-category-toggle" data-category="healthcare" style="--toggle-color: ${MAP_CATEGORIES.healthcare.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.healthcare.icon}</span>
                            <span class="toggle-label">Healthcare</span>
                            <span class="toggle-count" id="count-healthcare">-</span>
                        </button>
                        <button class="map-category-toggle" data-category="education" style="--toggle-color: ${MAP_CATEGORIES.education.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.education.icon}</span>
                            <span class="toggle-label">Education</span>
                            <span class="toggle-count" id="count-education">-</span>
                        </button>
                        <button class="map-category-toggle" data-category="banking" style="--toggle-color: ${MAP_CATEGORIES.banking.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.banking.icon}</span>
                            <span class="toggle-label">Banking</span>
                            <span class="toggle-count" id="count-banking">-</span>
                        </button>
                    </div>
                </div>

                <div class="map-controls-footer">
                    <div class="active-layers-info">
                        <span id="active-layers-count">1</span> layer(s) active
                    </div>
                    <button class="btn-show-all-layers" id="show-all-btn">Show All</button>
                    <button class="btn-clear-layers" id="clear-btn">Clear All</button>
                </div>
            </div>

            <!-- Map Container -->
            <div class="map-main-container">
                <div id="explorer-map"></div>

                <!-- Map Legend -->
                <div class="map-legend" id="map-legend">
                    <h4>Legend</h4>
                    <div class="legend-items" id="legend-items"></div>
                </div>
            </div>
        </div>
    `;

    // Initialize Leaflet map
    mapInstance = L.map('explorer-map').setView([8.5241, 76.9366], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(mapInstance);

    // Reset state
    categoryLayers = {};
    activeCategories = new Set(['localities']);

    // Load initial category (localities)
    await addCategoryToMap('localities');

    // Load category stats and update counts
    const stats = await getCategoryStats();
    for (const [category, stat] of Object.entries(stats)) {
        const countEl = document.getElementById(`count-${category}`);
        if (countEl) {
            countEl.textContent = stat.mapped;
        }
    }

    // Update legend
    updateLegend();

    // Attach toggle handlers
    document.querySelectorAll('.map-category-toggle').forEach(btn => {
        btn.addEventListener('click', async () => {
            const category = btn.dataset.category;
            const isActive = activeCategories.has(category);
            await toggleCategory(category, !isActive);
            updateLegend();
        });
    });

    // Show all button
    document.getElementById('show-all-btn').addEventListener('click', async () => {
        for (const category of Object.keys(MAP_CATEGORIES)) {
            if (!activeCategories.has(category)) {
                await toggleCategory(category, true);
            }
        }
        updateLegend();
    });

    // Clear all button
    document.getElementById('clear-btn').addEventListener('click', () => {
        for (const category of [...activeCategories]) {
            toggleCategory(category, false);
        }
        updateLegend();
    });

    // Highlight specific entity if provided in URL
    if (highlightId && highlightCategory) {
        await toggleCategory(highlightCategory, true);
        // Find and highlight the marker
        setTimeout(() => {
            const layer = categoryLayers[highlightCategory];
            if (layer) {
                layer.eachLayer(marker => {
                    const popup = marker.getPopup();
                    if (popup && popup.getContent().includes(highlightId)) {
                        mapInstance.setView(marker.getLatLng(), 15);
                        marker.openPopup();
                    }
                });
            }
        }, 500);
    }

    // Fit bounds to localities
    if (categoryLayers.localities) {
        const bounds = categoryLayers.localities.getBounds();
        if (bounds.isValid()) {
            mapInstance.fitBounds(bounds.pad(0.1));
        }
    }
}

/**
 * Update the map legend based on active categories
 */
function updateLegend() {
    const legendItems = document.getElementById('legend-items');
    if (!legendItems) return;

    let html = '';
    for (const category of activeCategories) {
        const config = MAP_CATEGORIES[category];
        html += `
            <div class="legend-item">
                <span class="legend-marker" style="background: ${config.color}">${config.icon}</span>
                <span class="legend-label">${config.label}</span>
            </div>
        `;
    }

    legendItems.innerHTML = html || '<div class="legend-empty">No layers active</div>';
}

// Override the old renderMapView with the new explorer
function renderMapView() {
    renderMapExplorerView();
}
