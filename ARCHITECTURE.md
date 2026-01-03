# Architecture Documentation

Technical documentation for the Trivandrum Top 10 codebase.

## Application Architecture

### Single Page Application (SPA)

The app uses hash-based routing without any framework:

```
index.html
    └── app.js (router)
            ├── #/ → home-view.js
            ├── #/localities → ranking-view.js
            ├── #/restaurants → category-stub-views.js
            ├── #/entity/:category/:id → entity-detail-view.js
            ├── #/map → map-explorer-view.js
            └── ...
```

### Routing (app.js)

```javascript
window.addEventListener('hashchange', handleRoute);

function handleRoute() {
    const hash = window.location.hash || '#/';

    if (hash === '/') renderHomeView();
    else if (hash === '/localities') renderLocalitiesRanking();
    else if (hash.startsWith('/entity/')) renderEntityDetail();
    // ... etc
}
```

### View Pattern

Each view is a function that:
1. Fetches required data (JSON files)
2. Renders HTML to `#app` container
3. Attaches event listeners

```javascript
async function renderCategoryView(category, config) {
    const response = await fetch(`data/${category}.json`);
    const data = await response.json();

    document.getElementById('app').innerHTML = `
        <div class="category-page">
            ${data.map(item => renderCard(item)).join('')}
        </div>
    `;

    attachEventListeners();
}
```

## Data Layer

### JSON Structure

All category data follows a consistent structure:

```json
{
  "id": "ChIJ...",
  "name": "Place Name",
  "score": 85.3,
  "rating": 4.5,
  "reviews": 1234,
  "address": "Full address",
  "image": "images/places/filename.jpg",
  "locality": "Pattom",
  "location": {
    "lat": 8.5241,
    "lng": 76.9366
  },
  "metrics": {
    "sentiment": 85,
    "popularity": 1234,
    "convenience": 8
  }
}
```

### Locality Data (Extended)

Localities have additional metrics:

```json
{
  "name": "Kowdiar",
  "qol_score": 8.5,
  "economic_score": 7.2,
  "charm_score": 8.0,
  "overall_score": 8.1,
  "metrics": {
    "accessibility": { "score": 7.8, "details": {...} },
    "amenities": { "score": 8.2, "details": {...} },
    "safety": { "score": 8.5, "details": {...} },
    "environment": { "score": 8.0, "details": {...} },
    "economy": { "score": 7.5, "details": {...} },
    "prestige": { "score": 9.0, "details": {...} }
  }
}
```

## Analytics System

### Architecture

```
Browser (analytics.js)
    ↓ POST /functions/v1/track-event
Edge Function (track-event/index.ts)
    ↓ Validates & rate-limits
Supabase PostgreSQL
    └── site_events table
    └── locality_views table
    └── rate_limits table
```

### Event Flow

1. **Client**: `analytics.trackEvent('marker_clicked', { name: 'Kowdiar' })`
2. **AnalyticsManager**: Adds session_id, user_agent, referrer
3. **Edge Function**: Validates event_type, event_name against whitelist
4. **Rate Limiter**: Checks 30 requests/minute limit
5. **Database**: INSERT with service_role (bypasses RLS)

### RLS Policies

```sql
-- Only Edge Function (service_role) can INSERT
CREATE POLICY "Service role insert only" ON site_events
  FOR INSERT TO service_role WITH CHECK (true);

-- Anyone can read analytics
CREATE POLICY "Enable read for all" ON site_events
  FOR SELECT USING (true);
```

## Map Explorer

### Multi-Category Map

The map explorer loads all categories simultaneously:

```javascript
const MAP_CATEGORIES = {
    localities: { color: '#10b981', dataFile: 'data/localities.json' },
    restaurants: { color: '#ef4444', dataFile: 'data/restaurants.json' },
    hotels: { color: '#3b82f6', dataFile: 'data/hotels.json' },
    // ... 20+ categories
};

async function loadAllMarkers() {
    for (const [key, config] of Object.entries(MAP_CATEGORIES)) {
        const data = await fetch(config.dataFile).then(r => r.json());
        data.forEach(item => createMarker(item, config.color));
    }
}
```

### Marker Clustering

Uses Google Maps MarkerClusterer for performance with 500+ markers.

## Customization System

### Weight Storage

User preferences stored in localStorage:

```javascript
// Key format: tvm_weights_{category}
localStorage.setItem('tvm_weights_restaurants', JSON.stringify({
    rating: 40,
    popularity: 35,
    sentiment: 25
}));
```

### Score Recalculation

```javascript
function recalculateScores(items, weights) {
    return items.map(item => {
        const score =
            (item.rating / 5) * weights.rating +
            normalizePopularity(item.reviews) * weights.popularity +
            (item.metrics.sentiment / 100) * weights.sentiment;
        return { ...item, customScore: score };
    }).sort((a, b) => b.customScore - a.customScore);
}
```

## Compare Mode

### State Management

```javascript
const CompareManager = {
    state: {
        category: null,
        items: [],  // Max 4 items
        isActive: false
    },

    addItem(item) {
        if (this.state.items.length < 4) {
            this.state.items.push(item);
            this.updateUI();
        }
    },

    getState() {
        return JSON.parse(localStorage.getItem('compare_state')) || this.state;
    }
};
```

## Performance Considerations

### Image Loading
- All images stored locally (no external API calls)
- Images named by photo_reference for cache-friendliness
- Lazy loading via IntersectionObserver

### Data Loading
- JSON files cached by browser
- No server-side rendering (static hosting)
- Category data loaded on-demand

### Bundle Size
- No framework dependencies
- Single CSS file (~100KB)
- Vanilla JS (~150KB total)

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### GitHub Pages
```bash
# Push to main branch
# Enable Pages in repo settings
# Set source to main branch, root folder
```

### Environment
- No build step required
- Static file serving only
- Supabase Edge Functions deployed separately

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Views | `{name}-view.js` | `home-view.js` |
| Data | `{category}.json` | `restaurants.json` |
| Images | `{photo_ref}.jpg` | `AZLasHq3-W6X.jpg` |
| Scripts | `{action}-{target}.js` | `download-photos.js` |

## Adding a New Category

1. **Create data file**: `data/new_category.json`
2. **Add route**: In `app.js`, add hash route
3. **Add view**: Create or use `category-stub-views.js`
4. **Add to map**: Update `MAP_CATEGORIES` in `map-explorer-view.js`
5. **Add to search**: Update `searchCategories` in `search.js`
6. **Add customize config**: Update `dining-customize-view.js`
7. **Update navigation**: Add link in `index.html`
