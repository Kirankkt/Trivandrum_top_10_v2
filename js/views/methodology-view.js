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
                    <button class="methodology-tab" data-tab="restaurants">Restaurants</button>
                    <button class="methodology-tab" data-tab="cafes">Cafes</button>
                    <button class="methodology-tab" data-tab="hotels">Hotels</button>
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
                                <div class="category-icon">🚗</div>
                                <div class="category-details">
                                    <h3>Accessibility <span class="weight-badge">20%</span></h3>
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
                                    <h3>Economy <span class="weight-badge">15%</span></h3>
                                    <p>Job proximity (weighted travel to employment hubs), commercial activity</p>
                                    <code>Score = (jobs × 0.5) + (commercial × 0.3) + (developer × 0.2)</code>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon">👑</div>
                                <div class="category-details">
                                    <h3>Prestige <span class="weight-badge">10%</span></h3>
                                    <p>Real estate market value (Land Price per cent + Apartment Price per sqft)</p>
                                    <code>Score = Percentile(Land Price) + Percentile(Apartment Price)</code>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- RESTAURANTS TAB -->
                <div class="methodology-tab-content" id="restaurants-tab">
                    <section class="methodology-section">
                        <h2>Restaurant Rankings Overview</h2>
                        <p>Our restaurant rankings combine <strong>Google Maps data</strong> with <strong>sentiment analysis</strong> 
                        to surface the best dining experiences in Trivandrum.</p>
                        
                        <div class="highlight-box">
                            <strong>Data Source:</strong> Google Places API for restaurant data, reviews, ratings, and photos.
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Scoring Categories (6 Metrics)</h2>
                        <p>The Foodie Score (0-100) is calculated from 6 weighted metrics:</p>
                        
                        <div class="categories-breakdown">
                            <div class="category-row">
                                <div class="category-icon">💬</div>
                                <div class="category-details">
                                    <h3>Sentiment Score <span class="weight-badge">~17%</span></h3>
                                    <p>Analysis of review text for positive dining experiences</p>
                                    <code>Score = Positive sentiment percentage from review analysis</code>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon">👥</div>
                                <div class="category-details">
                                    <h3>Popularity <span class="weight-badge">~17%</span></h3>
                                    <p>Number of reviews and visits indicating popularity</p>
                                    <code>Score = min(reviews / 100, 100)</code>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon">⭐</div>
                                <div class="category-details">
                                    <h3>Rating <span class="weight-badge">~17%</span></h3>
                                    <p>Google Maps rating (1-5 stars)</p>
                                    <code>Score = rating × 20</code>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon">💰</div>
                                <div class="category-details">
                                    <h3>Value <span class="weight-badge">~17%</span></h3>
                                    <p>Price relative to quality (inverse of price level)</p>
                                    <code>Score = (5 - price_level) × 25</code>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon">📍</div>
                                <div class="category-details">
                                    <h3>Convenience <span class="weight-badge">~16%</span></h3>
                                    <p>Central location accessibility</p>
                                    <code>Score = Proximity to city center</code>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon">✨</div>
                                <div class="category-details">
                                    <h3>Vibe <span class="weight-badge">~16%</span></h3>
                                    <p>Ambiance and atmosphere extracted from reviews</p>
                                    <code>Score = Number of vibe tags × 20</code>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Vibe Tags</h2>
                        <p>We extract vibe tags from reviews to help you find the right atmosphere:</p>
                        <div class="vibe-tags-grid">
                            <span class="vibe-example">Romantic</span>
                            <span class="vibe-example">Family Friendly</span>
                            <span class="vibe-example">Trendy</span>
                            <span class="vibe-example">Authentic</span>
                            <span class="vibe-example">Hidden Gem</span>
                        </div>
                    </section>
                </div>

                <!-- CAFES TAB -->
                <div class="methodology-tab-content" id="cafes-tab">
                    <section class="methodology-section">
                        <h2>Cafe Rankings Overview</h2>
                        <p>Our cafe rankings are optimized for <strong>coffee lovers and remote workers</strong>, 
                        with special emphasis on work-friendly environments.</p>
                        
                        <div class="highlight-box">
                            <strong>Data Source:</strong> Google Places API for cafe data, plus work-friendly indicators from reviews.
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Scoring Categories (6 Metrics)</h2>
                        <p>The Cafe Score (0-100) includes a unique "Work Friendly" metric:</p>
                        
                        <div class="categories-breakdown">
                            <div class="category-row">
                                <div class="category-icon">💬</div>
                                <div class="category-details">
                                    <h3>Sentiment Score <span class="weight-badge">~17%</span></h3>
                                    <p>Positive review sentiment for cafe experience</p>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon">👥</div>
                                <div class="category-details">
                                    <h3>Popularity <span class="weight-badge">~17%</span></h3>
                                    <p>Review count and visit frequency</p>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon">⭐</div>
                                <div class="category-details">
                                    <h3>Rating <span class="weight-badge">~17%</span></h3>
                                    <p>Google Maps rating (1-5 stars)</p>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon">💰</div>
                                <div class="category-details">
                                    <h3>Value <span class="weight-badge">~17%</span></h3>
                                    <p>Coffee and snack prices relative to quality</p>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon">📍</div>
                                <div class="category-details">
                                    <h3>Convenience <span class="weight-badge">~16%</span></h3>
                                    <p>Location accessibility and parking</p>
                                </div>
                            </div>

                            <div class="category-row highlight-row">
                                <div class="category-icon">💻</div>
                                <div class="category-details">
                                    <h3>Work Friendly <span class="weight-badge">~16%</span></h3>
                                    <p>WiFi availability, power outlets, quiet environment for work</p>
                                    <code>Score = Work-friendly mentions in reviews</code>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- HOTELS TAB -->
                <div class="methodology-tab-content" id="hotels-tab">
                    <section class="methodology-section">
                        <h2>Hotel Rankings Overview</h2>
                        <p>Our hotel rankings help travelers find the <strong>best stays in Trivandrum</strong>, 
                        from budget-friendly to luxury options.</p>
                        
                        <div class="highlight-box">
                            <strong>Data Source:</strong> Google Places API for hotel data, amenities, and guest reviews.
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Scoring Categories (6 Metrics)</h2>
                        <p>The Stay Score (0-100) emphasizes location and luxury:</p>
                        
                        <div class="categories-breakdown">
                            <div class="category-row">
                                <div class="category-icon">💬</div>
                                <div class="category-details">
                                    <h3>Sentiment Score <span class="weight-badge">~17%</span></h3>
                                    <p>Guest satisfaction from review analysis</p>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon">👥</div>
                                <div class="category-details">
                                    <h3>Popularity <span class="weight-badge">~17%</span></h3>
                                    <p>Number of reviews and bookings</p>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon">⭐</div>
                                <div class="category-details">
                                    <h3>Rating <span class="weight-badge">~17%</span></h3>
                                    <p>Google Maps rating (1-5 stars)</p>
                                </div>
                            </div>
                            
                            <div class="category-row">
                                <div class="category-icon">💰</div>
                                <div class="category-details">
                                    <h3>Value <span class="weight-badge">~17%</span></h3>
                                    <p>Price relative to amenities and service</p>
                                </div>
                            </div>
                            
                            <div class="category-row highlight-row">
                                <div class="category-icon">📍</div>
                                <div class="category-details">
                                    <h3>Location <span class="weight-badge">~16%</span></h3>
                                    <p>Proximity to tourist attractions, beaches, city center</p>
                                    <code>Score = Distance to key attractions</code>
                                </div>
                            </div>

                            <div class="category-row highlight-row">
                                <div class="category-icon">🏆</div>
                                <div class="category-details">
                                    <h3>Luxury <span class="weight-badge">~16%</span></h3>
                                    <p>Premium amenities: pool, spa, restaurant, room service</p>
                                    <code>Score = Amenity count + price level indicator</code>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Common Footer -->
                <section class="methodology-section methodology-footer">
                    <h2>Full Transparency</h2>
                    <p>All data collection scripts and formulas are open source. You can customize the weights 
                    for any category to match your personal priorities.</p>
                    
                    <div class="cta-buttons">
                        <a href="#/" class="btn-primary">← Back to Home</a>
                        <a href="#/customize" class="btn-secondary">Customize Locality Weights</a>
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
