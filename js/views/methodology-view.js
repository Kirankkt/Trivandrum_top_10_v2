// Methodology View - Explain the objective ranking system for ALL categories
async function renderMethodologyView() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="methodology-page">
            <!-- Hero -->
            <section class="methodology-hero">
                <h1>Our Methodology</h1>
                <p class="hero-subtitle">100% Objective, API-Sourced, Verifiable Data</p>
            </section>

            <div class="methodology-content">
                <!-- Category Tabs -->
                <div class="methodology-tabs">
                    <button class="methodology-tab active" data-tab="localities">Localities</button>
                    <button class="methodology-tab" data-tab="restaurants">Dining</button>
                    <button class="methodology-tab" data-tab="shopping">Shopping</button>
                    <button class="methodology-tab" data-tab="culture">Culture</button>
                    <button class="methodology-tab" data-tab="services">Services</button>
                </div>

                <!-- LOCALITIES TAB -->
                <div class="methodology-tab-content active" id="localities-tab">
                    <section class="methodology-section">
                        <h2>Locality Rankings Overview</h2>
                        <p>Our locality rankings are based entirely on <strong>objective, API-sourced data</strong>. 
                        We do not use AI-generated scores, subjective ratings, or editorial opinions.</p>
                        
                        <div class="highlight-box">
                            <strong>Key Principle:</strong> Every data point comes from a verifiable API source with explicit formulas.
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Data Sources</h2>
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

                    <section class="methodology-section">
                        <h2>Scoring Categories (6 Metrics)</h2>
                        <p>The overall score (0-10) is a weighted average of 6 categories:</p>
                        
                        <div class="categories-breakdown">
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Accessibility <span class="weight-badge">20%</span></h3>
                                    <p>Travel times to Technopark, City Centre, Secretariat, Airport, KSRTC Stand</p>
                                    <code>Score = 10 - (travel_time / 6)</code>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Amenities <span class="weight-badge">25%</span></h3>
                                    <p>Schools, hospitals, supermarkets, pharmacies, restaurants, gyms</p>
                                    <code>Score = (count × 0.6) + (avg_rating × 0.4)</code>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Safety <span class="weight-badge">15%</span></h3>
                                    <p>Police stations and fire stations within 5km radius</p>
                                    <code>Score = (police × 0.7) + (fire × 0.3)</code>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Environment <span class="weight-badge">15%</span></h3>
                                    <p>Parks, noise level (distance from major roads), flood safety (elevation)</p>
                                    <code>Score = (green × 0.4) + (noise × 0.3) + (flood × 0.3)</code>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Economy <span class="weight-badge">15%</span></h3>
                                    <p>Job proximity (weighted travel to employment hubs), commercial activity</p>
                                    <code>Score = (jobs × 0.5) + (commercial × 0.3) + (developer × 0.2)</code>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Prestige <span class="weight-badge">10%</span></h3>
                                    <p>Real estate market value (Land Price per cent + Apartment Price per sqft)</p>
                                    <code>Score = Percentile(Land Price) + Percentile(Apartment Price)</code>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- DINING TAB (Restaurants, Cafes, Hotels) -->
                <div class="methodology-tab-content" id="restaurants-tab">
                    <section class="methodology-section">
                        <h2>Dining & Stay Rankings</h2>
                        <p>Rankings for <strong>Restaurants, Cafes, and Hotels</strong> use 6 metrics each,
                        with quality thresholds to ensure reliable data.</p>

                        <div class="highlight-box">
                            <strong>Quality Threshold:</strong> Minimum 50 reviews and 3.8 rating required for inclusion.
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Scoring (6 Metrics)</h2>

                        <div class="categories-breakdown">
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Sentiment <span class="weight-badge">~17%</span></h3>
                                    <p>Positive review sentiment analysis</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Popularity <span class="weight-badge">~17%</span></h3>
                                    <p>Review count (logarithmic scale)</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Rating <span class="weight-badge">~17%</span></h3>
                                    <p>Google Maps rating (1-5 stars)</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Value <span class="weight-badge">~17%</span></h3>
                                    <p>Quality relative to price level</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Convenience <span class="weight-badge">~16%</span></h3>
                                    <p>Location accessibility</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Vibe/Special <span class="weight-badge">~16%</span></h3>
                                    <p>Restaurants: Ambiance | Cafes: Work-friendly | Hotels: Luxury</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- SHOPPING TAB -->
                <div class="methodology-tab-content" id="shopping-tab">
                    <section class="methodology-section">
                        <h2>Shopping Rankings</h2>
                        <p>Rankings for <strong>Malls, Boutiques, and Specialty Shops</strong> use 3 core metrics.</p>

                        <div class="highlight-box">
                            <strong>Quality Threshold:</strong> Minimum 50 reviews required for inclusion.
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Scoring (3 Metrics)</h2>

                        <div class="categories-breakdown">
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Rating <span class="weight-badge">~34%</span></h3>
                                    <p>Google Maps rating (1-5 stars)</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Popularity <span class="weight-badge">~33%</span></h3>
                                    <p>Number of reviews indicating foot traffic</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Sentiment <span class="weight-badge">~33%</span></h3>
                                    <p>Positive review sentiment</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- CULTURE TAB -->
                <div class="methodology-tab-content" id="culture-tab">
                    <section class="methodology-section">
                        <h2>Culture Rankings</h2>
                        <p>Rankings for <strong>Museums and Religious Sites</strong> use 3 core metrics.</p>

                        <div class="highlight-box">
                            <strong>Quality Threshold:</strong> Minimum 50 reviews required for inclusion.
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Scoring (3 Metrics)</h2>

                        <div class="categories-breakdown">
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Rating <span class="weight-badge">~34%</span></h3>
                                    <p>Google Maps rating (1-5 stars)</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Popularity <span class="weight-badge">~33%</span></h3>
                                    <p>Visitor reviews and foot traffic</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Sentiment <span class="weight-badge">~33%</span></h3>
                                    <p>Positive visitor experience</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- SERVICES TAB -->
                <div class="methodology-tab-content" id="services-tab">
                    <section class="methodology-section">
                        <h2>Services Rankings</h2>
                        <p>Rankings for <strong>Healthcare and Education</strong> use 3 core metrics.</p>

                        <div class="highlight-box warning-box">
                            <strong>Important Disclaimer:</strong> These rankings are based on Google reviews reflecting
                            <em>patient/student experience</em>, not clinical outcomes or academic performance.
                            A friendly receptionist can boost a clinic's ranking; board exam results don't affect school rankings.
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Scoring (3 Metrics)</h2>

                        <div class="categories-breakdown">
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Rating <span class="weight-badge">~34%</span></h3>
                                    <p>Google Maps rating (1-5 stars)</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Popularity <span class="weight-badge">~33%</span></h3>
                                    <p>Number of reviews</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Sentiment <span class="weight-badge">~33%</span></h3>
                                    <p>Patient/student satisfaction from reviews</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>What These Rankings Measure</h2>
                        <div class="sources-grid">
                            <div class="source-card">
                                <h3>Healthcare</h3>
                                <p><strong>Measures:</strong> Staff friendliness, wait times, facility cleanliness, appointment ease</p>
                                <p><strong>Does NOT measure:</strong> Medical expertise, treatment success rates, clinical outcomes</p>
                            </div>
                            <div class="source-card">
                                <h3>Education</h3>
                                <p><strong>Measures:</strong> Campus experience, facilities, student satisfaction</p>
                                <p><strong>Does NOT measure:</strong> Board exam results, placement rates, academic rigor</p>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Common Footer -->
                <section class="methodology-section methodology-footer">
                    <h2>Full Transparency</h2>
                    <p>All data collection scripts and formulas are open source. Customize weights 
                    from each category's dedicated page to match your personal priorities.</p>
                    
                    <div class="cta-buttons">
                        <a href="#/" class="btn-primary"><span class="ui-arrow-left"></span> Back to Home</a>
                    </div>
                </section>
            </div>
        </div>
    `;

    // Tab switching logic
    const tabs = document.querySelectorAll('.methodology-tab');
    const contents = document.querySelectorAll('.methodology-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Add active to clicked tab
            tab.classList.add('active');
            const targetId = `${tab.dataset.tab}-tab`;
            document.getElementById(targetId).classList.add('active');
        });
    });

    window.scrollTo(0, 0);
}
