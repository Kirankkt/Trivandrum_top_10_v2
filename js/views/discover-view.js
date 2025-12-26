// Discover View - Show all premium spots for a locality organized by category

// Helper function to get category icon
function getCategoryIcon(category) {
    return ''; // Icons removed for professional look
}

// Helper function to get category color
function getCategoryColor(category) {
    const colors = {
        'heritage': '#8B4513',
        'dining': '#d35400',
        'shopping': '#9b59b6',
        'recreation': '#27ae60',
        'essential': '#3498db'
    };
    return colors[category] || '#666';
}

async function renderDiscoverView(localityName) {
    console.log('[Discover] Rendering for:', localityName);
    const app = document.getElementById('app');

    try {
        // Load premium spots data
        const spotsResponse = await fetch('data/premium_spots.json');
        if (!spotsResponse.ok) {
            app.innerHTML = '<div class="error">Could not load places data.</div>';
            return;
        }

        const allSpots = await spotsResponse.json();
        const localityData = allSpots.find(s => s.locality === localityName);

        if (!localityData || !localityData.spots || localityData.spots.length === 0) {
            app.innerHTML = `
                <div class="discover-page">
                    <a href="#/locality/${encodeURIComponent(localityName)}" class="back-button"><span class="ui-arrow-left"></span> Back to ${localityName}</a>
                    <div class="discover-empty">
                        <h2>No places found for ${localityName}</h2>
                        <p>We haven't collected place data for this locality yet.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Group spots by category
        const categories = {};
        localityData.spots.forEach(spot => {
            if (!categories[spot.category]) {
                categories[spot.category] = [];
            }
            categories[spot.category].push(spot);
        });

        // Load locality photo for hero
        let heroPhoto = '';
        try {
            const photosResponse = await fetch('data/locality_photos.json');
            if (photosResponse.ok) {
                const photos = await photosResponse.json();
                if (photos[localityName] && photos[localityName].photo_url) {
                    heroPhoto = photos[localityName].photo_url;
                }
            }
        } catch (e) {
            console.warn('[Discover] Could not load locality photo');
        }

        const heroStyle = heroPhoto
            ? `background-image: url('${heroPhoto}')`
            : 'background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-gold) 100%)';

        let html = `
            <div class="discover-page">
                <div class="discover-hero" style="${heroStyle}">
                    <div class="discover-hero-overlay"></div>
                    <div class="discover-hero-content">
                        <a href="#/locality/${encodeURIComponent(localityName)}" class="back-button-light"><span class="ui-arrow-left"></span> Back to ${localityName}</a>
                        <h1>Discover ${localityName}</h1>
                        <p>${localityData.spots.length} places across ${Object.keys(categories).length} categories</p>
                    </div>
                </div>
                
                <div class="discover-content">
                    <!-- Category Filter Tabs -->
                    <div class="card-icon"></div>
                    <div class="discover-tabs">
                        <button class="discover-tab active" data-category="all">All (${localityData.spots.length})</button>
                        ${Object.entries(categories).map(([cat, spots]) =>
            `<button class="discover-tab" data-category="${cat}">${getCategoryIcon(cat)} ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${spots.length})</button>`
        ).join('')}
                    </div>
                    
                    <!-- Spots Grid -->
                    <div class="discover-spots-grid" id="discover-grid">
        `;

        // Add all spots
        localityData.spots.forEach(spot => {
            const hasPhoto = spot.photo_url;
            const placeholderColor = getCategoryColor(spot.category);

            html += `
                <a href="${spot.google_maps_url}" target="_blank" class="discover-spot-card" data-category="${spot.category}" rel="noopener noreferrer">
                    <div class="discover-spot-image" style="${hasPhoto ? `background-image: url('${spot.photo_url}')` : `background: ${placeholderColor}`}">
                        ${!hasPhoto ? `<span class="discover-spot-icon">${spot.icon}</span>` : ''}
                        <span class="discover-spot-badge">${spot.category}</span>
                    </div>
                    <div class="discover-spot-info">
                        <h3 class="discover-spot-name">${spot.name}</h3>
                        ${spot.address ? `<p class="discover-spot-address">${spot.address}</p>` : ''}
                        <div class="discover-spot-meta">
                            ${spot.rating ? `<span class="discover-spot-rating">&#9733; ${spot.rating}</span>` : ''}
                            <span class="discover-spot-link">Open in Maps <span class="ui-arrow-right"></span></span>
                        </div>
                    </div>
                </a>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;

        app.innerHTML = html;

        // Add tab filter functionality
        const tabs = document.querySelectorAll('.discover-tab');
        const cards = document.querySelectorAll('.discover-spot-card');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const category = tab.dataset.category;

                // Filter cards
                cards.forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        console.log('[Discover] Rendered', localityData.spots.length, 'spots');

    } catch (err) {
        console.error('[Discover] Error:', err);
        app.innerHTML = `<div class="error">Error loading places: ${err.message}</div>`;
    }
}
