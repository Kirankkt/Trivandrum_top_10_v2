// Contact View - Contact information for the project

function renderContactView() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="about-page">
            <!-- Hero -->
            <section class="methodology-hero">
                <h1>Contact Us</h1>
                <p class="hero-subtitle">We'd Love to Hear From You</p>
            </section>

            <div class="methodology-content">
                <!-- Contact Section -->
                <section class="methodology-section">
                    <h2>Get In Touch</h2>
                    <p>Have feedback, found an error in our data, or want to suggest a new place to add? We welcome all input to make Trivandrum Top 10 better.</p>

                    <div class="contact-card">
                        <div class="contact-method">
                            <span class="contact-icon"></span>
                            <div class="contact-details">
                                <h3>Email Us</h3>
                                <a href="mailto:kthomaskiran3@gmail.com" class="contact-email">kthomaskiran3@gmail.com</a>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- What to Contact About -->
                <section class="methodology-section">
                    <h2>How Can We Help?</h2>
                    <div class="sources-grid">
                        <div class="source-card">
                            <h3>Report Errors</h3>
                            <p>Found a place that doesn't exist, closed down, or has incorrect information? Let us know and we'll fix it.</p>
                        </div>
                        <div class="source-card">
                            <h3>Suggest Additions</h3>
                            <p>Know a great place we missed? We're always looking to expand our coverage of Trivandrum.</p>
                        </div>
                        <div class="source-card">
                            <h3>Feature Requests</h3>
                            <p>Have an idea for a new category or feature? We'd love to hear your suggestions.</p>
                        </div>
                        <div class="source-card">
                            <h3>General Feedback</h3>
                            <p>Any other thoughts on how we can improve Trivandrum Top 10? Drop us a line.</p>
                        </div>
                    </div>
                </section>

                <!-- About the Project (brief) -->
                <section class="methodology-section">
                    <h2>About the Project</h2>
                    <p>Trivandrum Top 10 is a data-driven ranking platform for Kerala's capital city. We use objective, API-sourced data from Google Maps to rank localities, restaurants, hotels, and more.</p>

                    <p>No sponsored placements. No paid rankings. Just transparent, algorithmic scores based on real user reviews and verifiable metrics.</p>

                    <div class="highlight-box">
                        <strong>Our Promise:</strong> Complete transparency in how we calculate rankings. See our <a href="#/methodology">Methodology</a> page for full details.
                    </div>
                </section>

                <!-- CTA -->
                <section class="methodology-section methodology-footer">
                    <div class="cta-buttons">
                        <a href="#/" class="btn-primary">Back to Home</a>
                        <a href="#/methodology" class="btn-secondary">View Methodology</a>
                    </div>
                </section>
            </div>
        </div>
    `;

    window.scrollTo(0, 0);
}

// Keep old function name for backwards compatibility
function renderAboutView() {
    renderContactView();
}
