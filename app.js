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
        renderHomeView();
    } else if (hash === '/localities') {
        console.log('[Debug] Routing to Localities');
        renderRankingView();
    } else if (hash === '/customize') {
        console.log('[Debug] Routing to Customize Localities');
        renderCustomizeView();
    } else if (hash === '/customize/restaurants') {
        console.log('[Debug] Routing to Customize Restaurants');
        renderDiningCustomizeView('restaurants');
    } else if (hash === '/customize/cafes') {
        console.log('[Debug] Routing to Customize Cafes');
        renderDiningCustomizeView('cafes');
    } else if (hash === '/customize/hotels') {
        console.log('[Debug] Routing to Customize Hotels');
        renderDiningCustomizeView('hotels');
    } else if (hash === '/methodology') {
        console.log('[Debug] Routing to Methodology');
        renderMethodologyView();
    } else if (hash === '/map' || hash.startsWith('/map?')) {
        console.log('[Debug] Routing to Map');
        renderMapView();
    } else if (hash === '/restaurants') {
        console.log('[Debug] Routing to Restaurants');
        renderDiningView('restaurants');
    } else if (hash === '/hotels') {
        console.log('[Debug] Routing to Hotels');
        renderDiningView('hotels');
    } else if (hash === '/cafes') {
        console.log('[Debug] Routing to Cafes');
        renderDiningView('cafes');
    } else if (hash === '/experiences') {
        app.innerHTML = `
          <div class="coming-soon">
            <h1>Experiences</h1>
            <p>Top experiences in Trivandrum coming soon!</p>
          </div>`;
    // Shop category routes
    } else if (hash === '/malls') {
        console.log('[Debug] Routing to Malls');
        renderMallsView();
    } else if (hash === '/boutiques') {
        console.log('[Debug] Routing to Boutiques');
        renderBoutiquesView();
    } else if (hash === '/specialty-shops') {
        console.log('[Debug] Routing to Specialty Shops');
        renderSpecialtyShopsView();
    } else if (hash === '/shop') {
        console.log('[Debug] Routing to Shop Category');
        renderShopCategoryView();
    // Culture category routes
    } else if (hash === '/museums') {
        console.log('[Debug] Routing to Museums');
        renderMuseumsView();
    } else if (hash === '/religious-sites') {
        console.log('[Debug] Routing to Religious Sites');
        renderReligiousSitesView();
    } else if (hash === '/culture') {
        console.log('[Debug] Routing to Culture Category');
        renderCultureCategoryView();
    // Services category routes
    } else if (hash === '/services') {
        console.log('[Debug] Routing to Services');
        renderServicesView();
    } else if (hash === '/healthcare') {
        console.log('[Debug] Routing to Healthcare');
        renderHealthcareView();
    } else if (hash === '/education') {
        console.log('[Debug] Routing to Education');
        renderEducationView();
    } else if (hash === '/banking') {
        console.log('[Debug] Routing to Banking');
        renderBankingView();
    } else if (hash.startsWith('/discover/')) {
        const localityName = decodeURIComponent(hash.replace('/discover/', ''));
        console.log('[Debug] Routing to Discover View for:', localityName);
        if (typeof renderDiscoverView === 'function') {
            renderDiscoverView(localityName);
        } else {
            console.error('[Debug] renderDiscoverView is NOT a function!');
            app.innerHTML = '<div class="error">Discover page not available. Refresh page.</div>';
        }
    } else if (hash.startsWith('/locality/')) {
        const localityName = decodeURIComponent(hash.replace('/locality/', ''));
        console.log('[Debug] Routing to Detail View for:', localityName);
        console.log('[Debug] Checking if renderDetailView exists:', typeof renderDetailView);
        if (typeof renderDetailView === 'function') {
            renderDetailView(localityName);
        } else {
            console.error('[Debug] renderDetailView is NOT a function!');
            app.innerHTML = '<div class="error">System Error: renderDetailView missing. Refresh page.</div>';
        }
    // Entity detail routes (generic pattern: /entity/{category}/{id})
    } else if (hash.startsWith('/entity/')) {
        const parts = hash.replace('/entity/', '').split('/');
        const category = parts[0];
        const entityId = parts.slice(1).join('/'); // Handle IDs with slashes
        console.log('[Debug] Routing to Entity Detail:', category, entityId);

        // Route to appropriate detail view
        switch(category) {
            case 'restaurants':
                renderRestaurantDetail(entityId);
                break;
            case 'cafes':
                renderCafeDetail(entityId);
                break;
            case 'hotels':
                renderHotelDetail(entityId);
                break;
            case 'malls':
                renderMallDetail(entityId);
                break;
            case 'boutiques':
                renderBoutiqueDetail(entityId);
                break;
            case 'specialty_shops':
                renderSpecialtyShopDetail(entityId);
                break;
            case 'museums':
                renderMuseumDetail(entityId);
                break;
            case 'religious_sites':
                renderReligiousSiteDetail(entityId);
                break;
            case 'healthcare':
                renderHealthcareDetail(entityId);
                break;
            case 'education':
                renderEducationDetail(entityId);
                break;
            case 'banking':
                renderBankingDetail(entityId);
                break;
            default:
                app.innerHTML = '<div class="error">Unknown category</div>';
        }
    } else {
        // 404
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
        if (hash === '/restaurants') {
            customizeBtn.href = '#/customize/restaurants';
        } else if (hash === '/cafes') {
            customizeBtn.href = '#/customize/cafes';
        } else if (hash === '/hotels') {
            customizeBtn.href = '#/customize/hotels';
        } else if (hash === '/localities' || hash === '/' || hash === '') {
            customizeBtn.href = '#/customize';
        } else {
            customizeBtn.href = '#/customize';
        }
    }
}

// Set up routing
window.addEventListener('hashchange', route);
window.addEventListener('load', route);
