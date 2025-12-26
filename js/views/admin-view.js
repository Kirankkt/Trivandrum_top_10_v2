/**
 * Admin View - Website Analytics Dashboard
 * Visualizes the data collected by AnalyticsManager with premium styling
 * Uses Supabase Auth for secure authentication
 */
async function renderAdminView() {
    const app = document.getElementById('app');

    // --- 0. AUTH CHECK (Supabase Auth) ---
    if (!window.sbClient) {
        app.innerHTML = '<div class="error-panel"><h2>Authentication service not available</h2><p>Check your Supabase configuration.</p></div>';
        return;
    }

    // Check if user is authenticated
    const { data: { user }, error: authError } = await window.sbClient.auth.getUser();

    if (!user) {
        // Show login form
        renderAdminLogin(app);
        return;
    }

    // Initial loading state
    app.innerHTML = `
        <div class="admin-container">
            <header class="admin-header">
                <div class="header-main" style="display: flex; justify-content: space-between; align-items: center;">
                    <h1>Project Analytics Dashboard</h1>
                    <div class="admin-user-info">
                        <span class="admin-email">${user.email}</span>
                        <button id="admin-logout-btn" class="admin-logout-btn">Logout</button>
                    </div>
                </div>
                <p>Tracking website use, effectiveness, and user behavior metrics.</p>
            </header>
            
            <div class="admin-stats-grid">
                <div class="admin-card stats-card" id="total-traffic-card">
                    <div class="card-icon"></div>
                    <div>
                        <h3>Total Events</h3>
                        <div class="big-number">Loading...</div>
                        <small class="stat-meta">Lifetime interactions</small>
                    </div>
                </div>
                <div class="admin-card stats-card" id="unique-sessions-card">
                    <div class="card-icon"></div>
                    <div>
                        <h3>Unique Visitors</h3>
                        <div class="big-number">Loading...</div>
                        <small class="stat-meta">Unique session IDs</small>
                    </div>
                </div>
                <div class="admin-card stats-card" id="intensity-card">
                    <div class="card-icon"></div>
                    <div>
                        <h3>Engagement Density</h3>
                        <div class="big-number">Loading...</div>
                        <small class="stat-meta">Events per session</small>
                    </div>
                </div>
            </div>

            <!-- Traffic Trends Section -->
            <div class="admin-card trends-card" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h3>Traffic Trends</h3>
                    <div class="date-range-selector">
                        <button class="range-btn" data-days="7">7 Days</button>
                        <button class="range-btn active" data-days="30">30 Days</button>
                        <button class="range-btn" data-days="90">90 Days</button>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="traffic-trends-chart"></canvas>
                </div>
                <div class="chart-legend">
                    <div class="legend-item"><span class="legend-dot" style="background: #2563eb;"></span> Total Events</div>
                    <div class="legend-item"><span class="legend-dot" style="background: #10b981;"></span> Unique Visitors</div>
                </div>
            </div>

            <!-- Traffic Sources Section -->
            <div class="admin-detail-grid" style="margin-bottom: 24px;">
                <div class="admin-card">
                    <div class="card-header">
                        <h3>Traffic Sources</h3>
                        <span class="badge">Acquisition</span>
                    </div>
                    <div class="traffic-sources-chart-container">
                        <canvas id="traffic-sources-chart"></canvas>
                    </div>
                    <div class="traffic-sources-legend" id="traffic-sources-legend"></div>
                </div>
                <div class="admin-card">
                    <div class="card-header">
                        <h3>Top Referring Domains</h3>
                        <span class="badge">External Traffic</span>
                    </div>
                    <div id="referring-domains-table" class="referring-domains">
                        <div class="empty-state">Loading referrer data...</div>
                    </div>
                </div>
            </div>

            <!-- User Journey & Conversions Section -->
            <div class="admin-detail-grid" style="margin-bottom: 24px;">
                <div class="admin-card">
                    <div class="card-header">
                        <h3>Conversion Funnel</h3>
                        <span class="badge">User Journey</span>
                    </div>
                    <div id="conversion-funnel" class="funnel-container">
                        <div class="empty-state">Loading funnel data...</div>
                    </div>
                </div>
                <div class="admin-card">
                    <div class="card-header">
                        <h3>Popular User Paths</h3>
                        <span class="badge">Navigation Flow</span>
                    </div>
                    <div id="user-paths" class="user-paths-container">
                        <div class="empty-state">Analyzing user journeys...</div>
                    </div>
                </div>
            </div>

            <div class="admin-detail-grid">
                <div class="admin-card bar-chart-card">
                    <div class="card-header">
                        <h3>Popular Localities</h3>
                        <span class="badge">Engagement Heat</span>
                    </div>
                    <div id="top-localities-chart" class="visual-chart">Loading data...</div>
                </div>
                <div class="admin-card bar-chart-card">
                    <div class="card-header">
                        <h3>Feature Popularity</h3>
                        <span class="badge">Usage Heatmap</span>
                    </div>
                    <div id="interaction-summary" class="visual-chart">Loading data...</div>
                </div>
            </div>

            <div class="admin-detail-grid" style="margin-top: 24px;">
                <div class="admin-card">
                    <div class="card-header">
                        <h3>Device Distribution</h3>
                        <span class="badge">Hardware Tracking</span>
                    </div>
                    <div id="device-chart" class="device-summary">Loading data...</div>
                </div>
                <div class="admin-card bar-chart-card">
                    <div class="card-header">
                        <h3>Top Landing Pages</h3>
                        <span class="badge">Entry Traffic</span>
                    </div>
                    <div id="landing-chart" class="visual-chart">Loading data...</div>
                </div>
            </div>

            <div class="admin-card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3>Recent Live Activity</h3>
                    <div class="live-indicator"><span class="pulse"></span> LIVE TRAFFIC</div>
                </div>
                <div class="admin-table-container">
                    <table class="admin-table" id="recent-events-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Event Type</th>
                                <th>Action/Path</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="4" style="text-align:center">Fetching latest events...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    if (!window.sbClient) {
        app.innerHTML = '<div class="error-panel"><h2>Analytics database not connected</h2><p>Check your Supabase configuration in <code>supabase-client.js</code></p></div>';
        return;
    }

    try {
        const { data: allEvents, error: totalError } = await window.sbClient
            .from('site_events')
            .select('*')
            .order('created_at', { ascending: false });

        if (totalError) throw totalError;

        // --- 1. DATA PROCESSING ---
        const totalEvents = allEvents.length;
        const sessions = [...new Set(allEvents.map(e => e.session_id))];
        const uniqueSessions = sessions.length;
        const density = (totalEvents / (uniqueSessions || 1)).toFixed(1);

        const interactions = allEvents.filter(e => e.event_type === 'interaction');
        const featureCounts = {};
        interactions.forEach(e => featureCounts[e.event_name] = (featureCounts[e.event_name] || 0) + 1);

        const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 };
        allEvents.forEach(e => {
            const ua = e.user_agent || "";
            if (/mobi|android|iphone/i.test(ua)) deviceCounts.Mobile++;
            else if (/tablet|ipad/i.test(ua)) deviceCounts.Tablet++;
            else deviceCounts.Desktop++;
        });

        // --- 2. UPDATE STATS ---
        document.querySelector('#total-traffic-card .big-number').textContent = totalEvents.toLocaleString();
        document.querySelector('#unique-sessions-card .big-number').textContent = uniqueSessions.toLocaleString();
        document.querySelector('#intensity-card .big-number').textContent = density;

        // --- 2.5 TRAFFIC TRENDS CHART ---
        let trafficChart = null;

        function aggregateByDay(events, days) {
            const now = new Date();
            const startDate = new Date(now);
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0);

            // Create date buckets for the range
            const dailyData = {};
            for (let i = 0; i <= days; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const key = date.toISOString().split('T')[0];
                dailyData[key] = { events: 0, sessions: new Set() };
            }

            // Fill with event data
            events.forEach(e => {
                const eventDate = new Date(e.created_at);
                if (eventDate >= startDate) {
                    const key = eventDate.toISOString().split('T')[0];
                    if (dailyData[key]) {
                        dailyData[key].events++;
                        if (e.session_id) {
                            dailyData[key].sessions.add(e.session_id);
                        }
                    }
                }
            });

            // Convert to arrays for Chart.js
            const labels = Object.keys(dailyData).sort();
            const eventsData = labels.map(d => dailyData[d].events);
            const visitorsData = labels.map(d => dailyData[d].sessions.size);

            return { labels, eventsData, visitorsData };
        }

        function renderTrafficChart(days) {
            const { labels, eventsData, visitorsData } = aggregateByDay(allEvents, days);

            const ctx = document.getElementById('traffic-trends-chart');
            if (!ctx) return;

            // Destroy existing chart if it exists
            if (trafficChart) {
                trafficChart.destroy();
            }

            trafficChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Total Events',
                            data: eventsData,
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointHoverRadius: 6,
                            pointBackgroundColor: '#2563eb',
                            borderWidth: 2
                        },
                        {
                            label: 'Unique Visitors',
                            data: visitorsData,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointHoverRadius: 6,
                            pointBackgroundColor: '#10b981',
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: '#1e293b',
                            titleColor: '#f8fafc',
                            bodyColor: '#f8fafc',
                            padding: 12,
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                                title: function (context) {
                                    const date = new Date(context[0].label);
                                    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 11 },
                                maxTicksLimit: days <= 7 ? 7 : (days <= 30 ? 10 : 12),
                                callback: function (value, index) {
                                    const date = new Date(this.getLabelForValue(value));
                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                }
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#f1f5f9'
                            },
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 11 },
                                precision: 0
                            }
                        }
                    }
                }
            });
        }

        // Initial render with 30 days
        renderTrafficChart(30);

        // Date range selector
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const days = parseInt(btn.dataset.days);
                renderTrafficChart(days);
            });
        });

        // --- 2.6 TRAFFIC SOURCES CHART ---
        function renderTrafficSourcesChart() {
            // Count traffic sources
            const sourceCounts = { direct: 0, referral: 0, social: 0, search: 0 };
            const domainCounts = {};

            allEvents.forEach(e => {
                // Only count page views for traffic sources
                if (e.event_type === 'page_view') {
                    const refType = e.referrer_type || 'direct';
                    if (sourceCounts.hasOwnProperty(refType)) {
                        sourceCounts[refType]++;
                    } else {
                        sourceCounts.direct++;
                    }

                    // Count referring domains
                    if (e.referrer_domain && refType !== 'direct') {
                        domainCounts[e.referrer_domain] = (domainCounts[e.referrer_domain] || 0) + 1;
                    }
                }
            });

            const total = Object.values(sourceCounts).reduce((a, b) => a + b, 0);

            // Pie chart colors
            const sourceColors = {
                direct: '#3b82f6',    // Blue
                search: '#10b981',    // Green
                social: '#f59e0b',    // Amber
                referral: '#8b5cf6'   // Purple
            };

            const sourceLabels = {
                direct: 'Direct',
                search: 'Search',
                social: 'Social',
                referral: 'Referral'
            };

            // Render pie chart
            const ctx = document.getElementById('traffic-sources-chart');
            if (ctx && typeof Chart !== 'undefined') {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(sourceCounts).map(k => sourceLabels[k]),
                        datasets: [{
                            data: Object.values(sourceCounts),
                            backgroundColor: Object.keys(sourceCounts).map(k => sourceColors[k]),
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '65%',
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                backgroundColor: '#1e293b',
                                titleColor: '#f8fafc',
                                bodyColor: '#f8fafc',
                                padding: 12,
                                cornerRadius: 8,
                                callbacks: {
                                    label: function (context) {
                                        const value = context.raw;
                                        const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                        return `${context.label}: ${value} (${pct}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Render legend
            const legendHtml = Object.entries(sourceCounts).map(([key, count]) => {
                const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                return `
                    <div class="source-legend-item">
                        <span class="source-dot" style="background: ${sourceColors[key]};"></span>
                        <span class="source-label">${sourceLabels[key]}</span>
                        <span class="source-value">${count} (${pct}%)</span>
                    </div>
                `;
            }).join('');

            document.getElementById('traffic-sources-legend').innerHTML = legendHtml;

            // Render top referring domains table
            const sortedDomains = Object.entries(domainCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            if (sortedDomains.length > 0) {
                const domainsHtml = sortedDomains.map(([domain, count], index) => `
                    <div class="domain-row">
                        <div class="domain-rank">${index + 1}</div>
                        <div class="domain-info">
                            <span class="domain-name">${domain}</span>
                            <span class="domain-count">${count} visits</span>
                        </div>
                    </div>
                `).join('');

                document.getElementById('referring-domains-table').innerHTML = domainsHtml;
            } else {
                document.getElementById('referring-domains-table').innerHTML = `
                    <div class="empty-state">
                        <div style="font-size: 24px; margin-bottom: 8px;">🔗</div>
                        <div>No referral traffic recorded yet</div>
                        <small style="color: #94a3b8;">Referrer data will appear as visitors arrive from external sites</small>
                    </div>
                `;
            }
        }

        renderTrafficSourcesChart();

        // --- 2.7 CONVERSION FUNNEL & USER PATHS ---
        function renderConversionFunnel() {
            // Define funnel stages based on page paths
            const funnelStages = [
                { name: 'Homepage', path: '#/', icon: '🏠' },
                { name: 'Localities List', path: '#/localities', icon: '📍' },
                { name: 'Locality Detail', pathPattern: /^#\/locality\/|^#\/discover\//, icon: '🏘️' },
                { name: 'Map Interaction', path: '#/map', icon: '🗺️' }
            ];

            // Group events by session
            const sessionEvents = {};
            allEvents.forEach(e => {
                if (e.event_type === 'page_view' && e.session_id) {
                    if (!sessionEvents[e.session_id]) {
                        sessionEvents[e.session_id] = [];
                    }
                    sessionEvents[e.session_id].push(e.page_path);
                }
            });

            // Count unique sessions reaching each stage
            const stageCounts = funnelStages.map(stage => {
                let count = 0;
                Object.values(sessionEvents).forEach(paths => {
                    const reached = paths.some(p => {
                        if (stage.pathPattern) {
                            return stage.pathPattern.test(p);
                        }
                        return p === stage.path;
                    });
                    if (reached) count++;
                });
                return count;
            });

            const totalSessions = Object.keys(sessionEvents).length;
            const maxCount = Math.max(...stageCounts, 1);

            // Calculate overall conversion rate (homepage to map)
            const overallConversion = totalSessions > 0
                ? ((stageCounts[3] / stageCounts[0]) * 100).toFixed(1)
                : 0;

            // Render funnel
            let funnelHtml = `
                <div class="funnel-overall">
                    <div class="funnel-overall-label">Overall Conversion</div>
                    <div class="funnel-overall-value">${overallConversion}%</div>
                    <div class="funnel-overall-desc">Homepage → Map</div>
                </div>
                <div class="funnel-stages">
            `;

            funnelStages.forEach((stage, index) => {
                const count = stageCounts[index];
                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const conversionFromPrev = index > 0 && stageCounts[index - 1] > 0
                    ? ((count / stageCounts[index - 1]) * 100).toFixed(0)
                    : 100;
                const dropOff = index > 0 ? (100 - parseFloat(conversionFromPrev)).toFixed(0) : 0;

                funnelHtml += `
                    <div class="funnel-stage">
                        <div class="funnel-stage-header">
                            <span class="funnel-icon">${stage.icon}</span>
                            <span class="funnel-name">${stage.name}</span>
                            <span class="funnel-count">${count}</span>
                        </div>
                        <div class="funnel-bar-container">
                            <div class="funnel-bar" style="width: ${pct}%;"></div>
                        </div>
                        ${index > 0 ? `
                            <div class="funnel-dropoff">
                                <span class="dropoff-arrow">↓</span>
                                <span class="dropoff-rate ${parseFloat(dropOff) > 50 ? 'high-dropoff' : ''}">${dropOff}% drop-off</span>
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            funnelHtml += '</div>';
            document.getElementById('conversion-funnel').innerHTML = funnelHtml;
        }

        function renderUserPaths() {
            // Build 3-page sequences from sessions
            const pathSequences = {};

            // Group events by session and sort by time
            const sessionEvents = {};
            allEvents.forEach(e => {
                if (e.event_type === 'page_view' && e.session_id && e.page_path) {
                    if (!sessionEvents[e.session_id]) {
                        sessionEvents[e.session_id] = [];
                    }
                    sessionEvents[e.session_id].push({
                        path: e.page_path,
                        time: new Date(e.created_at)
                    });
                }
            });

            // Sort each session's events by time and extract 3-page sequences
            Object.values(sessionEvents).forEach(events => {
                events.sort((a, b) => a.time - b.time);
                const paths = events.map(e => e.path);

                // Get unique consecutive paths (remove duplicates)
                const uniquePaths = [];
                paths.forEach(p => {
                    if (uniquePaths.length === 0 || uniquePaths[uniquePaths.length - 1] !== p) {
                        uniquePaths.push(p);
                    }
                });

                // Extract all 3-page sequences
                for (let i = 0; i <= uniquePaths.length - 3; i++) {
                    const sequence = uniquePaths.slice(i, i + 3).join(' → ');
                    pathSequences[sequence] = (pathSequences[sequence] || 0) + 1;
                }
            });

            // Sort and get top 5 sequences
            const topSequences = Object.entries(pathSequences)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            // Helper to format path names
            function formatPath(path) {
                const pathNames = {
                    '#/': 'Home',
                    '#/localities': 'Localities',
                    '#/map': 'Map',
                    '#/restaurants': 'Restaurants',
                    '#/cafes': 'Cafes',
                    '#/hotels': 'Hotels',
                    '#/malls': 'Malls',
                    '#/museums': 'Museums',
                    '#/healthcare': 'Healthcare',
                    '#/methodology': 'Methodology'
                };

                if (pathNames[path]) return pathNames[path];
                if (path.startsWith('#/locality/')) return 'Locality: ' + path.replace('#/locality/', '').substring(0, 12);
                if (path.startsWith('#/discover/')) return 'Discover: ' + path.replace('#/discover/', '').substring(0, 12);
                if (path.startsWith('#/entity/')) return 'Detail Page';
                return path.replace('#/', '').substring(0, 15) || 'Home';
            }

            if (topSequences.length > 0) {
                const pathsHtml = topSequences.map(([sequence, count], index) => {
                    const steps = sequence.split(' → ').map(formatPath);
                    return `
                        <div class="path-row">
                            <div class="path-rank">${index + 1}</div>
                            <div class="path-flow">
                                ${steps.map((step, i) => `
                                    <span class="path-step">${step}</span>
                                    ${i < steps.length - 1 ? '<span class="path-arrow">→</span>' : ''}
                                `).join('')}
                            </div>
                            <div class="path-count">${count} users</div>
                        </div>
                    `;
                }).join('');

                document.getElementById('user-paths').innerHTML = pathsHtml;
            } else {
                document.getElementById('user-paths').innerHTML = `
                    <div class="empty-state">
                        <div style="font-size: 24px; margin-bottom: 8px;">🛤️</div>
                        <div>Not enough navigation data yet</div>
                        <small style="color: #94a3b8;">User paths will appear as visitors browse multiple pages</small>
                    </div>
                `;
            }
        }

        renderConversionFunnel();
        renderUserPaths();

        // --- 3. RECENT ACTIVITY TABLE ---
        const tableBody = document.querySelector('#recent-events-table tbody');
        tableBody.innerHTML = allEvents.slice(0, 15).map(e => {
            const date = new Date(e.created_at);
            const isMobile = /mobi|android|iphone/i.test(e.user_agent || "");
            const icon = isMobile ? '📱' : '💻';
            return `
                <tr>
                    <td>${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><span class="badge badge-${e.event_type}">${e.event_type.replace('_', ' ')}</span></td>
                    <td><strong>${e.event_name.replace(/_/g, ' ')}</strong><br><small>${e.page_path}</small></td>
                    <td><span title="${e.user_agent || 'Unknown'}">${icon}</span> <small>${e.metadata ? JSON.stringify(e.metadata).substring(0, 30) : ''}</small></td>
                </tr>
            `;
        }).join('');

        // --- 4. VISUAL HEATMAPS (Progress Bar Style with Heat Colors) ---
        const renderBarChart = (counts, containerId, limit = 5) => {
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
            const max = Math.max(...Object.values(counts), 1);

            document.getElementById(containerId).innerHTML = sorted.map(([name, count]) => {
                const pct = (count / max) * 100;

                // Heat color scale (Blue -> Green -> Yellow -> Orange -> Red)
                let heatColor = '#3b82f6';
                if (pct > 80) heatColor = '#ef4444';
                else if (pct > 60) heatColor = '#f59e0b';
                else if (pct > 40) heatColor = '#eab308';
                else if (pct > 20) heatColor = '#10b981';

                return `
                    <div class="chart-row">
                        <div class="chart-label">
                            <span>${name.replace(/_/g, ' ')}</span>
                            <strong>${count}</strong>
                        </div>
                        <div class="chart-bar-bg">
                            <div class="chart-bar-fill" style="width: ${pct}%; background: ${heatColor};"></div>
                        </div>
                    </div>
                `;
            }).join('') || '<div class="empty-state">No data recorded yet</div>';
        };

        // Popular Localities
        const localityCounts = {};
        allEvents.filter(e => e.event_name === 'marker_clicked' && e.metadata?.category === 'localities')
            .forEach(e => localityCounts[e.metadata.name] = (localityCounts[e.metadata.name] || 0) + 1);
        renderBarChart(localityCounts, 'top-localities-chart');

        // Feature Heatmap
        renderBarChart(featureCounts, 'interaction-summary');

        // Device Breakdown
        document.getElementById('device-chart').innerHTML = `
            <div class="device-grid">
                <div class="device-pill">
                    <span class="icon">💻</span>
                    <span class="val">${Math.round((deviceCounts.Desktop / totalEvents) * 100 || 0)}% Desktop</span>
                </div>
                <div class="device-pill">
                    <span class="icon">📱</span>
                    <span class="val">${Math.round((deviceCounts.Mobile / totalEvents) * 100 || 0)}% Mobile</span>
                </div>
            </div>
        `;

        // Landing Pages (Exclude Admin from stats)
        const pageCounts = {};
        allEvents.filter(e => e.event_type === 'page_view' && e.page_path !== '#/admin')
            .forEach(e => pageCounts[e.page_path] = (pageCounts[e.page_path] || 0) + 1);
        renderBarChart(pageCounts, 'landing-chart');

        // Add logout handler
        document.getElementById('admin-logout-btn')?.addEventListener('click', async () => {
            await window.sbClient.auth.signOut();
            renderAdminView(); // Re-render to show login
        });

    } catch (err) {
        console.error('Admin Fetch Error:', err);
        const indicators = document.querySelectorAll('.big-number');
        indicators.forEach(i => i.textContent = "Error");

        const charts = ['top-localities-chart', 'interaction-summary', 'device-chart', 'landing-chart'];
        charts.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<div style="color:#ef4444; font-size: 13px;">Error loading metrics: ${err.message}</div>`;
        });
    }
}

/**
 * Render Admin Login Form
 * Uses Supabase Auth for email/password authentication
 */
function renderAdminLogin(app) {
    app.innerHTML = `
        <div class="admin-container" style="display:flex; justify-content:center; align-items:center; min-height:80vh;">
            <div class="admin-card admin-login-card">
                <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>
                <h2 style="margin-bottom: 10px; color: #0f172a;">Admin Login</h2>
                <p style="color: #64748b; margin-bottom: 24px; font-size: 14px;">Sign in with your authorized email to access the analytics dashboard.</p>

                <form id="admin-login-form">
                    <input type="email" id="admin-email" placeholder="Email address" required
                           class="admin-input">
                    <input type="password" id="admin-password" placeholder="Password" required
                           class="admin-input">
                    <button type="submit" id="admin-login-btn" class="admin-submit-btn">
                        <span id="login-btn-text">Sign In</span>
                        <span id="login-spinner" class="spinner" style="display: none;"></span>
                    </button>
                </form>

                <div id="login-error" class="login-error" style="display: none;"></div>

                <div class="login-footer">
                    <a href="#/" class="back-link">← Back to Home</a>
                </div>
            </div>
        </div>
    `;

    // Handle login form submission
    document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value;
        const errorDiv = document.getElementById('login-error');
        const submitBtn = document.getElementById('admin-login-btn');
        const btnText = document.getElementById('login-btn-text');
        const spinner = document.getElementById('login-spinner');

        // Reset error state
        errorDiv.style.display = 'none';
        document.getElementById('admin-email').classList.remove('input-error');
        document.getElementById('admin-password').classList.remove('input-error');

        // Show loading state
        submitBtn.disabled = true;
        btnText.textContent = 'Signing in...';
        spinner.style.display = 'inline-block';

        try {
            const { data, error } = await window.sbClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            // Success - re-render admin view (will now show dashboard)
            renderAdminView();

        } catch (err) {
            // Show error
            errorDiv.textContent = err.message || 'Invalid email or password';
            errorDiv.style.display = 'block';
            document.getElementById('admin-email').classList.add('input-error');
            document.getElementById('admin-password').classList.add('input-error');

            // Reset button
            submitBtn.disabled = false;
            btnText.textContent = 'Sign In';
            spinner.style.display = 'none';
        }
    });
}

// PREMIUM DASHBOARD STYLES
const adminStyles = `
<style>
    .admin-container { padding: 40px; max-width: 1100px; margin: 0 auto; color: #1e293b; font-family: 'Inter', -apple-system, sans-serif; }
    .admin-header { margin-bottom: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; }
    .admin-header h1 { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
    .admin-header p { color: #64748b; margin-top: 4px; font-size: 16px; }

    /* Admin User Info & Logout */
    .admin-user-info { display: flex; align-items: center; gap: 16px; }
    .admin-email { font-size: 14px; color: #64748b; font-weight: 500; }
    .admin-logout-btn { padding: 10px 20px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; }
    .admin-logout-btn:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }

    /* Login Form Styles */
    .admin-login-card { max-width: 400px; width: 100%; text-align: center; padding: 40px; }
    .admin-input { width: 100%; padding: 14px; border: 2px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px; outline: none; font-size: 16px; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
    .admin-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
    .admin-input.input-error { border-color: #ef4444; }
    .admin-submit-btn { width: 100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .admin-submit-btn:hover:not(:disabled) { background: #1d4ed8; }
    .admin-submit-btn:disabled { background: #93c5fd; cursor: not-allowed; }
    .login-error { color: #ef4444; margin-top: 16px; font-size: 13px; font-weight: 600; padding: 12px; background: #fef2f2; border-radius: 8px; }
    .login-footer { margin-top: 24px; padding-top: 24px; border-top: 1px solid #f1f5f9; }
    .back-link { color: #64748b; text-decoration: none; font-size: 14px; font-weight: 500; }
    .back-link:hover { color: #2563eb; }
    .spinner { width: 16px; height: 16px; border: 2px solid #ffffff40; border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .admin-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
    .admin-card { background: white; padding: 24px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; position: relative; }
    
    .stats-card { display: flex; align-items: center; gap: 20px; transition: transform 0.2s; }
    .stats-card:hover { transform: translateY(-2px); }
    .card-icon { font-size: 32px; background: #f8fafc; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; border-radius: 16px; }
    .stat-meta { display: block; font-size: 12px; color: #94a3b8; font-weight: 500; }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .card-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #334155; }
    
    .big-number { font-size: 36px; font-weight: 900; color: #2563eb; line-height: 1.1; margin: 4px 0; }
    .stats-card h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0; font-weight: 700; }
    
    .admin-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .chart-row { margin-bottom: 18px; }
    .chart-label { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #475569; }
    .chart-bar-bg { height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
    .chart-bar-fill { height: 100%; background: linear-gradient(90deg, #60a5fa, #2563eb); border-radius: 5px; transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
    
    .device-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; }
    .device-pill { padding: 24px 16px; background: #f8fafc; border-radius: 16px; text-align: center; border: 1px solid #f1f5f9; }
    .device-pill .icon { display: block; font-size: 28px; margin-bottom: 12px; }
    .device-pill .val { font-weight: 800; color: #1e293b; font-size: 18px; }

    .admin-table-container { border-radius: 12px; overflow: hidden; border: 1px solid #f1f5f9; }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th { text-align: left; padding: 14px 16px; background: #f8fafc; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
    .admin-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #475569; }
    .admin-table tr:last-child td { border-bottom: none; }
    
    .badge { padding: 6px 12px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; background: #f1f5f9; color: #64748b; }
    .badge-page_view { background: #ecfdf5; color: #059669; }
    .badge-interaction { background: #eff6ff; color: #3b82f6; }
    
    .live-indicator { font-size: 12px; font-weight: 800; color: #ef4444; display: flex; align-items: center; gap: 8px; background: #fef2f2; padding: 6px 12px; border-radius: 8px; }
    .pulse { width: 10px; height: 10px; background: #ef4444; border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
    .error-panel { text-align: center; padding: 60px; background: #fef2f2; border-radius: 24px; color: #b91c1c; }
    
    @keyframes pulse { 
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    .empty-state { padding: 40px; text-align: center; color: #94a3b8; font-style: italic; }

    /* Traffic Trends Chart */
    .trends-card { padding: 24px; }
    .trends-card .card-header { margin-bottom: 16px; }
    .chart-container { height: 300px; position: relative; margin-bottom: 16px; }

    /* Date Range Selector */
    .date-range-selector { display: flex; gap: 8px; }
    .range-btn { padding: 8px 16px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
    .range-btn:hover { background: #e2e8f0; color: #475569; }
    .range-btn.active { background: #2563eb; color: white; border-color: #2563eb; }

    /* Chart Legend */
    .chart-legend { display: flex; justify-content: center; gap: 24px; padding-top: 8px; border-top: 1px solid #f1f5f9; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #64748b; }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; }

    /* Traffic Sources Chart */
    .traffic-sources-chart-container { height: 200px; position: relative; margin-bottom: 16px; }
    .traffic-sources-legend { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
    .source-legend-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #f8fafc; border-radius: 8px; }
    .source-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .source-label { font-size: 13px; font-weight: 600; color: #475569; flex-grow: 1; }
    .source-value { font-size: 12px; color: #94a3b8; font-weight: 500; }

    /* Referring Domains Table */
    .referring-domains { padding: 8px 0; }
    .domain-row { display: flex; align-items: center; gap: 16px; padding: 14px 16px; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
    .domain-row:last-child { border-bottom: none; }
    .domain-row:hover { background: #f8fafc; }
    .domain-rank { width: 28px; height: 28px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #64748b; }
    .domain-info { flex-grow: 1; }
    .domain-name { display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 2px; }
    .domain-count { font-size: 12px; color: #94a3b8; }

    /* Conversion Funnel */
    .funnel-container { padding: 8px 0; }
    .funnel-overall { text-align: center; padding: 20px; background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border-radius: 12px; margin-bottom: 20px; }
    .funnel-overall-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; }
    .funnel-overall-value { font-size: 42px; font-weight: 900; color: #2563eb; line-height: 1.1; margin: 4px 0; }
    .funnel-overall-desc { font-size: 12px; color: #94a3b8; }
    .funnel-stages { display: flex; flex-direction: column; gap: 4px; }
    .funnel-stage { padding: 12px 0; }
    .funnel-stage-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .funnel-icon { font-size: 18px; }
    .funnel-name { font-size: 13px; font-weight: 600; color: #475569; flex-grow: 1; }
    .funnel-count { font-size: 14px; font-weight: 800; color: #1e293b; }
    .funnel-bar-container { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .funnel-bar { height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); border-radius: 4px; transition: width 0.8s ease-out; }
    .funnel-dropoff { display: flex; align-items: center; gap: 6px; margin-top: 6px; padding-left: 28px; }
    .dropoff-arrow { color: #94a3b8; font-size: 12px; }
    .dropoff-rate { font-size: 11px; color: #64748b; font-weight: 600; }
    .dropoff-rate.high-dropoff { color: #ef4444; }

    /* User Paths */
    .user-paths-container { padding: 8px 0; }
    .path-row { display: flex; align-items: center; gap: 14px; padding: 14px 12px; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
    .path-row:last-child { border-bottom: none; }
    .path-row:hover { background: #f8fafc; }
    .path-rank { width: 24px; height: 24px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
    .path-flow { flex-grow: 1; display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
    .path-step { font-size: 12px; font-weight: 600; color: #334155; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; white-space: nowrap; }
    .path-arrow { color: #94a3b8; font-size: 11px; }
    .path-count { font-size: 12px; color: #64748b; font-weight: 600; white-space: nowrap; }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .admin-stats-grid { grid-template-columns: 1fr; }
        .admin-detail-grid { grid-template-columns: 1fr; }
        .date-range-selector { flex-wrap: wrap; }
        .chart-container { height: 250px; }
        .admin-user-info { flex-direction: column; align-items: flex-end; gap: 8px; }
    }
</style>
`;
document.head.insertAdjacentHTML('beforeend', adminStyles);
