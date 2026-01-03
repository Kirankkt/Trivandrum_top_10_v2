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
                    <button class="methodology-tab" data-tab="dining">Dining</button>
                    <button class="methodology-tab" data-tab="shopping">Shopping</button>
                    <button class="methodology-tab" data-tab="culture">Culture</button>
                    <button class="methodology-tab" data-tab="nature">Nature</button>
                    <button class="methodology-tab" data-tab="sports">Sports</button>
                    <button class="methodology-tab" data-tab="wellness">Wellness</button>
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
                                    <code>Score = (count x 0.6) + (avg_rating x 0.4)</code>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Safety <span class="weight-badge">15%</span></h3>
                                    <p>Police stations and fire stations within 5km radius</p>
                                    <code>Score = (police x 0.7) + (fire x 0.3)</code>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Environment <span class="weight-badge">15%</span></h3>
                                    <p>Parks, noise level (distance from major roads), flood safety (elevation)</p>
                                    <code>Score = (green x 0.4) + (noise x 0.3) + (flood x 0.3)</code>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Economy <span class="weight-badge">15%</span></h3>
                                    <p>Job proximity (weighted travel to employment hubs), commercial activity</p>
                                    <code>Score = (jobs x 0.5) + (commercial x 0.3) + (developer x 0.2)</code>
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
                <div class="methodology-tab-content" id="dining-tab">
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
                        <p>Rankings for <strong>Malls, Clothing Stores, Supermarkets, and Specialty Shops</strong> use 3 core metrics derived from Google Places data.</p>

                        <div class="highlight-box">
                            <strong>What We Rank:</strong> Malls (9), Clothing Stores, Supermarkets, and Specialty Shops covering books, electronics, ayurvedic products, and more.
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Scoring Formula</h2>
                        <p>Each place receives a score (0-100) based on:</p>

                        <div class="categories-breakdown">
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Rating <span class="weight-badge">50%</span></h3>
                                    <p>Google Maps rating (1-5 stars), normalized to 0-50 points</p>
                                    <code>Rating Score = (rating / 5) x 50</code>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Popularity <span class="weight-badge">30%</span></h3>
                                    <p>Review count on logarithmic scale (prevents mega-chains from dominating)</p>
                                    <code>Popularity = min(30, (log10(reviews) - 1) / 2.7 x 30)</code>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Sentiment Bonus <span class="weight-badge">20%</span></h3>
                                    <p>Bonus points for exceptional ratings (4.7+: 20pts, 4.5+: 17pts, 4.3+: 14pts)</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- CULTURE TAB -->
                <div class="methodology-tab-content" id="culture-tab">
                    <section class="methodology-section">
                        <h2>Culture & Heritage Rankings</h2>
                        <p>Rankings for <strong>Landmarks, Museums, Theatres, Art Galleries, and Religious Sites</strong> use the same objective scoring system.</p>

                        <div class="highlight-box">
                            <strong>What We Rank:</strong> Historical landmarks, museums, cultural centers, performance venues (music/drama), art galleries, temples, churches, and mosques.
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Scoring Formula</h2>

                        <div class="categories-breakdown">
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Rating <span class="weight-badge">50%</span></h3>
                                    <p>Google Maps rating reflecting visitor satisfaction</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Popularity <span class="weight-badge">30%</span></h3>
                                    <p>Visitor reviews on logarithmic scale</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Sentiment Bonus <span class="weight-badge">20%</span></h3>
                                    <p>Additional points for exceptional visitor experiences</p>
                                </div>
                            </div>
                        </div>

                        <div class="highlight-box warning-box">
                            <strong>Note:</strong> Rankings reflect visitor experience and popularity, not historical significance or architectural merit which cannot be objectively measured via APIs.
                        </div>
                    </section>
                </div>

                <!-- NATURE TAB -->
                <div class="methodology-tab-content" id="nature-tab">
                    <section class="methodology-section">
                        <h2>Nature & Outdoors Rankings</h2>
                        <p>Rankings for <strong>Beaches, Wildlife Sanctuaries, and Backwaters</strong> help you discover Trivandrum's natural beauty.</p>

                        <div class="highlight-box">
                            <strong>What We Rank:</strong> Beaches along the coast, wildlife sanctuaries and nature reserves, and Kerala's famous backwater destinations accessible from Trivandrum.
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Scoring Formula</h2>

                        <div class="categories-breakdown">
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Rating <span class="weight-badge">50%</span></h3>
                                    <p>Visitor ratings reflecting experience quality</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Popularity <span class="weight-badge">30%</span></h3>
                                    <p>Number of reviews (logarithmic scale)</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Sentiment Bonus <span class="weight-badge">20%</span></h3>
                                    <p>Bonus for highly-rated destinations</p>
                                </div>
                            </div>
                        </div>

                        <div class="highlight-box warning-box">
                            <strong>Limitations:</strong> Rankings are based on Google reviews, not factors like water quality, wildlife diversity, or crowd levels which require on-ground assessment.
                        </div>
                    </section>
                </div>

                <!-- SPORTS TAB -->
                <div class="methodology-tab-content" id="sports-tab">
                    <section class="methodology-section">
                        <h2>Sports & Recreation Rankings</h2>
                        <p>Rankings for <strong>Sports Clubs, Adventure Sports, and Training Academies</strong> for active lifestyles.</p>

                        <div class="highlight-box">
                            <strong>What We Rank:</strong> Sports clubs and fitness centers, adventure sports operators (parasailing, kayaking, trekking), and professional training academies for various sports.
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Scoring Formula</h2>

                        <div class="categories-breakdown">
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Rating <span class="weight-badge">50%</span></h3>
                                    <p>Member/customer satisfaction ratings</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Popularity <span class="weight-badge">30%</span></h3>
                                    <p>Review volume indicating active membership</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Sentiment Bonus <span class="weight-badge">20%</span></h3>
                                    <p>Bonus for exceptional experiences</p>
                                </div>
                            </div>
                        </div>

                        <div class="highlight-box warning-box">
                            <strong>Limitations:</strong> Rankings reflect customer experience, not coaching quality, equipment standards, or safety certifications which require expert assessment.
                        </div>
                    </section>
                </div>

                <!-- WELLNESS TAB -->
                <div class="methodology-tab-content" id="wellness-tab">
                    <section class="methodology-section">
                        <h2>Wellness Rankings</h2>
                        <p>Rankings for <strong>Healthcare, Ayurveda & Spa, and Yoga & Meditation</strong> centers.</p>

                        <div class="highlight-box">
                            <strong>What We Rank:</strong> Hospitals and clinics, traditional Ayurvedic treatment centers and spas, yoga studios and meditation retreats.
                        </div>
                    </section>

                    <section class="methodology-section">
                        <h2>Scoring Formula</h2>

                        <div class="categories-breakdown">
                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Rating <span class="weight-badge">50%</span></h3>
                                    <p>Patient/visitor satisfaction ratings</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Popularity <span class="weight-badge">30%</span></h3>
                                    <p>Review count on logarithmic scale</p>
                                </div>
                            </div>

                            <div class="category-row">
                                <div class="category-icon"></div>
                                <div class="category-details">
                                    <h3>Sentiment Bonus <span class="weight-badge">20%</span></h3>
                                    <p>Bonus for highly-rated facilities</p>
                                </div>
                            </div>
                        </div>

                        <div class="highlight-box warning-box">
                            <strong>Important Healthcare Disclaimer:</strong> Healthcare rankings reflect <em>patient experience</em> (staff friendliness, wait times, facility cleanliness) — NOT clinical outcomes, medical expertise, or treatment success rates. A hospital with a friendly receptionist may rank higher than one with better surgeons. Always consult medical professionals for health decisions.
                        </div>
                    </section>
                </div>

                <!-- Common Footer -->
                <section class="methodology-section methodology-footer">
                    <h2>Full Transparency</h2>
                    <p>We believe in complete honesty about what our rankings can and cannot measure. Our scores are objective and verifiable, but they only capture what Google's APIs provide — primarily ratings and review counts from visitors.</p>

                    <p>Use the <strong>Customize</strong> feature on each category page to adjust weights based on your personal priorities.</p>

                    <div class="cta-buttons">
                        <a href="#/" class="btn-primary">Back to Home</a>
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
