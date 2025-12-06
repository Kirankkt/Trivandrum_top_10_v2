// Supabase Client Initialization
// Keys provided by user
const SUPABASE_URL = 'https://jhygaazqujzufiklqaah.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeWdhYXpxdWp6dWZpa2xxYWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzEyMTksImV4cCI6MjA4MDYwNzIxOX0.rR_FePTK4iHQyjVSVokPX6LsKpZY-mFI0KEkfdX1Jno';

let supabase = null;

try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[Supabase] Client initialized successfully');
    } else {
        console.error('[Supabase] Library not found. Check script tag in index.html');
    }
} catch (error) {
    console.error('[Supabase] Initialization failed:', error);
}

// Helper function to track locality views
async function trackLocalityView(localityName) {
    if (!supabase) return;

    // Get or Create a simple persistent session ID for this browser
    let sessionId = localStorage.getItem('unique_session_id');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('unique_session_id', sessionId);
    }

    try {
        const { error } = await supabase
            .from('locality_views')
            .insert({
                locality_name: localityName,
                session_id: sessionId
            });

        if (error) throw error;
        console.log(`[Supabase] Tracked view for: ${localityName}`);
    } catch (err) {
        // Fail silently so user experience isn't affected
        console.warn('[Supabase] Failed to track view:', err.message);
    }
}

// Make helper global so views can use it
window.trackLocalityView = trackLocalityView;
