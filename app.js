// Simple Router
function route() {
    const hash = window.location.hash.slice(1) || '/';
    console.log('[Debug] Route called. Hash:', hash);
    const app = document.getElementById('app');

    // Handle different routes
    if (hash === '/' || hash === '') {
        console.log('[Debug] Routing to Rankings');
        renderRankingView();
    } else if (hash === '/customize') {
        console.log('[Debug] Routing to Customize');
        renderCustomizeView();
    } else if (hash === '/methodology') {
        console.log('[Debug] Routing to Methodology');
        renderMethodologyView();
    } else if (hash === '/map') {
        console.log('[Debug] Routing to Map');
        renderMapView();
    } else if (hash === '/restaurants') {
        app.innerHTML = `
          <div class="coming-soon">
            <h1>🍽️ Restaurants</h1>
            <p>Top 10 restaurants in Trivandrum coming soon!</p>
            <a href="#/" class="btn-primary">← Back to Localities</a>
          </div>`;
    } else if (hash === '/hotels') {
        app.innerHTML = `
          <div class="coming-soon">
            <h1>🏨 Hotels</h1>
            <p>Top 10 hotels in Trivandrum coming soon!</p>
            <a href="#/" class="btn-primary">← Back to Localities</a>
          </div>`;
    } else if (hash === '/cafes') {
        app.innerHTML = `
          <div class="coming-soon">
            <h1>☕ Cafes</h1>
            <p>Top 10 cafes in Trivandrum coming soon!</p>
            <a href="#/" class="btn-primary">← Back to Localities</a>
          </div>`;
    } else if (hash === '/experiences') {
        app.innerHTML = `
          <div class="coming-soon">
            <h1>🎭 Experiences</h1>
            <p>Top experiences in Trivandrum coming soon!</p>
            <a href="#/" class="btn-primary">← Back to Localities</a>
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
}

// Set up routing
window.addEventListener('hashchange', route);
window.addEventListener('load', route);
