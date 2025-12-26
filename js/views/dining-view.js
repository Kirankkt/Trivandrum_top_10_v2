// Dining & Stay View - Handles Restaurants, Cafes, and Hotels
async function renderDiningView(type) {
    const app = document.getElementById('app');

    // Config based on type
    const config = {
        restaurants: {
            title: "Top Restaurants",
            subtitle: "Curated by Taste, Vibe & Authentic Reviews",
            icon: "",
            filename: "data/restaurants.json",
            badgeColor: "#ff6b6b"
        },
        cafes: {
            title: "Top Cafes",
            subtitle: "Best Spots for Coffee, Work & Conversation",
            icon: "",
            filename: "data/cafes.json",
            badgeColor: "#4ecdc4"
        },
        hotels: {
            title: "Top Hotels",
            subtitle: "Luxury Stays & Premium Comfort",
            icon: "",
            filename: "data/hotels.json",
            badgeColor: "#ffd93d"
        }
    }[type];

    if (!config) return console.error("Invalid dining type");

    app.innerHTML = '<div class="loading">Finding best spots...</div>';

    try {
        const response = await fetch(config.filename);
        if (!response.ok) throw new Error("Data not found");
        let data = await response.json();

        // Check for custom weights and apply them
        const storageKey = `${type}Weights`;
        const savedWeights = JSON.parse(localStorage.getItem(storageKey));
        const isCustomized = savedWeights !== null;

        // Define metric configurations for each type
        const metricConfigs = {
            restaurants: ['sentiment', 'popularity', 'rating', 'value', 'convenience', 'vibe'],
            cafes: ['sentiment', 'popularity', 'rating', 'value', 'convenience', 'workspace'],
            hotels: ['sentiment', 'popularity', 'rating', 'value', 'location', 'luxury']
        };

        // Apply custom weights if present
        if (isCustomized) {
            data = data.map(item => {
                const metrics = item.metrics || {};
                let customScore = 0;
                const totalWeight = Object.values(savedWeights).reduce((a, b) => a + b, 0) || 100;

                // Map metric IDs to actual data
                const metricMapping = {
                    sentiment: metrics.sentiment || 50,
                    popularity: Math.min((item.reviews || 0) / 100, 100),
                    rating: (item.rating || 4) * 20,
                    value: (5 - (item.price_level || 2)) * 25,
                    convenience: metrics.convenience || 50,
                    vibe: (item.vibes?.length || 0) * 20,
                    workspace: (item.vibes?.includes('Work Friendly') ? 80 : 30),
                    location: metrics.convenience || 50,
                    luxury: (item.price_level || 2) * 25
                };

                metricConfigs[type].forEach(metricId => {
                    const weight = (savedWeights[metricId] || 0) / totalWeight;
                    customScore += (metricMapping[metricId] || 50) * weight;
                });

                return { ...item, score: customScore };
            }).sort((a, b) => b.score - a.score);
        }

        const allSpots = data;  // Show all items (no longer limited to 20)
        const top10 = allSpots.slice(0, 10);
        const remaining = allSpots.slice(10);  // Show all remaining items after top 10

        // Customized ranking indicator (inline, subtle)
        const customizedIndicator = isCustomized ? `
            <span class="customized-indicator">Custom weights active</span>
            <button class="btn-restore-small" id="restore-default-btn">Reset</button>
        ` : '';

        let html = `
            <div class="dining-hero" style="background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${top10[0].image}') center/cover fixed;">
                <div class="hero-content">
                    <h1 style="color: white; text-shadow: 2px 2px 8px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.8); font-size: 3.5rem;">${config.title}</h1>
                    <p class="hero-subtitle" style="color: rgba(255,255,255,0.9); text-shadow: 1px 1px 4px rgba(0,0,0,0.9); font-size: 1.25rem; margin-top: 0.5rem;">${config.subtitle}</p>
                </div>
            </div>

            <div class="dining-container" id="dining-section">
                <div class="section-header">
                    <div class="section-header-actions">
                        ${customizedIndicator}
                        <a href="#/customize/${type}" class="btn-customize-inline">Customize</a>
                    </div>
                </div>
                
                <main class="dining-grid">
                    ${top10.map((place, index) => createDiningCard(place, index + 1, config, type)).join('')}
                </main>
                
                ${remaining.length > 0 ? `
                    <div class="show-more-container">
                        <button class="btn-show-more" id="show-more-btn">Show More (11-${allSpots.length}) ↓</button>
                    </div>
                    
                    <div class="dining-grid hidden-spots" id="hidden-spots" style="display: none;">
                        ${remaining.map((place, index) => createDiningCard(place, index + 11, config, type)).join('')}
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
                document.getElementById('dining-section').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Restore default button
        const restoreBtn = document.getElementById('restore-default-btn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => {
                localStorage.removeItem(storageKey);
                // Reload the page to show default rankings
                renderDiningView(type);
            });
        }

    } catch (error) {
        console.error(error);
        app.innerHTML = `<div class="error">Failed to load ${type}. Please try again later.</div>`;
    }
}

function createDiningCard(place, rank, config, type) {
    const stars = '&#9733;'.repeat(Math.round(place.rating));
    const price = '$'.repeat(place.price_level || 2);

    // Vibe Badges (limit to 3)
    const vibeBadges = (place.vibes || []).slice(0, 3).map(vibe =>
        `<span class="vibe-badge">${vibe}</span>`
    ).join('');

    // Featured badge for top 3
    const featuredBadge = rank <= 3 ? `<span class="badge-rank-${rank}">${rank === 1 ? 'Top Pick' : rank === 2 ? 'Runner Up' : 'Notable'}</span>` : '';

    // Detail page link
    const detailUrl = `#/entity/${type}/${encodeURIComponent(place.id)}`;

    return `
        <a href="${detailUrl}" class="dining-card-link">
            <div class="dining-card ${rank <= 3 ? 'featured' : ''}">
                <div class="card-rank">#${rank}</div>
                ${featuredBadge}
                <div class="card-image-container">
                    <img src="${place.image}" alt="${place.name}" class="card-image" loading="lazy" onerror="this.src='https://via.placeholder.com/400x250?text=No+Image'">
                    <div class="card-overlay">
                        <span class="card-price">${price}</span>
                    </div>
                </div>

                <div class="card-content">
                    <div class="card-header">
                        <h3 class="card-title">${place.name}</h3>
                        <div class="card-rating">
                            <span class="rating-val">${place.rating}</span>
                            <span class="rating-stars">${stars}</span>
                            <span class="review-count">(${place.reviews.toLocaleString()} reviews)</span>
                        </div>
                    </div>

                    ${place.locality ? `<p class="card-locality">${place.locality}</p>` : ''}

                    <div class="vibe-tags">
                        ${vibeBadges}
                    </div>

                    <div class="card-footer">
                        <div class="score-pill" style="border-color: ${config.badgeColor}; color: ${config.badgeColor}">
                             Score: ${place.score}/100
                        </div>
                        <span class="btn-details">View Details →</span>
                    </div>
                </div>
            </div>
        </a>
    `;
}
