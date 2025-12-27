// About View - Information about the project and team

function renderAboutView() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="about-page">
            <!-- Hero -->
            <section class="methodology-hero">
                <h1>About Trivandrum Top 10</h1>
                <p class="hero-subtitle">The City's First Data-Driven Ranking Platform</p>
            </section>

            <div class="methodology-content">
                <!-- Mission Section -->
                <section class="methodology-section">
                    <h2>Our Mission</h2>
                    <p>Trivandrum Top 10 was created to solve a simple problem: <strong>how do you make informed decisions
                    about where to live, eat, or explore in Thiruvananthapuram without relying on biased opinions or paid promotions?</strong></p>

                    <div class="highlight-box">
                        <strong>Our Answer:</strong> Build a platform that uses only objective, API-sourced data to rank
                        localities, restaurants, hotels, and more — with complete transparency in how scores are calculated.
                    </div>
                </section>

                <!-- What We Do Section -->
                <section class="methodology-section">
                    <h2>What We Rank</h2>
                    <div class="sources-grid">
                        <div class="source-card">
                            <h3>Localities</h3>
                            <p>20 residential neighborhoods ranked by accessibility, amenities, safety, environment, and economy.</p>
                        </div>
                        <div class="source-card">
                            <h3>Dining</h3>
                            <p>Top restaurants and cafes ranked by sentiment, popularity, ratings, value, and vibe.</p>
                        </div>
                        <div class="source-card">
                            <h3>Hotels</h3>
                            <p>Best stays from budget to luxury, ranked by guest satisfaction and amenities.</p>
                        </div>
                        <div class="source-card">
                            <h3>Shopping</h3>
                            <p>Malls, boutiques, and specialty shops ranked for variety and experience.</p>
                        </div>
                        <div class="source-card">
                            <h3>Culture</h3>
                            <p>Museums and religious sites ranked by historical significance and visitor experience.</p>
                        </div>
                        <div class="source-card">
                            <h3>Services</h3>
                            <p>Healthcare, education, and banking institutions ranked by accessibility and quality.</p>
                        </div>
                    </div>
                </section>

                <!-- How It Works -->
                <section class="methodology-section">
                    <h2>How It Works</h2>
                    <div class="categories-breakdown">
                        <div class="category-row">
                            <div class="category-icon"></div>
                            <div class="category-details">
                                <h3>1. Data Collection</h3>
                                <p>We pull data from Google Maps Platform APIs — including Places, Distance Matrix, and Elevation —
                                to gather objective metrics like travel times, ratings, review counts, and nearby amenities.</p>
                            </div>
                        </div>

                        <div class="category-row">
                            <div class="category-icon"></div>
                            <div class="category-details">
                                <h3>2. Scoring Algorithm</h3>
                                <p>Each category uses a weighted formula to calculate a final score. Weights are transparent
                                and can be customized by users to match their priorities.</p>
                            </div>
                        </div>

                        <div class="category-row">
                            <div class="category-icon"></div>
                            <div class="category-details">
                                <h3>3. No Human Bias</h3>
                                <p>Rankings are generated algorithmically. There are no sponsored placements, paid features,
                                or editorial opinions influencing the results.</p>
                            </div>
                        </div>

                        <div class="category-row">
                            <div class="category-icon"></div>
                            <div class="category-details">
                                <h3>4. User Customization</h3>
                                <p>Don't agree with our default weights? Use the Customize feature to adjust what matters
                                most to you and see rankings recalculated in real-time.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Why Trust Us -->
                <section class="methodology-section">
                    <h2>Why Trust Our Rankings?</h2>
                    <div class="trust-points">
                        <div class="trust-item">
                            <span class="trust-icon">&#9989;</span>
                            <div>
                                <strong>100% Transparent</strong>
                                <p>Every formula and data source is documented in our Methodology page.</p>
                            </div>
                        </div>
                        <div class="trust-item">
                            <span class="trust-icon">&#9989;</span>
                            <div>
                                <strong>Zero Sponsored Content</strong>
                                <p>No business can pay to improve their ranking or appear higher in results.</p>
                            </div>
                        </div>
                        <div class="trust-item">
                            <span class="trust-icon">&#9989;</span>
                            <div>
                                <strong>API-Verified Data</strong>
                                <p>All metrics come from verifiable Google APIs, not user submissions or surveys.</p>
                            </div>
                        </div>
                        <div class="trust-item">
                            <span class="trust-icon">&#9989;</span>
                            <div>
                                <strong>Local Expertise</strong>
                                <p>Built by people who know Trivandrum, for people who want to experience it better.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- The Project -->
                <section class="methodology-section">
                    <h2>The Project</h2>
                    <p>Trivandrum Top 10 started as a personal project to help friends and family make better decisions
                    about neighborhoods in Kerala's capital city. It has since grown into a comprehensive guide covering
                    12+ categories with hundreds of ranked places.</p>

                    <p>The platform is built with modern web technologies and designed to be fast, accessible, and
                    mobile-friendly. All data is refreshed regularly to ensure rankings stay current.</p>
                </section>

                <!-- Contact / Feedback -->
                <section class="methodology-section">
                    <h2>Get In Touch</h2>
                    <p>Have feedback, suggestions, or found an error in our data? We'd love to hear from you.</p>

                    <div class="highlight-box">
                        <strong>Feedback:</strong> Help us improve by reporting issues or suggesting new features.
                        Your input shapes the future of Trivandrum Top 10.
                    </div>
                </section>

                <!-- CTA -->
                <section class="methodology-section methodology-footer">
                    <h2>Start Exploring</h2>
                    <p>Ready to discover the best of Thiruvananthapuram? Dive into our rankings and find your next home,
                    meal, or adventure.</p>

                    <div class="cta-buttons">
                        <a href="#/localities" class="btn-primary">Explore Localities</a>
                        <a href="#/methodology" class="btn-secondary">View Methodology</a>
                    </div>
                </section>
            </div>
        </div>
    `;

    window.scrollTo(0, 0);
}
