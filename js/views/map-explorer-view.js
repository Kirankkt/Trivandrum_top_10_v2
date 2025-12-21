// Enhanced Map Explorer - Locality-centric city map
// Shows localities with nearby facilities, proper navigation to detail pages

/**
 * Category configurations - distinct colors, no similar shades
 */
const MAP_CATEGORIES = {
    localities: {
        label: 'Localities',
        icon: '🏘️',
        color: '#2563eb', // Blue - distinct from others
        dataFile: null,
        detailRoute: '/locality/'
    },
    restaurants: {
        label: 'Restaurants',
        icon: '🍽️',
        color: '#dc2626', // Red
        dataFile: 'data/restaurants.json',
        detailRoute: '/entity/restaurants/'
    },
    cafes: {
        label: 'Cafes',
        icon: '☕',
        color: '#7c3aed', // Purple
        dataFile: 'data/cafes.json',
        detailRoute: '/entity/cafes/'
    },
    hotels: {
        label: 'Hotels',
        icon: '🏨',
        color: '#ea580c', // Orange
        dataFile: 'data/hotels.json',
        detailRoute: '/entity/hotels/'
    },
    malls: {
        label: 'Malls',
        icon: '🏬',
        color: '#0891b2', // Cyan
        dataFile: 'data/malls.json',
        detailRoute: '/entity/malls/'
    },
    museums: {
        label: 'Museums',
        icon: '🏛️',
        color: '#4f46e5', // Indigo
        dataFile: 'data/museums.json',
        detailRoute: '/entity/museums/'
    },
    religious_sites: {
        label: 'Religious Sites',
        icon: '🛕',
        color: '#be185d', // Pink
        dataFile: 'data/religious_sites.json',
        detailRoute: '/entity/religious_sites/'
    },
    healthcare: {
        label: 'Healthcare',
        icon: '🏥',
        color: '#059669', // Emerald (distinct green)
        dataFile: 'data/healthcare.json',
        detailRoute: '/entity/healthcare/'
    },
    education: {
        label: 'Education',
        icon: '🎓',
        color: '#ca8a04', // Yellow/Gold
        dataFile: 'data/education.json',
        detailRoute: '/entity/education/'
    },
    banking: {
        label: 'Banking',
        icon: '🏦',
        color: '#64748b', // Slate gray
        dataFile: 'data/banking.json',
        detailRoute: '/entity/banking/'
    },
    specialty_shops: {
        label: 'Specialty Shop',
        icon: '🛍️',
        color: '#f59e0b', // Amber
        dataFile: 'data/specialty_shops.json',
        detailRoute: '/entity/specialty_shops/'
    },
    boutiques: {
        label: 'Boutique',
        icon: '👗',
        color: '#ec4899', // Pink
        dataFile: 'data/boutiques.json',
        detailRoute: '/entity/boutiques/'
    }
};

// Global state
let mapInstance = null;
let categoryLayers = {};
let activeCategories = new Set(['localities']);
let allEntityData = {}; // Cache for entity data
let localityFacilities = {}; // Facilities near each locality
let globalMarkers = {}; // NEW: ID -> Marker mapping for all categories
let isDataLoading = false;

/**
 * Calculate distance between two coordinates (km)
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Create marker icon - clean, no rankings
 */
function createMarkerIcon(category, size = 'normal') {
    const config = MAP_CATEGORIES[category];
    const dimensions = size === 'large' ? 40 : size === 'small' ? 24 : 32;
    const fontSize = size === 'large' ? '18px' : size === 'small' ? '12px' : '15px';

    return L.divIcon({
        className: `map-marker-${category} map-marker-hoverable`,
        html: `<div class="marker-inner" style="
            background: ${config.color};
            color: white;
            width: ${dimensions}px;
            height: ${dimensions}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${fontSize};
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
        ">${config.icon}</div>`,
        iconSize: [dimensions, dimensions],
        iconAnchor: [dimensions / 2, dimensions / 2]
    });
}

/**
 * Navigate to entity detail page
 */
function navigateToEntity(category, entityId) {
    if (category === 'localities') {
        window.location.hash = `/locality/${encodeURIComponent(entityId)}`;
    } else {
        window.location.hash = `/entity/${category}/${encodeURIComponent(entityId)}`;
    }
}

/**
 * Create popup with clickable link
 */
function createEntityPopup(entity, category, rank = null) {
    const config = MAP_CATEGORIES[category];

    let ratingHtml = '';
    if (entity.rating) {
        ratingHtml = `<div style="font-size: 13px; margin: 4px 0;">${entity.rating.toFixed(1)} ⭐ ${entity.reviews ? `(${entity.reviews.toLocaleString()})` : ''}</div>`;
    }

    let scoreHtml = '';
    if (entity.overall_score) {
        scoreHtml = `<div style="font-size: 16px; color: ${config.color}; font-weight: bold;">${entity.overall_score.toFixed(1)}/10</div>`;
    } else if (entity.score) {
        scoreHtml = `<div style="font-size: 14px; color: ${config.color}; font-weight: bold;">Score: ${entity.score}</div>`;
    }

    const entityId = category === 'localities' ? entity.name : entity.id;

    return `
        <div style="text-align: center; min-width: 180px; padding: 12px 8px;">
            <div style="font-size: 24px; margin-bottom: 8px;">${config.icon}</div>
            <strong style="font-size: 15px; display: block; margin-bottom: 4px; color: #1e293b;">${entity.name}</strong>
            ${scoreHtml}
            ${ratingHtml}
            ${entity.locality && category !== 'localities' ? `<div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">📍 ${entity.locality}</div>` : ''}
            <button onclick="navigateToEntity('${category}', '${entityId.replace(/'/g, "\\'")}')"
                style="display: block; width: 100%; margin-top: 12px; padding: 10px 16px; background: ${config.color}; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                View Details →
            </button>
        </div>
    `;
}

/**
 * Create locality popup showing nearby facilities
 */
function createLocalityPopup(locality) {
    const facilities = localityFacilities[locality.name] || {};
    const config = MAP_CATEGORIES.localities;

    // Build facility summary
    let facilitiesHtml = '<div style="display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0; justify-content: center;">';
    const categoryOrder = ['restaurants', 'cafes', 'hotels', 'healthcare', 'education', 'malls', 'museums', 'religious_sites', 'banking'];

    for (const cat of categoryOrder) {
        const count = facilities[cat]?.length || 0;
        if (count > 0) {
            const catConfig = MAP_CATEGORIES[cat];
            facilitiesHtml += `<span style="background: ${catConfig.color}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px;" title="${count} ${catConfig.label}">${catConfig.icon} ${count}</span>`;
        }
    }
    facilitiesHtml += '</div>';

    return `
        <div style="text-align: center; min-width: 200px; padding: 8px;">
            <div style="font-size: 24px; margin-bottom: 4px;">🏘️</div>
            <strong style="font-size: 16px; display: block; margin-bottom: 6px; color: #1e293b;">${locality.name}</strong>
            ${locality.overall_score ? `<div style="font-size: 18px; color: ${config.color}; font-weight: bold; margin-bottom: 4px;">${locality.overall_score.toFixed(1)}/10</div>` : ''}
            <div style="font-size: 12px; color: #64748b; margin: 6px 0;">Nearby Facilities:</div>
            ${facilitiesHtml}
            <button onclick="navigateToEntity('localities', '${locality.name.replace(/'/g, "\\'")}')"
                style="display: block; width: 100%; margin-top: 12px; padding: 10px 16px; background: ${config.color}; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Explore Locality →
            </button>
        </div>
    `;
}

/**
 * Load all entity data and compute locality facilities
 */
async function loadAllData() {
    if (Object.keys(allEntityData).length > 1 && !isDataLoading) return; // Already loaded

    isDataLoading = true;
    globalMarkers = {}; // Clear global markers on reload
    console.log('[Debug] Loading all map data...');

    // Load localities first
    const rankingsData = await loadRankings();
    allEntityData.localities = rankingsData?.all_rankings || [];

    // Load all other categories in parallel for speed
    const loadPromises = Object.entries(MAP_CATEGORIES)
        .filter(([cat, config]) => cat !== 'localities' && config.dataFile)
        .map(async ([category, config]) => {
            try {
                const response = await fetch(config.dataFile);
                if (response.ok) {
                    allEntityData[category] = await response.json();
                }
            } catch (e) {
                console.warn(`Failed to load ${category}:`, e);
                allEntityData[category] = [];
            }
        });

    await Promise.all(loadPromises);
    computeLocalityFacilities();
    isDataLoading = false;
}

/**
 * Compute what facilities are near each locality (within 3km)
 */
function computeLocalityFacilities() {
    localityFacilities = {};

    for (const locality of allEntityData.localities || []) {
        const lat = locality.latitude || locality.data?.latitude;
        const lng = locality.longitude || locality.data?.longitude;
        if (!lat || !lng) continue;

        localityFacilities[locality.name] = {};

        for (const [category, entities] of Object.entries(allEntityData)) {
            if (category === 'localities') continue;

            const nearby = (entities || []).filter(entity => {
                const eLat = entity.location?.lat;
                const eLng = entity.location?.lng;
                if (!eLat || !eLng) return false;
                return haversineDistance(lat, lng, eLat, eLng) <= 3;
            });

            if (nearby.length > 0) {
                localityFacilities[locality.name][category] = nearby;
            }
        }
    }
}

/**
 * Add category markers to map
 */
async function addCategoryToMap(category) {
    if (categoryLayers[category]) {
        mapInstance.addLayer(categoryLayers[category]);
        return;
    }

    const data = allEntityData[category] || [];
    const markers = [];
    const config = MAP_CATEGORIES[category];

    data.forEach((entity) => {
        let lat, lng;

        if (category === 'localities') {
            lat = entity.latitude || entity.data?.latitude;
            lng = entity.longitude || entity.data?.longitude;
        } else {
            lat = entity.location?.lat;
            lng = entity.location?.lng;
        }

        if (lat && lng) {
            const entityId = category === 'localities' ? entity.name : entity.id;
            const marker = L.marker([lat, lng], {
                icon: createMarkerIcon(category),
                entityId: entityId // Store ID for precise matching
            });

            // Setup content for hover and click
            const content = category === 'localities' ? createLocalityPopup(entity) : createEntityPopup(entity, category);

            // Use Popups instead of Tooltips for hover - natively more robust for interaction
            marker.bindPopup(content, {
                maxWidth: 280,
                className: 'interactive-popup',
                closeButton: false,
                autoClose: false,
                closeOnClick: false,
                offset: [0, -5]
            });

            // Manual management of hover logic using Popups
            let closeTimer = null;
            const markerRef = marker;

            marker.on('mouseover', function () {
                clearTimeout(closeTimer);
                if (!this.isPopupOpen()) {
                    this.openPopup();
                }
            });

            marker.on('mouseout', function () {
                closeTimer = setTimeout(() => {
                    this.closePopup();
                }, 1000); // 1.0s grace period to reach the popup
            });

            // When tooltip opens, attach robust listeners to its container
            marker.on('tooltipopen', function (e) {
                const tooltipEl = e.tooltip._container;
                if (tooltipEl) {
                    // Modern Event Listeners for better reliability
                    tooltipEl.addEventListener('mouseenter', () => {
                        clearTimeout(closeTimer);
                    });

                    tooltipEl.addEventListener('mouseleave', () => {
                        closeTimer = setTimeout(() => {
                            markerRef.closePopup();
                        }, 1000);
                    });

                    // Ensure clicks within the popup don't cause issues
                    popupEl.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                    });
                }
            });

            // Fallback: Click also opens the content as a popup
            marker.bindPopup(content, { maxWidth: 280, className: 'interactive-popup' });


            markers.push(marker);
        }
    });

    // No clustering - all markers are individually accessible for hover
    categoryLayers[category] = L.featureGroup(markers);

    mapInstance.addLayer(categoryLayers[category]);

    // Populate global markers for instant access
    markers.forEach(m => {
        if (m.options.entityId) {
            globalMarkers[m.options.entityId] = m;
        }
    });
}

/**
 * Remove category from map
 */
function removeCategoryFromMap(category) {
    if (categoryLayers[category]) {
        mapInstance.removeLayer(categoryLayers[category]);
    }
}

/**
 * Toggle category
 */
async function toggleCategory(category, enabled) {
    if (enabled) {
        activeCategories.add(category);
        await addCategoryToMap(category);
    } else {
        activeCategories.delete(category);
        removeCategoryFromMap(category);
    }
    updateUI();
}

/**
 * Update UI elements
 */
function updateUI() {
    // Update toggle buttons
    document.querySelectorAll('.map-category-toggle').forEach(btn => {
        const cat = btn.dataset.category;
        btn.classList.toggle('active', activeCategories.has(cat));
    });

    // Update counter
    const counter = document.getElementById('active-layers-count');
    if (counter) counter.textContent = activeCategories.size;

    // Update legend
    const legendItems = document.getElementById('legend-items');
    if (legendItems) {
        let html = '';
        for (const cat of activeCategories) {
            const config = MAP_CATEGORIES[cat];
            html += `
                <div class="legend-item">
                    <span class="legend-marker" style="background: ${config.color}">${config.icon}</span>
                    <span class="legend-label">${config.label}</span>
                </div>
            `;
        }
        legendItems.innerHTML = html || '<div class="legend-empty">No layers active</div>';
    }
}

/**
 * Get mapped counts for each category
 */
function getCategoryCounts() {
    const counts = {};
    for (const [category, data] of Object.entries(allEntityData)) {
        if (category === 'localities') {
            counts[category] = (data || []).filter(e => e.latitude || e.data?.latitude).length;
        } else {
            counts[category] = (data || []).filter(e => e.location?.lat).length;
        }
    }
    return counts;
}

/**
 * Render the map explorer
 */
async function renderMapExplorerView() {
    const app = document.getElementById('app');

    app.innerHTML = '<div class="loading">Loading map data...</div>';

    try {
        // Load all data first
        await loadAllData();
        const counts = getCategoryCounts();

        app.innerHTML = `
        <div class="map-explorer-page">
            <div class="map-controls-sidebar">
                <div class="map-controls-header">
                    <h2>🗺️ City Explorer</h2>
                    <p class="map-controls-subtitle">Discover what's in each locality</p>
                </div>

                <div class="map-category-toggles">
                    <div class="category-section">
                        <h4>Localities</h4>
                        <button class="map-category-toggle active" data-category="localities" style="--toggle-color: ${MAP_CATEGORIES.localities.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.localities.icon}</span>
                            <span class="toggle-label">Localities</span>
                            <span class="toggle-count">${counts.localities || 0}</span>
                        </button>
                    </div>

                    <div class="category-section">
                        <h4>Dining & Stay</h4>
                        <button class="map-category-toggle" data-category="restaurants" style="--toggle-color: ${MAP_CATEGORIES.restaurants.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.restaurants.icon}</span>
                            <span class="toggle-label">Restaurants</span>
                            <span class="toggle-count">${counts.restaurants || 0}</span>
                        </button>
                        <button class="map-category-toggle" data-category="cafes" style="--toggle-color: ${MAP_CATEGORIES.cafes.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.cafes.icon}</span>
                            <span class="toggle-label">Cafes</span>
                            <span class="toggle-count">${counts.cafes || 0}</span>
                        </button>
                        <button class="map-category-toggle" data-category="hotels" style="--toggle-color: ${MAP_CATEGORIES.hotels.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.hotels.icon}</span>
                            <span class="toggle-label">Hotels</span>
                            <span class="toggle-count">${counts.hotels || 0}</span>
                        </button>
                    </div>

                    <div class="category-section">
                        <h4>Services</h4>
                        <button class="map-category-toggle" data-category="healthcare" style="--toggle-color: ${MAP_CATEGORIES.healthcare.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.healthcare.icon}</span>
                            <span class="toggle-label">Healthcare</span>
                            <span class="toggle-count">${counts.healthcare || 0}</span>
                        </button>
                        <button class="map-category-toggle" data-category="education" style="--toggle-color: ${MAP_CATEGORIES.education.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.education.icon}</span>
                            <span class="toggle-label">Education</span>
                            <span class="toggle-count">${counts.education || 0}</span>
                        </button>
                        <button class="map-category-toggle" data-category="banking" style="--toggle-color: ${MAP_CATEGORIES.banking.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.banking.icon}</span>
                            <span class="toggle-label">Banking</span>
                            <span class="toggle-count">${counts.banking || 0}</span>
                        </button>
                    </div>

                    <div class="category-section">
                        <h4>Shopping & Culture</h4>
                        <button class="map-category-toggle" data-category="malls" style="--toggle-color: ${MAP_CATEGORIES.malls.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.malls.icon}</span>
                            <span class="toggle-label">Malls</span>
                            <span class="toggle-count">${counts.malls || 0}</span>
                        </button>
                        <button class="map-category-toggle" data-category="boutiques" style="--toggle-color: ${MAP_CATEGORIES.boutiques.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.boutiques.icon}</span>
                            <span class="toggle-label">Boutiques</span>
                            <span class="toggle-count">${counts.boutiques || 0}</span>
                        </button>
                        <button class="map-category-toggle" data-category="specialty_shops" style="--toggle-color: ${MAP_CATEGORIES.specialty_shops.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.specialty_shops.icon}</span>
                            <span class="toggle-label">Specialty</span>
                            <span class="toggle-count">${counts.specialty_shops || 0}</span>
                        </button>
                        <button class="map-category-toggle" data-category="museums" style="--toggle-color: ${MAP_CATEGORIES.museums.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.museums.icon}</span>
                            <span class="toggle-label">Museums</span>
                            <span class="toggle-count">${counts.museums || 0}</span>
                        </button>
                        <button class="map-category-toggle" data-category="religious_sites" style="--toggle-color: ${MAP_CATEGORIES.religious_sites.color}">
                            <span class="toggle-icon">${MAP_CATEGORIES.religious_sites.icon}</span>
                            <span class="toggle-label">Religious Sites</span>
                            <span class="toggle-count">${counts.religious_sites || 0}</span>
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

            <div class="map-main-container">
                <div id="explorer-map"></div>
                <div class="map-legend" id="map-legend">
                    <h4>Legend</h4>
                    <div class="legend-items" id="legend-items"></div>
                </div>
            </div>
        </div>
    `;

        // Proper cleanup of previous map instance
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
        }

        // Initial layout
        categoryLayers = {};

        // Handle URL params for highlighting early to set initial state
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        const highlightId = urlParams.get('highlight');
        const highlightCategory = urlParams.get('category');

        if (highlightId && highlightCategory && highlightCategory !== 'localities') {
            // Focus ONLY on the highlighted category
            activeCategories = new Set([highlightCategory]);
            console.log(`[Debug] Focus highlight: ${highlightCategory}`);
        } else {
            activeCategories = new Set(['localities']);
        }

        // Initialize map
        mapInstance = L.map('explorer-map').setView([8.5241, 76.9366], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(mapInstance);

        // Load active categories
        for (const cat of activeCategories) {
            await addCategoryToMap(cat);
        }
        updateUI();

        // Fit to localities bounds
        if (categoryLayers.localities && typeof categoryLayers.localities.getBounds === 'function') {
            const bounds = categoryLayers.localities.getBounds();
            if (bounds.isValid()) {
                mapInstance.fitBounds(bounds.pad(0.1));
            }
        }

        // Event handlers
        document.querySelectorAll('.map-category-toggle').forEach(btn => {
            btn.addEventListener('click', async () => {
                const category = btn.dataset.category;
                await toggleCategory(category, !activeCategories.has(category));
            });
        });

        document.getElementById('show-all-btn').addEventListener('click', async () => {
            for (const category of Object.keys(MAP_CATEGORIES)) {
                if (!activeCategories.has(category)) {
                    await toggleCategory(category, true);
                }
            }
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            for (const category of [...activeCategories]) {
                toggleCategory(category, false);
            }
        });

        // Perform highlighting if parameters exist
        if (highlightId && highlightCategory) {
            console.log('[Debug] Highlighting entity:', highlightCategory, highlightId);

            // Ensure category is loaded
            if (!activeCategories.has(highlightCategory)) {
                await toggleCategory(highlightCategory, true);
            }

            // Wait specifically for rendering to settle
            setTimeout(() => {
                const layerGroup = categoryLayers[highlightCategory];
                const targetMarker = globalMarkers[highlightId];

                if (targetMarker && layerGroup) {
                    console.log('[Debug] Target marker found in cache:', highlightId);

                    // 1. Zoom and frame the layer
                    if (layerGroup.getBounds && layerGroup.getBounds().isValid()) {
                        mapInstance.fitBounds(layerGroup.getBounds().pad(0.1));
                    }

                    // 2. Reveal and open popup
                    if (layerGroup.zoomToShowLayer) {
                        layerGroup.zoomToShowLayer(targetMarker, () => {
                            targetMarker.openPopup();
                        });
                    } else {
                        mapInstance.setView(targetMarker.getLatLng(), 15);
                        setTimeout(() => targetMarker.openPopup(), 100);
                    }
                } else {
                    console.warn('[Debug] Target marker NOT found in cache:', highlightId);
                    // Fallback to text search if cache failed for some reason
                    if (layerGroup && layerGroup.eachLayer) {
                        layerGroup.eachLayer(marker => {
                            if (marker.options.entityId === highlightId) {
                                marker.openPopup();
                            }
                        });
                    }
                }
            }, 1000); // Increased timeout for stability
        }
    } catch (error) {
        console.error('Error rendering map explorer:', error);
        app.innerHTML = `
        <div class="error-container" style="text-align: center; padding: 3rem;">
            <h2>🗺️ Map failed to load</h2>
            <p>${error.message}</p>
            <button onclick="location.reload()" class="btn-primary" style="margin-top: 1rem; padding: 0.5rem 1.5rem; border-radius: 8px;">Try Again</button>
        </div>
    `;
    }
}

// Alias for router
function renderMapView() {
    renderMapExplorerView();
}
