/**
 * AnalyticsManager - Centralized tracking for Trivandrum Top 10
 * Uses secure Edge Function for data insertion (no direct DB access).
 */
class AnalyticsManager {
    constructor() {
        this.sessionId = this._getOrCreateSessionId();
        this.initialized = false;
        this.edgeFunctionUrl = null;

        // Capture referrer on first load (before any navigation)
        this.initialReferrer = this._captureReferrer();

        // Auto-track page views on hash change
        window.addEventListener('hashchange', () => {
            this.trackPageView(window.location.hash);
        });
    }

    /**
     * Capture and categorize referrer information
     */
    _captureReferrer() {
        const referrer = document.referrer || '';

        // If no referrer or same origin, it's direct traffic
        if (!referrer) {
            return { type: 'direct', source: null, domain: null };
        }

        try {
            const refUrl = new URL(referrer);
            const currentHost = window.location.hostname;

            // If referrer is from same site, treat as direct
            if (refUrl.hostname === currentHost) {
                return { type: 'direct', source: null, domain: null };
            }

            const domain = refUrl.hostname.replace('www.', '');

            // Social media domains
            const socialDomains = {
                'facebook.com': 'Facebook',
                'fb.com': 'Facebook',
                'twitter.com': 'Twitter',
                'x.com': 'Twitter',
                't.co': 'Twitter',
                'instagram.com': 'Instagram',
                'linkedin.com': 'LinkedIn',
                'youtube.com': 'YouTube',
                'reddit.com': 'Reddit',
                'pinterest.com': 'Pinterest',
                'tiktok.com': 'TikTok',
                'whatsapp.com': 'WhatsApp',
                'telegram.org': 'Telegram'
            };

            // Check if it's a social media referrer
            for (const [socialDomain, socialName] of Object.entries(socialDomains)) {
                if (domain.includes(socialDomain)) {
                    return { type: 'social', source: socialName, domain: domain };
                }
            }

            // Search engines
            const searchDomains = ['google.', 'bing.', 'yahoo.', 'duckduckgo.', 'baidu.'];
            for (const searchDomain of searchDomains) {
                if (domain.includes(searchDomain)) {
                    return { type: 'search', source: domain.split('.')[0], domain: domain };
                }
            }

            // Otherwise it's referral traffic
            return { type: 'referral', source: domain, domain: domain };

        } catch (e) {
            return { type: 'direct', source: null, domain: null };
        }
    }

    /**
     * Initialize with Supabase URL (for Edge Function calls)
     */
    init(supabaseClient) {
        this.supabase = supabaseClient;
        // Edge Function URL is based on the Supabase project URL
        const supabaseUrl = 'https://jhygaazqujzufiklqaah.supabase.co';
        this.edgeFunctionUrl = `${supabaseUrl}/functions/v1/track-event`;
        this.anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeWdhYXpxdWp6dWZpa2xxYWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzEyMTksImV4cCI6MjA4MDYwNzIxOX0.rR_FePTK4iHQyjVSVokPX6LsKpZY-mFI0KEkfdX1Jno';
        this.initialized = true;

        // Track the initial page load
        this.trackPageView(window.location.hash || '#/');
        console.log('📊 [Analytics] Initialized session:', this.sessionId);
    }

    /**
     * Send event to Edge Function (secure insert)
     */
    async _sendToEdgeFunction(type, data) {
        if (!this.edgeFunctionUrl) return;

        try {
            const response = await fetch(this.edgeFunctionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.anonKey}`
                },
                body: JSON.stringify({ type, data })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Edge Function error');
            }

            return await response.json();
        } catch (err) {
            console.debug('📊 [Analytics] Edge Function call failed:', err.message);
            return null;
        }
    }

    /**
     * Tracks a generic event
     * @param {string} eventName - Snake-case name (e.g., 'marker_clicked')
     * @param {Object} metadata - JSON payload with contextual info
     */
    async trackEvent(eventName, metadata = {}) {
        if (!this.initialized) {
            console.warn('📊 [Analytics] Not initialized. Event ignored:', eventName);
            return;
        }

        const payload = {
            event_type: 'interaction',
            event_name: eventName,
            page_path: window.location.hash || '#/',
            session_id: this.sessionId,
            metadata: metadata,
            user_agent: navigator.userAgent
        };

        try {
            const result = await this._sendToEdgeFunction('site_event', payload);
            if (result?.success) {
                console.log(`📊 [Analytics] ✅ Event tracked: ${eventName}`);
            }
        } catch (err) {
            console.debug('📊 [Analytics] Event tracking failed:', err.message);
        }
    }

    /**
     * Specific helper for page views
     */
    async trackPageView(path) {
        if (!this.initialized) return;

        try {
            await this._sendToEdgeFunction('site_event', {
                event_type: 'page_view',
                event_name: 'view_page',
                page_path: path,
                session_id: this.sessionId,
                user_agent: navigator.userAgent,
                referrer_type: this.initialReferrer.type,
                referrer_source: this.initialReferrer.source,
                referrer_domain: this.initialReferrer.domain
            });
            console.log(`📊 [Analytics] Page View: ${path} (${this.initialReferrer.type})`);
        } catch (err) {
            console.debug('📊 [Analytics] Page track failed:', err.message);
        }
    }

    /**
     * Session ID management
     * Uses localStorage for persistent identification of the browser
     */
    _getOrCreateSessionId() {
        let sid = localStorage.getItem('tvm_analytics_sid');
        if (!sid) {
            sid = 'sid_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
            localStorage.setItem('tvm_analytics_sid', sid);
        }
        return sid;
    }
}

// Global Singleton
window.analytics = new AnalyticsManager();
