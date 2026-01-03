# Trivandrum Top 10

A data-driven ranking platform for Kerala's capital city. Objective, API-sourced rankings for localities, restaurants, hotels, and 20+ categories.

**Live Site**: https://trivandrumtop10.netlify.app/

## Features

- **Objective Rankings**: All scores derived from Google Maps API data (ratings, reviews, travel times)
- **25+ Categories**: Localities, Dining, Shopping, Culture, Nature, Sports, Wellness
- **Interactive Map Explorer**: View all ranked places on a single map
- **Customizable Weights**: Adjust scoring metrics to match your priorities
- **Compare Mode**: Side-by-side comparison of any items in a category
- **Mobile Responsive**: Works on all devices
- **Analytics Dashboard**: Track site usage (admin-only)

## Categories

| Group | Categories |
|-------|------------|
| **Localities** | 25 neighborhoods ranked by livability |
| **Dining & Stay** | Restaurants, Cafes, Hotels |
| **Shopping** | Malls, Clothing Stores, Supermarkets, Specialty Shops |
| **Culture** | Landmarks, Museums, Theatres, Art Galleries, Religious Sites |
| **Nature** | Beaches, Wildlife Sanctuaries, Backwaters |
| **Sports** | Sports Clubs, Adventure Sports, Training Academies |
| **Wellness** | Healthcare, Ayurveda & Spa, Yoga & Meditation |

## Tech Stack

- **Frontend**: Vanilla JavaScript (Single Page Application)
- **Styling**: Custom CSS with CSS Variables
- **Maps**: Google Maps JavaScript API
- **Data**: Static JSON files (API-sourced)
- **Analytics**: Supabase (PostgreSQL + Edge Functions)
- **Hosting**: Vercel / GitHub Pages

## Project Structure

```
trivandrum-top-10/
├── index.html              # Main HTML entry point
├── app.js                  # SPA router and initialization
├── styles.css              # All styles
├── js/
│   ├── views/              # Page view renderers
│   │   ├── home-view.js
│   │   ├── ranking-view.js
│   │   ├── entity-detail-view.js
│   │   ├── map-explorer-view.js
│   │   └── ...
│   ├── utils/
│   │   └── analytics.js    # Analytics manager
│   ├── compare.js          # Compare functionality
│   ├── search.js           # Search functionality
│   └── supabase-client.js  # Supabase initialization
├── data/                   # JSON data files
│   ├── localities.json
│   ├── restaurants.json
│   ├── hotels.json
│   └── ...
├── images/
│   ├── places/             # Place photos
│   └── localities/         # Locality photos
├── supabase/
│   ├── schema.sql          # Database schema
│   ├── migrations/         # RLS policies
│   └── functions/          # Edge functions
└── scripts/                # Data collection scripts
```

## Scoring Methodology

### Localities (6 Metrics)
- **Accessibility** (20%): Travel times to key destinations
- **Amenities** (25%): Schools, hospitals, restaurants nearby
- **Safety** (15%): Police/fire station proximity
- **Environment** (15%): Parks, noise levels, flood risk
- **Economy** (15%): Job proximity, commercial activity
- **Prestige** (10%): Real estate values

### Other Categories (3 Metrics)
- **Rating** (50%): Google Maps rating (1-5 stars)
- **Popularity** (30%): Review count (logarithmic scale)
- **Sentiment** (20%): Bonus for exceptional ratings (4.5+)

See the [Methodology page](https://trivandrum-top-10.vercel.app/#/methodology) for full details.

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Kirankkt/Trivandrum_top_10_v2.git
   cd Trivandrum_top_10_v2
   ```

2. Serve locally (any static server):
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .

   # Using VS Code Live Server extension
   # Right-click index.html > Open with Live Server
   ```

3. Open `http://localhost:8000` in your browser

### Environment Variables

For data collection scripts (not needed for frontend):
```
GOOGLE_MAPS_API_KEY=your_key_here
```

## Security

- **Row Level Security (RLS)**: Database inserts restricted to Edge Functions only
- **Rate Limiting**: 30 requests/minute per session
- **Input Validation**: Whitelist-based validation in Edge Functions
- **No Exposed Secrets**: All API keys either rotated or server-side only

## Data Sources

All data is sourced from public APIs:
- **Google Places API**: Ratings, reviews, photos, locations
- **Google Distance Matrix API**: Travel times
- **Google Elevation API**: Flood risk assessment
- **OpenAQ API**: Air quality data

No sponsored placements. No paid rankings.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contact

- **Email**: kthomaskiran3@gmail.com
- **Issues**: [GitHub Issues](https://github.com/Kirankkt/Trivandrum_top_10_v2/issues)

## License

This project is for educational and personal use. Data sourced from Google Maps is subject to Google's Terms of Service.

---

Built with data, not opinions.
