// Methodology View - Detailed explanation of ranking system
async function renderMethodologyView() {
    const app = document.getElementById('app');

    const html = `
        <div class="methodology-header">
            <h2>📊 Ranking Methodology</h2>
            <p class="subtitle">How we rank Trivandrum localities using 41 data points</p>
        </div>
        
        <div class="methodology-content">
            <div class="intro-section">
                <h3>Our Approach</h3>
                <p>We rank localities using a <strong>transparent, data-driven methodology</strong> based on the Government of India's <strong>Ease of Living Index (EoLI)</strong> framework. Every locality is scored on <strong>41 objective indicators</strong> across three pillars.</p>
                
                <div class="stats-row">
                    <div class="stat-box">
                        <div class="stat-number">17</div>
                        <div class="stat-label">Localities Ranked</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">41</div>
                        <div class="stat-label">Metrics Per Locality</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">19</div>
                        <div class="stat-label">Automated Metrics</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">22</div>
                        <div class="stat-label">AI-Analyzed Metrics</div>
                    </div>
                </div>
            </div>
            
            <div class="formula-section">
                <h3>Overall Score Formula</h3>
                <div class="formula-box">
                    <code>
                        Overall Score = <br>
                        (Quality of Life × 55%) + <br>
                        (Economic Ability × 20%) + <br>
                        (Environment & Charm × 25%)
                    </code>
                </div>
                <p class="note">💡 These weights can be customized on the <a href="#/customize">Customize page</a> to match your priorities!</p>
            </div>
            
            <div class="pillar-section">
                <h2>The Three Pillars</h2>
                
                <!-- PILLAR 1: Quality of Life -->
                <div class="pillar-card qol">
                    <div class="pillar-header">
                        <span class="pillar-icon">🏘️</span>
                        <div>
                            <h3>Pillar 1: Quality of Life</h3>
                            <div class="pillar-weight">Default Weight: 55%</div>
                        </div>
                    </div>
                    
                    <p class="pillar-description">How comfortable and convenient is daily life in this locality?</p>
                    
                    <div class="sub-categories">
                        <div class="sub-category">
                            <h4>🚗 Accessibility & Connectivity (18% of total)</h4>
                            <ul>
                                <li><strong>City Centre travel time</strong> - Automated via Google Maps (current traffic)</li>
                                <li><strong>Technopark travel time</strong> - For IT professionals</li>
                                <li><strong>Airport travel time</strong> - For frequent travelers</li>
                                <li><strong>Medical College travel time</strong> - Healthcare access</li>
                                <li><strong>Public transport quality</strong> - AI-scored based on bus routes & frequency</li>
                                <li><strong>Road quality</strong> - From reviews & local knowledge</li>
                            </ul>
                        </div>
                        
                        <div class="sub-category">
                            <h4>🛡️ Safety & Security (12% of total)</h4>
                            <ul>
                                <li><strong>Overall safety score</strong> - From reviews & crime data</li>
                                <li><strong>Street lighting</strong> - Quality & coverage</li>
                                <li><strong>Women's safety</strong> - Specific perception</li>
                                <li><strong>Police stations count</strong> - Automated (within 3km)</li>
                                <li><strong>Fire stations count</strong> - Automated</li>
                            </ul>
                        </div>
                        
                        <div class="sub-category">
                            <h4>🏥 Health (7% of total)</h4>
                            <ul>
                                <li><strong>Hospitals count</strong> - Automated via Google Places (3km radius)</li>
                                <li><strong>Healthcare quality</strong> - Hospital reputation & services</li>
                                <li><strong>Pharmacies count</strong> - Automated</li>
                                <li><strong>Air quality</strong> - Based on traffic & pollution</li>
                            </ul>
                        </div>
                        
                        <div class="sub-category">
                            <h4>🏫 Education (7% of total)</h4>
                            <ul>
                                <li><strong>Schools count</strong> - Automated via Google Places</li>
                                <li><strong>School quality</strong> - Reputation & results</li>
                                <li><strong>Coaching centers</strong> - Tutorial availability</li>
                            </ul>
                        </div>
                        
                        <div class="sub-category">
                            <h4>🚰 Basic Services (6% of total)</h4>
                            <ul>
                                <li><strong>Water supply</strong> - 24/7 reliability perception</li>
                                <li><strong>Waste collection</strong> - Garbage removal effectiveness</li>
                                <li><strong>Drainage</strong> - Sewerage & monsoon preparedness</li>
                                <li><strong>Flooding risk</strong> - Historical data & drainage</li>
                            </ul>
                        </div>
                        
                        <div class="sub-category">
                            <h4>🎾 Recreation & Lifestyle (5% of total)</h4>
                            <ul>
                                <li><strong>Restaurants count</strong> - Automated</li>
                                <li><strong>Cafes count</strong> - Automated</li>
                                <li><strong>Supermarkets count</strong> - Automated</li>
                                <li><strong>Gyms count</strong> - Automated</li>
                                <li><strong>Parks count</strong> - Automated</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- PILLAR 2: Economic Ability -->
                <div class="pillar-card economic">
                    <div class="pillar-header">
                        <span class="pillar-icon">💰</span>
                        <div>
                            <h3>Pillar 2: Economic Ability</h3>
                            <div class="pillar-weight">Default Weight: 20%</div>
                        </div>
                    </div>
                    
                    <p class="pillar-description">Can you afford to live here? Is it good value for money?</p>
                    
                    <div class="sub-categories">
                        <div class="sub-category">
                            <h4>🏠 Real Estate Value (12% of total)</h4>
                            <ul>
                                <li><strong>Land price per cent</strong> - Automated via Serper + Gemini (MagicBricks/99acres)</li>
                                <li><strong>Apartment price per sqft</strong> - Automated</li>
                                <li><strong>Sweet Spot Scoring:</strong> We don't reward just cheap prices!</li>
                                <li class="highlight">Best value: ₹10-25L/cent land, ₹4000-7000/sqft apartments</li>
                                <li>Too cheap = undeveloped area</li>
                                <li>Too expensive = unaffordable for locals</li>
                            </ul>
                        </div>
                        
                        <div class="sub-category">
                            <h4>💼 Job Market Access (8% of total)</h4>
                            <ul>
                                <li><strong>Technopark proximity</strong> - From travel time data</li>
                                <li><strong>City center proximity</strong> - For government/corporate jobs</li>
                                <li><strong>Commercial vibrancy</strong> - Offices, PSUs, businesses</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- PILLAR 3: Environment & Charm -->
                <div class="pillar-card sustainability">
                    <div class="pillar-header">
                        <span class="pillar-icon">🌱</span>
                        <div>
                            <h3>Pillar 3: Environment & Charm</h3>
                            <div class="pillar-weight">Default Weight: 25%</div>
                        </div>
                    </div>
                    
                    <p class="pillar-description">Is this a pleasant, prestigious place to live long-term? This pillar rewards areas that are both <strong>Clean & Green</strong> and have <strong>High Prestige</strong>.</p>
                    
                    <div class="sub-categories">
                        <div class="sub-category">
                            <h4>🌳 Greenery & Cleanliness (10% of total)</h4>
                            <ul>
                                <li><strong>Air quality</strong> - Pollution perception</li>
                                <li><strong>Noise level</strong> - Traffic & urban noise</li>
                                <li><strong>Flooding risk</strong> - Monsoon preparedness</li>
                                <li><strong>Green cover</strong> - Trees, parks percentage</li>
                                <li><strong>Cleanliness</strong> - Overall upkeep</li>
                            </ul>
                        </div>
                        
                        <div class="sub-category">
                            <h4>🏛️ Urban Character (10% of total)</h4>
                            <ul>
                                <li><strong>Prestige</strong> - Aspirational address value (VIP status)</li>
                                <li><strong>Infrastructure maturity</strong> - Paved roads, sidewalks</li>
                                <li><strong>Architectural quality</strong> - Building aesthetics</li>
                            </ul>
                        </div>
                        
                        <div class="sub-category">
                            <h4>🚀 Future Potential (5% of total)</h4>
                            <ul>
                                <li><strong>Smart City projects</strong> - Via web search</li>
                                <li><strong>Developer activity</strong> - New projects, investment</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="data-sources-section">
                <h3>🔍 Data Sources & Validation</h3>
                
                <div class="source-grid">
                    <div class="source-card">
                        <h4>🗺️ Google Maps APIs</h4>
                        <ul>
                            <li>Travel times with live traffic</li>
                            <li>Geocoding for precise locations</li>
                            <li>User reviews for sentiment</li>
                        </ul>
                    </div>
                    
                    <div class="source-card">
                        <h4>📍 Google Places API</h4>
                        <ul>
                            <li>10 amenity types counted</li>
                            <li>3km radius search</li>
                            <li>Real-time data</li>
                        </ul>
                    </div>
                    
                    <div class="source-card">
                        <h4>🏠 Serper + Gemini AI</h4>
                        <ul>
                            <li>MagicBricks price listings</li>
                            <li>99acres property data</li>
                            <li>Automated median calculation</li>
                        </ul>
                    </div>
                    
                    <div class="source-card">
                        <h4>🤖 AI Analysis (Quality Controlled)</h4>
                        <ul>
                            <li>Evidence-based scoring</li>
                            <li>Confidence tracking</li>
                            <li>Local expert knowledge</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="quality-section">
                <h3>✅ Quality Control & Anti-Hallucination</h3>
                <p>We prevent AI errors through:</p>
                <ul class="quality-list">
                    <li>✅ <strong>19 metrics fully automated</strong> - No AI guessing on objective data</li>
                    <li>✅ <strong>Actual data as context</strong> - AI sees collected counts before scoring</li>
                    <li>✅ <strong>Evidence requirement</strong> - AI must cite specific data points</li>
                    <li>✅ <strong>Confidence scoring</strong> - High/medium/low certainty tracked</li>
                    <li>✅ <strong>Cross-validation</strong> - Reviews + web search + local knowledge</li>
                </ul>
                
                <div class="quality-results">
                    <div class="quality-stat">
                        <span class="stat-icon">✅</span>
                        <div>
                            <div class="stat-value">0</div>
                            <div class="stat-label">Low Confidence Scores</div>
                        </div>
                    </div>
                    <div class="quality-stat">
                        <span class="stat-icon">📊</span>
                        <div>
                            <div class="stat-value">100%</div>
                            <div class="stat-label">Data Collection Success</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="transparency-section">
                <h3>🔓 Complete Transparency</h3>
                <p>Unlike other ranking sites, we show you:</p>
                <ul class="transparency-list">
                    <li>📊 Exact scoring formula and weights</li>
                    <li>🔢 All 41 raw data points per locality</li>
                    <li>🤖 AI confidence levels for each score</li>
                    <li>📝 Evidence used for each rating</li>
                    <li>⚖️ Ability to customize weights to your priorities</li>
                </ul>
            </div>
            
            <div class="disclaimer-section">
                <h3>⚠️ Important Disclaimer</h3>
                <div class="disclaimer-box">
                    <p>Rankings are based on a combination of <strong>Google Places data</strong>, <strong>travel time analysis</strong>, and <strong>AI-assisted qualitative assessments</strong>.</p>
                    <ul>
                        <li>📍 <strong>Amenity counts</strong> are limited to a 1.5km radius and may not capture all establishments.</li>
                        <li>🏠 <strong>Property prices</strong> are estimates based on web-scraped listings and can vary significantly.</li>
                        <li>🤖 <strong>Subjective scores</strong> (safety, cleanliness, prestige) are AI-generated estimates, not verified surveys.</li>
                        <li>📊 <strong>Actual conditions</strong> may differ from our data. Always verify with local sources before making decisions.</li>
                    </ul>
                    <p class="disclaimer-note">This tool is meant for <strong>informational purposes only</strong> and should not be the sole basis for real estate or relocation decisions.</p>
                </div>
            </div>
            
            <div class="cta-section">
                <h3>Ready to explore?</h3>
                <div class="cta-buttons">
                    <a href="#/" class="btn btn-primary">View Top 10 Rankings</a>
                    <a href="#/customize" class="btn btn-secondary">Customize Your Rankings</a>
                </div>
            </div>
        </div>
    `;

    app.innerHTML = html;
}
