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
        updateMetadata("The City's Definitive Rankings", "Discover the best of Thiruvananthapuram with objective, data-driven rankings for neighborhoods, dining, and more.");
        renderHomeView();
    } else if (hash === '/localities') {
        console.log('[Debug] Routing to Localities');
        updateMetadata("Best Localities Ranked", "Explore and compare Thiruvananthapuram's top residential neighborhoods based on quality of life and value.");
        renderRankingView();
    } else if (hash === '/customize') {
        console.log('[Debug] Routing to Customize Localities');
        updateMetadata("Customize Ranking Weights");
        renderCustomizeView();
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
    } else if (hash === '/customize/boutiques') {
        console.log('[Debug] Routing to Customize Boutiques');
        updateMetadata("Customize Boutique Weights");
        renderDiningCustomizeView('boutiques');
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
    } else if (hash === '/customize/banking') {
        console.log('[Debug] Routing to Customize Banking');
        updateMetadata("Customize Banking Weights");
        renderDiningCustomizeView('banking');
    } else if (hash === '/methodology') {
        console.log('[Debug] Routing to Methodology');
        updateMetadata("Our Methodology", "How we calculate our rankings using data-driven metrics and objective algorithms.");
        renderMethodologyView();
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
        console.log('[Debug] Routing to Boutiques');
        updateMetadata("Top Boutiques", "Discover unique fashion and designer boutiques in the city.");
        renderBoutiquesView();
    } else if (hash === '/specialty-shops') {
        console.log('[Debug] Routing to Specialty Shops');
        updateMetadata("Specialty Shops", "Curated specialty stores and unique gift shops.");
        renderSpecialtyShopsView();
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
    } else if (hash === '/culture') {
        console.log('[Debug] Routing to Culture Category');
        updateMetadata("Culture & Heritage", "Discover the cultural soul of Thiruvananthapuram.");
        renderCultureCategoryView();
    } else if (hash === '/services') {
        console.log('[Debug] Routing to Services');
        updateMetadata("City Services", "Essential utilities and government services in Trivandrum.");
        renderServicesView();
    } else if (hash === '/healthcare') {
        console.log('[Debug] Routing to Healthcare');
        updateMetadata("Healthcare Guide", "Top hospitals, clinics, and medical facilities.");
        renderHealthcareView();
    } else if (hash === '/education') {
        console.log('[Debug] Routing to Education');
        updateMetadata("Education & Schools", "Ranked list of top schools and educational institutions.");
        renderEducationView();
    } else if (hash === '/banking') {
        console.log('[Debug] Routing to Banking');
        updateMetadata("Banking & Finance", "Nearby banks, ATMs, and financial centers.");
        renderBankingView();
    } else if (hash.startsWith('/discover/')) {
        const localityName = decodeURIComponent(hash.replace('/discover/', ''));
        console.log('[Debug] Routing to Discover View for:', localityName);
        updateMetadata(`Discover ${localityName}`, `Explore the top spots, amenities, and lifestyle in ${localityName}, Trivandrum.`);
        if (typeof renderDiscoverView === 'function') {
            renderDiscoverView(localityName);
        } else {
            app.innerHTML = '<div class="error">Discover page not available. Refresh page.</div>';
        }
    } else if (hash.startsWith('/locality/')) {
        const localityName = decodeURIComponent(hash.replace('/locality/', ''));
        console.log('[Debug] Routing to Detail View for:', localityName);
        updateMetadata(`${localityName} Analysis`, `Deep dive into the metrics, pricing, and pros/cons of ${localityName}.`);
        if (typeof renderDetailView === 'function') {
            renderDetailView(localityName);
        } else {
            app.innerHTML = '<div class="error">System Error: renderDetailView missing. Refresh page.</div>';
        }
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
            case 'boutiques': renderBoutiqueDetail(entityId); break;
            case 'specialty_shops': renderSpecialtyShopDetail(entityId); break;
            case 'museums': renderMuseumDetail(entityId); break;
            case 'religious_sites': renderReligiousSiteDetail(entityId); break;
            case 'healthcare': renderHealthcareDetail(entityId); break;
            case 'education': renderEducationDetail(entityId); break;
            case 'banking': renderBankingDetail(entityId); break;
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
            '/boutiques': '#/customize/boutiques',
            '/specialty-shops': '#/customize/specialty-shops',
            '/museums': '#/customize/museums',
            '/religious-sites': '#/customize/religious-sites',
            '/healthcare': '#/customize/healthcare',
            '/education': '#/customize/education',
            '/banking': '#/customize/banking',
            '/localities': '#/customize'
        };
        customizeBtn.href = customizeRoutes[hash] || '#/customize';
    }
}

// Set up routing
window.addEventListener('hashchange', route);
window.addEventListener('load', route);
