// Detail View - Show all metrics for a single locality
async function renderDetailView(localityName) {
    console.log('[Debug] renderDetailView START', localityName);
    const app = document.getElementById('app');

    try {
        // Load rankings data which contains everything (scores + raw data)
        console.log('[Debug] Calling loadRankings...');
        const rankingsData = await loadRankings();
        console.log('[Debug] loadRankings result:', rankingsData ? 'Success' : 'Failed');

        if (!rankingsData) {
            console.error('[Debug] Rankings data is null/undefined');
            app.innerHTML = '<div class="error">Failed to load data. Please refresh.</div>';
            return;
        }

        // Find locality in all_rankings or top_10
        // We'll search in all_rankings if available, otherwise just top_10 (but rankings.json structure usually has top_10)
        // Actually, let's look at available data arrays
        const allLocalities = rankingsData.all_rankings || rankingsData.top_10 || [];
        console.log('[Debug] Searching in', allLocalities.length, 'localities');


        const rankedLocality = allLocalities.find(loc => loc.name === localityName);
        console.log('[Debug] Found ranked locality:', rankedLocality);

        if (!rankedLocality) {
            console.error('[Debug] Locality not found in rankings');
            app.innerHTML = '<div class="error">Locality not found.</div>';
            return;
        }

        // The rankedLocality object has nested structure:
        // { 
        //   overall_score: 6.37, 
        //   data: { ... raw metrics ... }
        // }
        // We merge them for easier access
        const locality = {
            ...rankedLocality.data,
            ...rankedLocality,
            data: undefined
        };

        console.log('[Debug] Locality Merged:', locality);
        console.log('[Debug] Coordinates:', locality.latitude, locality.longitude);
        console.log('[Debug] Data Source:', rankedLocality.data ? 'Has Data Object' : 'No Data Object');


        const categoryIcon = locality.category_icon || '🏘️';
        const primaryCategory = locality.primary_category || 'Residential';
        const tags = locality.tags || [];

        console.log('[Debug] Building HTML...');

        // Helper for N/A handling
        const val = (v, f) => (v !== undefined && v !== null) ? (f ? v.toFixed(f) : v) : 'N/A';

        // Helper for Count formatting (Google API limit is 20)
        const formatCount = (v) => {
            if (v === undefined || v === null) return '0';
            return v >= 20 ? '20+' : v;
        };

        let html = `

        <div class="detail-header">
                <a href="#/" class="back-button">← Back to Rankings</a>
                <div class="detail-hero-map" id="detail-map-hero" style="width: 100%; height: 350px; border-radius: 12px; margin-top: 1rem; margin-bottom: 1rem; z-index: 1;"></div>
                <div class="detail-title">
                    <span class="category-icon-large">${categoryIcon}</span>
                    <div>
                        <h1>${locality.name}</h1>
                        <p class="category-label-large">${primaryCategory}</p>
                    </div>
                </div>
                <!-- ... existing header content ... -->
                <div class="tags-container-large">
                    ${tags.map(tag => `<span class="tag-large">${tag}</span>`).join('')}
                </div>
            </div>
            
            <div class="detail-grid">
                <!-- Left column: Scores and key metrics -->
                <div class="detail-main">
                    <!-- ... existing content ... -->
                    <div class="metric-card">
                        <h3>📊 Overall Score</h3>
                        <div class="score-display">${val(locality.overall_score, 2)}</div>
                    </div>
                    
                    <div class="metric-card">
                        <h3>🏘️ Quality of Life</h3>
                        <div class="score-display">${val(locality.qol_score, 1)}/10</div>
                        <div class="score-bar-large">
                            <div class="score-fill qol" style="width: ${(locality.qol_score / 10) * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <h3>💰 Economic Value</h3>
                        <div class="score-display">${val(locality.economic_score, 1)}/10</div>
                        <div class="score-bar-large">
                            <div class="score-fill economic" style="width: ${(locality.economic_score / 10) * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <h3>🌱 Environment & Charm</h3>
                        <div class="score-display">${val(locality.sustainability_score, 1)}/10</div>
                        <div class="score-bar-large">
                            <div class="score-fill sustainability" style="width: ${(locality.sustainability_score / 10) * 100}%"></div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <h3>💵 Real Estate Prices</h3>
                        <div class="price-grid">
                            <div>
                                <div class="price-label">Land</div>
                                <div class="price-value">₹${val(locality.land_price_per_cent_lakhs || locality.land_price)}L/cent</div>
                            </div>
                            <div>
                                <div class="price-label">Apartment</div>
                                <div class="price-value">₹${val(locality.apartment_price_per_sqft || locality.apartment_price)}/sqft</div>
                            </div>
                        </div>
                        ${locality.confidence ? `<div class="confidence-badge">Confidence: ${locality.confidence}</div>` : ''}
                    </div>
                    
                    <div class="metric-card">
                        <h3>🚗 Travel Times</h3>
                        <div class="travel-grid">
                            <div><span>City Centre:</span> <strong>${val(locality.city_centre_time)} min</strong></div>
                            <div><span>Technopark:</span> <strong>${val(locality.technopark_time)} min</strong></div>
                            <div><span>Airport:</span> <strong>${val(locality.airport_time)} min</strong></div>
                            <div><span>Medical College:</span> <strong>${val(locality.medical_college_time)} min</strong></div>
                        </div>
                    </div>
                </div>
                
                <!-- Right column: All 41 metrics -->
                <div class="detail-metrics">
                    <h3>📋 All Metrics (41 total)</h3>
                    
                    <div class="metrics-section">
                        <h4>🏢 Amenities (Counts)</h4>
                        <div class="metric-list">
                            <div class="metric-item"><span>Schools:</span> <strong>${formatCount(locality.schools_count)}</strong></div>
                            <div class="metric-item"><span>Hospitals:</span> <strong>${formatCount(locality.hospitals_count)}</strong></div>
                            <div class="metric-item"><span>Restaurants:</span> <strong>${formatCount(locality.restaurants_count)}</strong></div>
                            <div class="metric-item"><span>Cafes:</span> <strong>${formatCount(locality.cafes_count)}</strong></div>
                            <div class="metric-item"><span>Supermarkets:</span> <strong>${formatCount(locality.supermarkets_count)}</strong></div>
                            <div class="metric-item"><span>Gyms:</span> <strong>${formatCount(locality.gyms_count)}</strong></div>
                            <div class="metric-item"><span>Parks:</span> <strong>${formatCount(locality.parks_count)}</strong></div>
                            <div class="metric-item"><span>Pharmacies:</span> <strong>${formatCount(locality.pharmacies_count)}</strong></div>
                            <div class="metric-item"><span>Police Stations:</span> <strong>${formatCount(locality.police_stations_count)}</strong></div>
                            <div class="metric-item"><span>Fire Stations:</span> <strong>${formatCount(locality.fire_stations_count)}</strong></div>
                        </div>
                    </div>
                    
                    <div class="metrics-section">
                        <h4>🚌 Accessibility (AI Scores 1-5)</h4>
                        <div class="metric-list">
                            <div class="metric-item"><span>Public Transport:</span> <strong>${val(locality.public_transport)}</strong></div>
                            <div class="metric-item"><span>Road Quality:</span> <strong>${val(locality.road_quality)}</strong></div>
                            <div class="metric-item"><span>Proximity to Junctions:</span> <strong>${val(locality.proximity_junctions)}</strong></div>
                        </div>
                    </div>
                    
                    <div class="metrics-section">
                        <h4>🛡️ Safety & Security</h4>
                        <div class="metric-list">
                            <div class="metric-item"><span>Overall Safety:</span> <strong>${val(locality.safety_score)}</strong></div>
                            <div class="metric-item"><span>Street Lighting:</span> <strong>${val(locality.street_lighting)}</strong></div>
                            <div class="metric-item"><span>Women's Safety:</span> <strong>${val(locality.women_safety)}</strong></div>
                        </div>
                    </div>
                    
                    <div class="metrics-section">
                        <h4>🏥 Healthcare & Education</h4>
                        <div class="metric-list">
                            <div class="metric-item"><span>Healthcare Quality:</span> <strong>${val(locality.healthcare_quality)}</strong></div>
                            <div class="metric-item"><span>School Reputation:</span> <strong>${val(locality.school_reputation)}</strong></div>
                        </div>
                    </div>
                    
                    <div class="metrics-section">
                        <h4>🚰 Utilities & Services</h4>
                        <div class="metric-list">
                            <div class="metric-item"><span>Water Supply:</span> <strong>${val(locality.water_supply)}</strong></div>
                            <div class="metric-item"><span>Waste Collection:</span> <strong>${val(locality.waste_collection)}</strong></div>
                            <div class="metric-item"><span>Drainage:</span> <strong>${val(locality.drainage)}</strong></div>
                            <div class="metric-item"><span>Cleanliness:</span> <strong>${val(locality.cleanliness)}</strong></div>
                        </div>
                    </div>
                    
                    <div class="metrics-section">
                        <h4>🌳 Environment</h4>
                        <div class="metric-list">
                            <div class="metric-item"><span>Air Quality:</span> <strong>${val(locality.air_quality)}</strong></div>
                            <div class="metric-item"><span>Noise Level:</span> <strong>${val(locality.noise_level)}</strong></div>
                            <div class="metric-item"><span>Flooding Risk:</span> <strong>${val(locality.flooding_risk)}</strong></div>
                            <div class="metric-item"><span>Green Cover:</span> <strong>${val(locality.green_cover)}</strong></div>
                        </div>
                    </div>
                    
                    <div class="metrics-section">
                        <h4>🏛️ Urban Character</h4>
                        <div class="metric-list">
                            <div class="metric-item"><span>Prestige:</span> <strong>${val(locality.prestige)}</strong></div>
                            <div class="metric-item"><span>Infrastructure Feel:</span> <strong>${val(locality.infrastructure_feel)}</strong></div>
                        </div>
                    </div>
                    
                    <div class="metrics-section">
                        <h4>💼 Economic Activity</h4>
                        <div class="metric-list">
                            <div class="metric-item"><span>Commercial Vibrancy:</span> <strong>${val(locality.commercial_activity)}</strong></div>
                            <div class="metric-item"><span>Job Proximity:</span> <strong>${val(locality.job_proximity)}</strong></div>
                        </div>
                    </div>
                    
                    <div class="metrics-section">
                        <h4>🚀 Future Potential</h4>
                        <div class="metric-list">
                            <div class="metric-item"><span>Smart City Projects:</span> <strong>${val(locality.smart_city_projects)}</strong></div>
                            <div class="metric-item"><span>Developer Activity:</span> <strong>${val(locality.developer_activity)}</strong></div>
                        </div>
                    </div>
                    
                    ${locality.evidence ? `
                    <div class="metrics-section">
                        <h4>📝 AI Analysis Evidence</h4>
                        <p class="evidence-text">${locality.evidence}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        console.log('[Debug] Setting app.innerHTML...');
        app.innerHTML = html;
        console.log('[Debug] renderDetailView COMPLETE');

        // Initialize Leaflet Map for Hero Section
        const lat = locality.latitude;
        const lng = locality.longitude;
        console.log('[Debug] Map Coords:', lat, lng);

        if (lat && lng) {
            const map = L.map('detail-map-hero').setView([lat, lng], 14);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);

            L.marker([lat, lng]).addTo(map)
                .bindPopup(`<b>${locality.name}</b>`)
                .openPopup();
        } else {
            console.warn('[Debug] No coordinates available for map');
        }

        // --- TRACKING ---
        // Log this view to Supabase for the Recommendation Engine
        if (window.trackLocalityView) {
            console.log('[Supabase] Tracking view for:', locality.name);
            window.trackLocalityView(locality.name);
        } else {
            console.warn('[Supabase] trackLocalityView function not found');
        }

    } catch (err) {
        console.error('[Debug] Error in renderDetailView:', err);
        app.innerHTML = `<div class="error">JavaScript Error: ${err.message}</div>`;
    }
}
