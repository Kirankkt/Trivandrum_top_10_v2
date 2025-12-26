/**
 * AnalyticsManager - Centralized tracking for Trivandrum Top 10
 * Uses secure Edge Function for data insertion (no direct DB access).
 */
class AnalyticsManager {
    constructor() {
        this.sessionId = this._getOrCreateSessionId();
        this.initialized = false;
        this.edgeFunctionUrl = null;

        // Auto-track page views on hash change
        window.addEventListener('hashchange', () => {
            this.trackPageView(window.location.hash);
        });
    }

    /**
     * Initialize with Supabase URL (for Edge Function calls)
     */
    init(supabaseClient) {
        this.supabase = supabaseClient;
        // Edge Function URL is based on the Supabase project URL
        // Format: https://<project-ref>.supabase.co/functions/v1/track-event
        const supabaseUrl = 'https://jhygaazqujzufiklqaah.supabase.co';
        this.edgeFunctionUrl = `${supabaseUrl}/functions/v1/track-event`;
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
