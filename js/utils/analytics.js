/**
 * AnalyticsManager - Centralized tracking for Trivandrum Top 10
 * Following industry patterns (like Segment/PostHog) for event-based analytics.
 */
class AnalyticsManager {
    constructor() {
        this.sessionId = this._getOrCreateSessionId();
        this.initialized = false;

        // Auto-track page views on hash change
        window.addEventListener('hashchange', () => {
            this.trackPageView(window.location.hash);
        });
    }

    /**
     * Initialize with Supabase client
     */
    init(supabaseClient) {
        this.supabase = supabaseClient;
        this.initialized = true;

        // Track the initial page load
        this.trackPageView(window.location.hash || '#/');
        console.log('📊 [Analytics] Initialized session:', this.sessionId);
    }

    /**
     * Tracks a generic event
     * @param {string} eventName - Snake-case name (e.g., 'marker_clicked')
     * @param {Object} metadata - JSON payload with contextual info
     */
    async trackEvent(eventName, metadata = {}) {
        if (!this.initialized || !this.supabase) {
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
            console.warn(`📊 [Analytics] Submitting event: ${eventName}...`);
            const { error } = await this.supabase
                .from('site_events')
                .insert(payload);

            if (error) {
                console.error('📊 [Analytics] DATABASE ERROR:', error.message, error.details);
                return;
            }
            console.warn(`📊 [Analytics] ✅ SUCCESS: ${eventName}`);
        } catch (err) {
            console.error('📊 [Analytics] CRITICAL FAILURE:', err.message);
        }
    }

    /**
     * Specific helper for page views
     */
    async trackPageView(path) {
        if (!this.initialized || !this.supabase) return;

        try {
            await this.supabase
                .from('site_events')
                .insert({
                    event_type: 'page_view',
                    event_name: 'view_page',
                    page_path: path,
                    session_id: this.sessionId
                });
            console.log(`📊 [Analytics] Page View: ${path}`);
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
