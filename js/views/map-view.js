// Map View - Interactive Map of All Localities
async function renderMapView() {
    const app = document.getElementById('app');

    // Load data
    const rankingsData = await loadRankings();
    if (!rankingsData) {
        app.innerHTML = '<div class="error">Failed to load data. Please refresh.</div>';
        return;
    }

    const localities = rankingsData.all_rankings;

    // Create map container
    app.innerHTML = `
    <div class="map-page">
      <div class="map-sidebar">
        <h2>Localities</h2>
        <p class="map-subtitle">Click a locality to view details</p>
        <div class="map-filters">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="top5">Top 5</button>
          <button class="filter-btn" data-filter="top10">Top 10</button>
        </div>
        <div class="localities-list">
          ${localities.map((loc, i) => `
            <div class="map-locality-item" data-locality="${loc.name}" data-rank="${i + 1}">
              <span class="map-rank">#${i + 1}</span>
              <span class="map-loc-name">${loc.name}</span>
              <span class="map-loc-score">${loc.overall_score?.toFixed(1) || 'N/A'}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="map-container">
        <div id="localities-map"></div>
      </div>
    </div>
  `;

    // Initialize Leaflet map centered on Trivandrum
    const map = L.map('localities-map').setView([8.5241, 76.9366], 12);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Custom marker icon
    const createMarkerIcon = (rank) => {
        const color = rank <= 3 ? '#00aa6c' : rank <= 10 ? '#2d2d44' : '#757575';
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
        background: ${color};
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">#${rank}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    };

    // Add markers for each locality
    const markers = [];
    localities.forEach((loc, index) => {
        const lat = loc.latitude || loc.data?.latitude;
        const lng = loc.longitude || loc.data?.longitude;

        if (lat && lng) {
            const marker = L.marker([lat, lng], { icon: createMarkerIcon(index + 1) })
                .addTo(map)
                .bindPopup(`
          <div style="text-align: center; min-width: 150px;">
            <strong style="font-size: 14px;">${loc.name}</strong><br>
            <span style="color: #00aa6c; font-size: 18px; font-weight: bold;">
              ${loc.overall_score?.toFixed(1) || 'N/A'}/10
            </span><br>
            <small>Rank #${index + 1}</small><br>
            <a href="#/locality/${encodeURIComponent(loc.name)}" 
               style="color: #00aa6c; font-weight: 500;">
              View Details →
            </a>
          </div>
        `);

            markers.push({ marker, rank: index + 1, name: loc.name, lat, lng });
        }
    });

    // Sidebar locality item clicks
    document.querySelectorAll('.map-locality-item').forEach(item => {
        item.addEventListener('click', () => {
            const name = item.dataset.locality;
            const found = markers.find(m => m.name === name);
            if (found) {
                map.setView([found.lat, found.lng], 14);
                found.marker.openPopup();
            }
        });
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            const items = document.querySelectorAll('.map-locality-item');

            items.forEach(item => {
                const rank = parseInt(item.dataset.rank);
                if (filter === 'all' ||
                    (filter === 'top5' && rank <= 5) ||
                    (filter === 'top10' && rank <= 10)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Fit map to show all markers
    if (markers.length > 0) {
        const group = new L.featureGroup(markers.map(m => m.marker));
        map.fitBounds(group.getBounds().pad(0.1));
    }
}
