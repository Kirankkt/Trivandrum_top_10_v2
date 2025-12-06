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
