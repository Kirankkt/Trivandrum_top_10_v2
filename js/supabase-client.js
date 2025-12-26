// Supabase Client Initialization
// Keys provided by user
const SUPABASE_URL = 'https://jhygaazqujzufiklqaah.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeWdhYXpxdWp6dWZpa2xxYWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzEyMTksImV4cCI6MjA4MDYwNzIxOX0.rR_FePTK4iHQyjVSVokPX6LsKpZY-mFI0KEkfdX1Jno';

let sbClient = null;

try {
    if (window.supabase) {
        sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ [Supabase] Connected to project:', SUPABASE_URL);

        // Initialize Analytics
        if (window.analytics) {
            window.analytics.init(sbClient);
        }

        // Make it globally available under a unique name
        window.sbClient = sbClient;
    } else {
        console.error('[Supabase] Library not found. Check script tag in index.html');
    }
} catch (error) {
    console.error('[Supabase] Initialization failed:', error);
}

// Edge Function URL for secure analytics
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/track-event`;

// Helper function to track locality views (via Edge Function)
async function trackLocalityView(localityName) {
    // Get or Create a simple persistent session ID for this browser
    let sessionId = localStorage.getItem('unique_session_id');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('unique_session_id', sessionId);
    }

    try {
        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                type: 'locality_view',
                data: {
                    locality_name: localityName,
                    session_id: sessionId
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Edge Function error');
        }

        console.log(`[Supabase] Tracked view for: ${localityName}`);
    } catch (err) {
        // Fail silently so user experience isn't affected
        console.warn('[Supabase] Failed to track view:', err.message);
    }
}

// Make helper global so views can use it
window.trackLocalityView = trackLocalityView;

// Get trending localities (most viewed in last 7 days)
async function getTrendingLocalities(limit = 3) {
    if (!sbClient) return [];

    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data, error } = await sbClient
            .from('locality_views')
            .select('locality_name')
            .gte('viewed_at', oneWeekAgo.toISOString());

        if (error) throw error;

        // Count occurrences
        const counts = {};
        data.forEach(row => {
            counts[row.locality_name] = (counts[row.locality_name] || 0) + 1;
        });

        // Sort by count and return top N
        const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);

        console.log('[Supabase] Trending localities:', sorted);
        return sorted;
    } catch (err) {
        console.warn('[Supabase] Failed to get trending:', err.message);
        return [];
    }
}

window.getTrendingLocalities = getTrendingLocalities;
