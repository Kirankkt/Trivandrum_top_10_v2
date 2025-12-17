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
    } else if (hash === '/map') {
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
