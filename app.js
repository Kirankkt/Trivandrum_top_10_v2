// Simple Router
function route() {
    // Decode the hash to handle URL-encoded characters (e.g., %2F for /)
    const rawHash = window.location.hash.slice(1) || '/';
    const hash = decodeURIComponent(rawHash);
    console.log('[Debug] Route called. Hash:', hash);
    const app = document.getElementById('app');

    // Handle different routes
    if (hash === '/' || hash === '') {
        console.log('[Debug] Routing to Home');
        updateMetadata("Best Experiences in Kerala's Capital", "Discover the top restaurants, cafes, hotels, and attractions in Thiruvananthapuram.");
        renderHomeView();
    } else if (hash === '/customize/restaurants') {
        console.log('[Debug] Routing to Customize Restaurants');
        updateMetadata("Customize Restaurant Weights");
        renderDiningCustomizeView('restaurants');
    } else if (hash === '/customize/cafes') {
        console.log('[Debug] Routing to Customize Cafes');
        updateMetadata("Customize Cafe Weights");
        renderDiningCustomizeView('cafes');
    } else if (hash === '/customize/hotels') {
        console.log('[Debug] Routing to Customize Hotels');
        updateMetadata("Customize Hotel Weights");
        renderDiningCustomizeView('hotels');
    } else if (hash === '/customize/malls') {
        console.log('[Debug] Routing to Customize Malls');
        updateMetadata("Customize Mall Weights");
        renderDiningCustomizeView('malls');
    } else if (hash === '/customize/specialty-shops') {
        console.log('[Debug] Routing to Customize Specialty Shops');
        updateMetadata("Customize Specialty Shop Weights");
        renderDiningCustomizeView('specialty-shops');
    } else if (hash === '/customize/museums') {
        console.log('[Debug] Routing to Customize Museums');
        updateMetadata("Customize Museum Weights");
        renderDiningCustomizeView('museums');
    } else if (hash === '/customize/religious-sites') {
        console.log('[Debug] Routing to Customize Religious Sites');
        updateMetadata("Customize Religious Site Weights");
        renderDiningCustomizeView('religious-sites');
    } else if (hash === '/customize/healthcare') {
        console.log('[Debug] Routing to Customize Healthcare');
        updateMetadata("Customize Healthcare Weights");
        renderDiningCustomizeView('healthcare');
    } else if (hash === '/customize/education') {
        console.log('[Debug] Routing to Customize Education');
        updateMetadata("Customize Education Weights");
        renderDiningCustomizeView('education');
    } else if (hash === '/customize/supermarkets') {
        updateMetadata("Customize Supermarket Weights");
        renderDiningCustomizeView('supermarkets');
    } else if (hash === '/customize/clothing-stores') {
        updateMetadata("Customize Clothing Store Weights");
        renderDiningCustomizeView('clothing-stores');
    } else if (hash === '/customize/art-galleries') {
        updateMetadata("Customize Art Gallery Weights");
        renderDiningCustomizeView('art-galleries');
    } else if (hash === '/customize/cultural-centers') {
        updateMetadata("Customize Cultural Center Weights");
        renderDiningCustomizeView('cultural-centers');
    } else if (hash === '/customize/theatres') {
        updateMetadata("Customize Theatre Weights");
        renderDiningCustomizeView('theatres');
    } else if (hash === '/customize/landmarks') {
        updateMetadata("Customize Landmark Weights");
        renderDiningCustomizeView('landmarks');
    } else if (hash === '/customize/beaches') {
        updateMetadata("Customize Beach Weights");
        renderDiningCustomizeView('beaches');
    } else if (hash === '/customize/nature-sanctuaries') {
        updateMetadata("Customize Wildlife Weights");
        renderDiningCustomizeView('nature-sanctuaries');
    } else if (hash === '/customize/backwaters') {
        updateMetadata("Customize Backwater Weights");
        renderDiningCustomizeView('backwaters');
    } else if (hash === '/customize/sports-clubs') {
        updateMetadata("Customize Sports Club Weights");
        renderDiningCustomizeView('sports-clubs');
    } else if (hash === '/customize/training-academies') {
        updateMetadata("Customize Training Academy Weights");
        renderDiningCustomizeView('training-academies');
    } else if (hash === '/customize/adventure-sports') {
        updateMetadata("Customize Adventure Sports Weights");
        renderDiningCustomizeView('adventure-sports');
    } else if (hash === '/customize/ayurveda') {
        updateMetadata("Customize Ayurveda Weights");
        renderDiningCustomizeView('ayurveda');
    } else if (hash === '/customize/yoga') {
        updateMetadata("Customize Yoga Weights");
        renderDiningCustomizeView('yoga');
    } else if (hash === '/methodology' || hash === '/about-rankings') {
        console.log('[Debug] Routing to About Rankings');
        updateMetadata("About Our Rankings", "How we calculate our rankings using data-driven metrics and objective algorithms.");
        renderMethodologyView();
    } else if (hash === '/contact' || hash === '/about') {
        console.log('[Debug] Routing to Contact');
        updateMetadata("Contact Us", "Get in touch with the Trivandrum Top 10 team.");
        renderContactView();
    } else if (hash.startsWith('/compare/')) {
        const category = hash.replace('/compare/', '');
        console.log('[Debug] Routing to Compare:', category);
        updateMetadata("Compare " + category.charAt(0).toUpperCase() + category.slice(1), "Side-by-side comparison");
        renderCompareView(category);
    } else if (hash === '/compare') {
        const state = CompareManager.getState();
        if (state.category) {
            window.location.hash = '/compare/' + state.category;
        } else {
            document.getElementById('app').innerHTML = '<div class="compare-empty"><h2>Nothing to Compare</h2><p>Add items to compare from any category page.</p><a href="#/" class="btn-primary">Browse Categories</a></div>';
        }
    } else if (hash === '/map' || hash.startsWith('/map?')) {
        console.log('[Debug] Routing to Map');
        updateMetadata("Interactive Map", "Explore Thiruvananthapuram's top localities and attractions on our interactive map.");
        renderMapView();
    } else if (hash === '/restaurants') {
        console.log('[Debug] Routing to Restaurants');
        updateMetadata("Best Restaurants in Trivandrum", "The top 10 dining spots in Thiruvananthapuram, ranked by quality, vibe, and value.");
        renderDiningView('restaurants');
    } else if (hash === '/hotels') {
        console.log('[Debug] Routing to Hotels');
        updateMetadata("Best Hotels in Trivandrum", "The city's best stays, from luxury resorts to premium boutiques.");
        renderDiningView('hotels');
    } else if (hash === '/cafes') {
        console.log('[Debug] Routing to Cafes');
        updateMetadata("Top Cafes", "Discover the best cafes in Trivandrum for coffee, workspace, and vibes.");
        renderDiningView('cafes');
    } else if (hash === '/malls') {
        console.log('[Debug] Routing to Malls');
        updateMetadata("Best Malls", "Top shopping malls and retail centers in Trivandrum.");
        renderMallsView();
    } else if (hash === '/boutiques') {
        // Redirect boutiques to clothing-stores
        window.location.hash = '/clothing-stores';
        return;
    } else if (hash === '/supermarkets') {
        console.log('[Debug] Routing to Supermarkets');
        updateMetadata("Top Supermarkets", "Best grocery stores and hypermarkets in Trivandrum.");
        renderSupermarketsView();
    } else if (hash === '/clothing-stores') {
        console.log('[Debug] Routing to Clothing Stores');
        updateMetadata("Clothing Stores", "Fashion boutiques and apparel shops.");
        renderClothingStoresView();
    } else if (hash === '/shop') {
        console.log('[Debug] Routing to Shop Category');
        updateMetadata("Lifestyle & Shopping", "The best shopping destinations in Thiruvananthapuram.");
        renderShopCategoryView();
    } else if (hash === '/museums') {
        console.log('[Debug] Routing to Museums');
        updateMetadata("Top Museums", "Explore the rich history and art of Trivandrum through its museums.");
        renderMuseumsView();
    } else if (hash === '/religious-sites') {
        console.log('[Debug] Routing to Religious Sites');
        updateMetadata("Religious Sites", "The city's most significant and beautiful religious landmarks.");
        renderReligiousSitesView();
    } else if (hash === '/art-galleries') {
        console.log('[Debug] Routing to Art Galleries');
        updateMetadata("Art Galleries", "Art galleries and exhibition spaces in Trivandrum.");
        renderArtGalleriesView();
    } else if (hash === '/cultural-centers') {
        console.log('[Debug] Routing to Cultural Centers');
        updateMetadata("Cultural Centers", "Arts, crafts and cultural institutions.");
        renderCulturalCentersView();
    } else if (hash === '/theatres') {
        console.log('[Debug] Routing to Theatres');
        updateMetadata("Theatres & Auditoriums", "Performance venues and drama centers.");
        renderTheatresView();
    } else if (hash === '/landmarks') {
        console.log('[Debug] Routing to Landmarks');
        updateMetadata("Landmarks", "Palaces, monuments and historic buildings.");
        renderLandmarksView();
    } else if (hash === '/culture') {
        console.log('[Debug] Routing to Culture Category');
        updateMetadata("Culture & Heritage", "Discover the cultural soul of Thiruvananthapuram.");
        renderCultureCategoryView();
    } else if (hash === '/healthcare') {
        console.log('[Debug] Routing to Healthcare');
        updateMetadata("Healthcare Guide", "Top hospitals, clinics, and medical facilities.");
        renderHealthcareView();
    } else if (hash === '/ayurveda') {
        console.log('[Debug] Routing to Ayurveda');
        updateMetadata("Ayurveda & Spa", "Traditional wellness and rejuvenation centers.");
        renderAyurvedaView();
    } else if (hash === '/yoga') {
        console.log('[Debug] Routing to Yoga');
        updateMetadata("Yoga & Meditation", "Ashrams, yoga centers and spiritual retreats.");
        renderYogaView();
    } else if (hash === '/beaches') {
        console.log('[Debug] Routing to Beaches');
        updateMetadata("Beaches", "Scenic coastal getaways in Trivandrum.");
        renderBeachesView();
    } else if (hash === '/nature-sanctuaries') {
        console.log('[Debug] Routing to Nature Sanctuaries');
        updateMetadata("Wildlife & Nature", "Sanctuaries, forests and nature reserves.");
        renderNatureSanctuariesView();
    } else if (hash === '/backwaters') {
        console.log('[Debug] Routing to Backwaters');
        updateMetadata("Backwaters", "Lakes, lagoons and boating experiences.");
        renderBackwatersView();
    } else if (hash === '/sports-clubs') {
        console.log('[Debug] Routing to Sports Clubs');
        updateMetadata("Sports Clubs", "Tennis, badminton, golf and more.");
        renderSportsClubsView();
    } else if (hash === '/training-academies') {
        console.log('[Debug] Routing to Training Academies');
        updateMetadata("Training Academies", "Sports coaching and skill development.");
        renderTrainingAcademiesView();
    } else if (hash === '/adventure-sports') {
        console.log('[Debug] Routing to Adventure Sports');
        updateMetadata("Adventure Sports", "Kayaking, water sports and outdoor activities.");
        renderAdventureSportsView();
    } else if (hash.startsWith('/entity/')) {
        const parts = hash.replace('/entity/', '').split('/');
        const category = parts[0];
        const entityId = parts.slice(1).join('/');
        console.log('[Debug] Routing to Entity Detail:', category, entityId);

        switch (category) {
            case 'restaurants': renderRestaurantDetail(entityId); break;
            case 'cafes': renderCafeDetail(entityId); break;
            case 'hotels': renderHotelDetail(entityId); break;
            case 'malls': renderMallDetail(entityId); break;
            case 'boutiques': renderGenericEntityDetail(entityId, 'clothing_stores', 'data/clothing_stores.json'); break;
            case 'specialty_shops': renderSpecialtyShopDetail(entityId); break;
            case 'museums': renderMuseumDetail(entityId); break;
            case 'religious_sites': renderReligiousSiteDetail(entityId); break;
            case 'healthcare': renderHealthcareDetail(entityId); break;
            case 'supermarkets': renderGenericEntityDetail(entityId, 'supermarkets', 'data/supermarkets.json'); break;
            case 'clothing_stores': renderGenericEntityDetail(entityId, 'clothing_stores', 'data/clothing_stores.json'); break;
            case 'art_galleries': renderGenericEntityDetail(entityId, 'art_galleries', 'data/art_galleries.json'); break;
            case 'cultural_centers': renderGenericEntityDetail(entityId, 'cultural_centers', 'data/cultural_centers.json'); break;
            case 'theatres': renderGenericEntityDetail(entityId, 'theatres', 'data/music_drama_centers.json'); break;
            case 'landmarks': renderGenericEntityDetail(entityId, 'landmarks', 'data/landmarks.json'); break;
            case 'beaches': renderGenericEntityDetail(entityId, 'beaches', 'data/beaches.json'); break;
            case 'nature_sanctuaries': renderGenericEntityDetail(entityId, 'nature_sanctuaries', 'data/nature_sanctuaries.json'); break;
            case 'backwaters': renderGenericEntityDetail(entityId, 'backwaters', 'data/backwaters.json'); break;
            case 'sports_clubs': renderGenericEntityDetail(entityId, 'sports_clubs', 'data/sports_clubs.json'); break;
            case 'training_academies': renderGenericEntityDetail(entityId, 'training_academies', 'data/training_academies.json'); break;
            case 'adventure_sports': renderGenericEntityDetail(entityId, 'adventure_sports', 'data/adventure_sports.json'); break;
            case 'ayurveda': renderGenericEntityDetail(entityId, 'ayurveda', 'data/ayurveda_wellness.json'); break;
            case 'yoga': renderGenericEntityDetail(entityId, 'yoga', 'data/yoga_meditation.json'); break;
            default: app.innerHTML = '<div class="error">Unknown category</div>';
        }
    } else if (hash === '/admin') {
        console.log('[Debug] Routing to Admin Dashboard');
        updateMetadata("Admin Dashboard", "Project analytics and management.");
        renderAdminView();
    } else {
        console.log('[Debug] 404 Not Found');
        app.innerHTML = '<div class="error">Page not found</div>';
    }

    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href').slice(1);
        if (linkPath === hash || (linkPath === '/' && hash === '')) {
            link.classList.add('active');
        }
    });

    // Update Customize button based on current page
    const customizeBtn = document.querySelector('.btn-plan');
    if (customizeBtn) {
        const customizeRoutes = {
            '/restaurants': '#/customize/restaurants',
            '/cafes': '#/customize/cafes',
            '/hotels': '#/customize/hotels',
            '/malls': '#/customize/malls',
            '/specialty-shops': '#/customize/specialty-shops',
            '/museums': '#/customize/museums',
            '/religious-sites': '#/customize/religious-sites',
            '/healthcare': '#/customize/healthcare',
            '/education': '#/customize/education',
            '/supermarkets': '#/customize/supermarkets',
            '/clothing-stores': '#/customize/clothing-stores',
            '/art-galleries': '#/customize/art-galleries',
            '/cultural-centers': '#/customize/cultural-centers',
            '/theatres': '#/customize/theatres',
            '/landmarks': '#/customize/landmarks',
            '/beaches': '#/customize/beaches',
            '/nature-sanctuaries': '#/customize/nature-sanctuaries',
            '/backwaters': '#/customize/backwaters',
            '/sports-clubs': '#/customize/sports-clubs',
            '/training-academies': '#/customize/training-academies',
            '/adventure-sports': '#/customize/adventure-sports',
            '/ayurveda': '#/customize/ayurveda',
            '/yoga': '#/customize/yoga'
        };
        customizeBtn.href = customizeRoutes[hash] || '#/';
    }
}

// Set up routing
window.addEventListener('hashchange', route);
window.addEventListener('load', route);
