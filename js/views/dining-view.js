// Dining & Stay View - Handles Restaurants, Cafes, and Hotels
async function renderDiningView(type) {
    const app = document.getElementById('app');

    // Config based on type
    const config = {
        restaurants: {
            title: "Top Restaurants",
            subtitle: "Curated by Taste, Vibe & Authentic Reviews",
            icon: "🍽️",
            filename: "data/restaurants.json",
            badgeColor: "#ff6b6b"
        },
        cafes: {
            title: "Top Cafes",
            subtitle: "Best Spots for Coffee, Work & Conversation",
            icon: "☕",
            filename: "data/cafes.json",
            badgeColor: "#4ecdc4"
        },
        hotels: {
            title: "Top Hotels",
            subtitle: "Luxury Stays & Premium Comfort",
            icon: "🏨",
            filename: "data/hotels.json",
            badgeColor: "#ffd93d"
        }
    }[type];

    if (!config) return console.error("Invalid dining type");

    app.innerHTML = '<div class="loading">Finding best spots...</div>';

    try {
        const response = await fetch(config.filename);
        if (!response.ok) throw new Error("Data not found");
        const data = await response.json();
        const allSpots = data.slice(0, 20);
        const top10 = allSpots.slice(0, 10);
        const remaining = allSpots.slice(10, 20);

        let html = `
            <div class="dining-hero" style="background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${top10[0].image}') center/cover fixed;">
                <div class="hero-content">
                    <h1>${config.icon} ${config.title}</h1>
                    <p class="hero-subtitle">${config.subtitle}</p>
                    <div class="hero-stats">
                        <div class="stat"><span class="stat-value">20</span><span class="stat-label">Spots</span></div>
                        <div class="stat"><span class="stat-value">6</span><span class="stat-label">Metrics</span></div>
                        <div class="stat"><span class="stat-value">5</span><span class="stat-label">Vibe Tags</span></div>
                    </div>
                </div>
            </div>

            <div class="dining-container" id="dining-section">
                <div class="section-header">
                    <h2 class="section-title">Top 10 ${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
                    <p class="section-subtitle">Ranked by Foodie Score (Sentiment, Popularity, Value & Vibe)</p>
                </div>
                
                <main class="dining-grid">
                    ${top10.map((place, index) => createDiningCard(place, index + 1, config)).join('')}
                </main>
                
                ${remaining.length > 0 ? `
                    <div class="show-more-container">
                        <button class="btn-show-more" id="show-more-btn">Show More (11-20) ↓</button>
                    </div>
                    
                    <div class="dining-grid hidden-spots" id="hidden-spots" style="display: none;">
                        ${remaining.map((place, index) => createDiningCard(place, index + 11, config)).join('')}
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

    } catch (error) {
        console.error(error);
        app.innerHTML = `<div class="error">Failed to load ${type}. Please try again later.</div>`;
    }
}

function createDiningCard(place, rank, config) {
    const stars = '⭐'.repeat(Math.round(place.rating));
    const price = '$'.repeat(place.price_level || 2);

    // Vibe Badges (limit to 3)
    const vibeBadges = (place.vibes || []).slice(0, 3).map(vibe =>
        `<span class="vibe-badge">${vibe}</span>`
    ).join('');

    // Featured badge for top 3
    const featuredBadge = rank <= 3 ? `<span class="featured-badge">${rank === 1 ? '🏆 Top Pick' : rank === 2 ? '🥈 Runner Up' : '🥉 Notable'}</span>` : '';

    return `
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

                <div class="vibe-tags">
                    ${vibeBadges}
                </div>

                <div class="card-footer">
                    <div class="score-pill" style="border-color: ${config.badgeColor}; color: ${config.badgeColor}">
                         Score: ${place.score}/100
                    </div>
                    <a href="https://www.google.com/maps/place/?q=place_id:${place.id}" target="_blank" class="btn-map">View Map ↗</a>
                </div>
            </div>
        </div>
    `;
}
