// Methodology View - Explain the objective ranking system
async function renderMethodologyView() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="methodology-page">
            <!-- Hero -->
            <section class="methodology-hero">
                <h1>📊 Our Methodology</h1>
                <p class="hero-subtitle">100% Objective, API-Sourced, Verifiable Data</p>
            </section>

            <div class="methodology-content">
                <!-- Overview -->
                <section class="methodology-section">
                    <h2>🎯 Overview</h2>
                    <p>Our locality rankings are based entirely on <strong>objective, API-sourced data</strong>. 
                    We do not use AI-generated scores, subjective ratings, or editorial opinions.</p>
                    
                    <div class="highlight-box">
                        <strong>Key Principle:</strong> Every data point comes from a verifiable API source with explicit formulas.
                    </div>
                </section>

                <!-- Data Sources -->
                <section class="methodology-section">
                    <h2>📡 Data Sources</h2>
                    <div class="sources-grid">
                        <div class="source-card">
                            <h3>Google Distance Matrix API</h3>
                            <p>Travel times to key destinations (Technopark, City Centre, Airport)</p>
                        </div>
                        <div class="source-card">
                            <h3>Google Places API</h3>
                            <p>Nearby amenities: schools, hospitals, banks, parks, restaurants + their Google ratings</p>
                        </div>
                        <div class="source-card">
                            <h3>Google Elevation API</h3>
                            <p>Altitude data for flood risk assessment</p>
                        </div>
                        <div class="source-card">
                            <h3>OpenAQ API</h3>
                            <p>Air quality (PM2.5) where monitoring stations exist</p>
                        </div>
                    </div>
                </section>

                <!-- Scoring Categories -->
                <section class="methodology-section">
                    <h2>⚖️ Scoring Categories</h2>
                    <p>The overall score (0-10) is a weighted average of 5 categories:</p>
                    
                    <div class="categories-breakdown">
                        <div class="category-row">
                            <div class="category-icon">🚗</div>
                            <div class="category-details">
                                <h3>Accessibility <span class="weight-badge">25%</span></h3>
                                <p>Travel times to Technopark, City Centre, Secretariat, Airport, KSRTC Stand</p>
                                <code>Score = 10 - (travel_time / 6)</code>
                            </div>
                        </div>
                        
                        <div class="category-row">
                            <div class="category-icon">🏫</div>
                            <div class="category-details">
                                <h3>Amenities <span class="weight-badge">25%</span></h3>
                                <p>Schools, hospitals, supermarkets, pharmacies, restaurants, gyms</p>
                                <code>Score = (count × 0.6) + (avg_rating × 0.4)</code>
                            </div>
                        </div>
                        
                        <div class="category-row">
                            <div class="category-icon">🛡️</div>
                            <div class="category-details">
                                <h3>Safety <span class="weight-badge">15%</span></h3>
                                <p>Police stations and fire stations within 5km radius</p>
                                <code>Score = (police × 0.7) + (fire × 0.3)</code>
                            </div>
                        </div>
                        
                        <div class="category-row">
                            <div class="category-icon">🌳</div>
                            <div class="category-details">
                                <h3>Environment <span class="weight-badge">15%</span></h3>
                                <p>Parks, noise level (distance from major roads), flood safety (elevation)</p>
                                <code>Score = (green × 0.4) + (noise × 0.3) + (flood × 0.3)</code>
                            </div>
                        </div>
                        
                        <div class="category-row">
                            <div class="category-icon">💼</div>
                            <div class="category-details">
                                <h3>Economy <span class="weight-badge">20%</span></h3>
                                <p>Job proximity (weighted travel to employment hubs), commercial activity, developer presence</p>
                                <code>Score = (jobs × 0.5) + (commercial × 0.3) + (developer × 0.2)</code>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- What We DON'T Use -->
                <section class="methodology-section">
                    <h2>🚫 What We Exclude</h2>
                    <p>These metrics were intentionally removed due to lack of objective data:</p>
                    <ul class="excluded-list">
                        <li><strong>Road Quality</strong> - OpenStreetMap data too sparse in India</li>
                        <li><strong>Women's Safety</strong> - No public survey or crime data available</li>
                        <li><strong>Water/Electricity Supply</strong> - No public utility data APIs</li>
                        <li><strong>Prestige/Brand Value</strong> - Inherently subjective</li>
                        <li><strong>Cleanliness</strong> - Would require subjective assessment</li>
                    </ul>
                </section>

                <!-- Transparency -->
                <section class="methodology-section">
                    <h2>🔍 Full Transparency</h2>
                    <p>All data collection scripts and formulas are open source:</p>
                    <ul>
                        <li><code>collect_objective_data.py</code> - Fetches raw data from APIs</li>
                        <li><code>objective_scoring_engine.py</code> - Calculates scores with explicit formulas</li>
                        <li><code>objective_rankings.json</code> - Full breakdown for every locality</li>
                    </ul>
                    
                    <div class="cta-buttons">
                        <a href="#/" class="btn-primary">← Back to Rankings</a>
                        <a href="#/customize" class="btn-secondary">Customize Weights</a>
                    </div>
                </section>
            </div>
        </div>
    `;

    window.scrollTo(0, 0);
}
