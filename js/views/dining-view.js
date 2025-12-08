// Dining & Stay View - Handles Restaurants, Cafes, and Hotels
async function renderDiningView(type) {
    const app = document.getElementById('app');

    // Config based on type
    const config = {
        restaurants: {
            title: "Top 20 Restaurants",
            subtitle: "Curated by Taste, Vibe & Authentic Reviews",
            icon: "🍽️",
            filename: "data/restaurants.json",
            badgeColor: "#ff6b6b"
        },
        cafes: {
            title: "Top 20 Cafes",
            subtitle: "Best Spots for Coffee, Work & Conversation",
            icon: "☕",
            filename: "data/cafes.json",
            badgeColor: "#4ecdc4"
        },
        hotels: {
            title: "Top 20 Hotels",
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
        const top20 = data.slice(0, 20);

        let html = `
            <div class="dining-hero" style="background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${top20[0].image}') center/cover fixed;">
                <div class="hero-content">
                    <h1>${config.icon} ${config.title}</h1>
                    <p class="hero-subtitle">${config.subtitle}</p>
                </div>
            </div>

            <div class="dining-container">
                <main class="dining-grid">
                    ${top20.map((place, index) => createDiningCard(place, index + 1, config)).join('')}
                </main>
            </div>
        `;

        app.innerHTML = html;
        window.scrollTo(0, 0);

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

    return `
        <div class="dining-card">
            <div class="card-rank">#${rank}</div>
            <div class="card-image-container">
                <img src="${place.image}" alt="${place.name}" class="card-image" loading="lazy">
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
                        <span class="review-count">(${place.reviews} reviews)</span>
                    </div>
                </div>

                <div class="vibe-tags">
                    ${vibeBadges}
                </div>

                <div class="card-footer">
                    <div class="score-pill" style="border-color: ${config.badgeColor}; color: ${config.badgeColor}">
                         Foodie Score: ${place.score}/100
                    </div>
                    <a href="https://www.google.com/maps/place/?q=place_id:${place.id}" target="_blank" class="btn-map">View Map ↗</a>
                </div>
            </div>
        </div>
    `;
}
