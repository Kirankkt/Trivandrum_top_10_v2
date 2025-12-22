/**
 * Admin View - Website Analytics Dashboard
 * Visualizes the data collected by AnalyticsManager with premium styling
 */
async function renderAdminView() {
    const app = document.getElementById('app');

    // --- 0. AUTH CHECK (Simple Team Gatekeeper) ---
    const AUTH_KEY = 'tvm_admin_authenticated';
    if (!sessionStorage.getItem(AUTH_KEY)) {
        app.innerHTML = `
            <div class="admin-container" style="display:flex; justify-content:center; align-items:center; min-height:80vh;">
                <div class="admin-card" style="max-width:400px; width:100%; text-align:center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🛡️</div>
                    <h2 style="margin-bottom: 10px; color: #0f172a;">Admin Access</h2>
                    <p style="color: #64748b; margin-bottom: 24px; font-size: 14px;">This dashboard is for internal team metrics only. Please enter your password.</p>
                    <input type="password" id="admin-password" placeholder="Management Password" 
                           style="width:100%; padding: 14px; border: 2px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px; outline: none; font-size: 16px; transition: border-color 0.2s;">
                    <button id="admin-login-btn" 
                            style="width:100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: background 0.2s;">
                        Enter Dashboard
                    </button>
                    <div id="login-error" style="color: #ef4444; margin-top: 16px; font-size: 13px; display: none; font-weight: 600;">⚠️ Access Denied: Incorrect Password</div>
                </div>
            </div>
        `;

        // Handle login
        const handleLogin = () => {
            const pwd = document.getElementById('admin-password').value;
            // Default password is 'tvm2024' - User should change this later
            if (pwd === 'tvm2024') {
                sessionStorage.setItem(AUTH_KEY, 'true');
                renderAdminView();
            } else {
                const err = document.getElementById('login-error');
                err.style.display = 'block';
                document.getElementById('admin-password').style.borderColor = '#ef4444';
            }
        };

        document.getElementById('admin-login-btn').addEventListener('click', handleLogin);
        document.getElementById('admin-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
        return;
    }

    // Initial loading state
    app.innerHTML = `
        <div class="admin-container">
            <header class="admin-header">
                <div class="header-main">
                    <h1>📊 Project Analytics Dashboard</h1>
                </div>
                <p>Tracking website use, effectiveness, and user behavior metrics.</p>
            </header>
            
            <div class="admin-stats-grid">
                <div class="admin-card stats-card" id="total-traffic-card">
                    <div class="card-icon">📈</div>
                    <div>
                        <h3>Total Events</h3>
                        <div class="big-number">Loading...</div>
                        <small class="stat-meta">Lifetime interactions</small>
                    </div>
                </div>
                <div class="admin-card stats-card" id="unique-sessions-card">
                    <div class="card-icon">👥</div>
                    <div>
                        <h3>Unique Visitors</h3>
                        <div class="big-number">Loading...</div>
                        <small class="stat-meta">Unique session IDs</small>
                    </div>
                </div>
                <div class="admin-card stats-card" id="intensity-card">
                    <div class="card-icon">⚡</div>
                    <div>
                        <h3>Engagement Density</h3>
                        <div class="big-number">Loading...</div>
                        <small class="stat-meta">Events per session</small>
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

        // --- 4. VISUAL HEATMAPS (Progress Bar Style) ---
        const renderBarChart = (counts, containerId, limit = 5) => {
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
            const max = Math.max(...Object.values(counts), 1);

            document.getElementById(containerId).innerHTML = sorted.map(([name, count]) => {
                const pct = (count / max) * 100;
                return `
                    <div class="chart-row">
                        <div class="chart-label">
                            <span>${name.replace(/_/g, ' ')}</span>
                            <strong>${count}</strong>
                        </div>
                        <div class="chart-bar-bg">
                            <div class="chart-bar-fill" style="width: ${pct}%"></div>
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

        // Landing Pages
        const pageCounts = {};
        allEvents.filter(e => e.event_type === 'page_view')
            .forEach(e => pageCounts[e.page_path] = (pageCounts[e.page_path] || 0) + 1);
        renderBarChart(pageCounts, 'landing-chart');

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

// PREMIUM DASHBOARD STYLES
const adminStyles = `
<style>
    .admin-container { padding: 40px; max-width: 1100px; margin: 0 auto; color: #1e293b; font-family: 'Inter', -apple-system, sans-serif; }
    .admin-header { margin-bottom: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; }
    .admin-header h1 { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
    .admin-header p { color: #64748b; margin-top: 4px; font-size: 16px; }
    
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
</style>
`;
document.head.insertAdjacentHTML('beforeend', adminStyles);
