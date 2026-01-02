// Recalculate scores with improved formula to avoid ties
// Run with: node scripts/recalculate_scores.js

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Categories to recalculate
const FILES = [
  'supermarkets.json',
  'clothing_stores.json',
  'art_galleries.json',
  'cultural_centers.json',
  'music_drama_centers.json',
  'landmarks.json',
  'ayurveda_wellness.json',
  'yoga_meditation.json',
  'beaches.json',
  'nature_sanctuaries.json',
  'backwaters.json',
  'sports_clubs.json',
  'training_academies.json',
  'adventure_sports.json'
];

// Improved scoring formula with logarithmic review scaling
function calculateScore(rating, reviews) {
  if (!rating || !reviews) return 0;

  // Rating component: 0-50 points (linear, based on rating)
  // Uses actual rating value for more granularity
  const ratingScore = (rating / 5) * 50;

  // Popularity component: 0-30 points (logarithmic scaling)
  // log10(50) = 1.7, log10(100) = 2, log10(500) = 2.7, log10(1000) = 3, log10(5000) = 3.7
  // Normalize: (log10(reviews) - 1) / 3 * 30, capped at 30
  const logReviews = Math.log10(Math.max(reviews, 10));
  const popularityScore = Math.min(30, Math.max(0, (logReviews - 1) / 2.7 * 30));

  // Sentiment bonus: 0-20 points (based on rating thresholds)
  // More granular thresholds
  let sentimentScore = 0;
  if (rating >= 4.7) sentimentScore = 20;
  else if (rating >= 4.5) sentimentScore = 17;
  else if (rating >= 4.3) sentimentScore = 14;
  else if (rating >= 4.0) sentimentScore = 11;
  else if (rating >= 3.5) sentimentScore = 7;
  else sentimentScore = 3;

  // Total score with 1 decimal precision
  const total = ratingScore + popularityScore + sentimentScore;
  return Math.round(total * 10) / 10;
}

// Process all files
function main() {
  console.log('Recalculating scores with improved formula...\n');

  let totalUpdated = 0;

  FILES.forEach(filename => {
    const filepath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filepath)) {
      console.log(`Skipping ${filename} (not found)`);
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

      // Recalculate scores
      data.forEach(item => {
        const oldScore = item.score;
        item.score = calculateScore(item.rating, item.reviews);
        if (oldScore !== item.score) {
          totalUpdated++;
        }
      });

      // Re-sort by score
      data.sort((a, b) => b.score - a.score);

      // Save
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      console.log(`${filename}: Updated ${data.length} items`);

      // Show top 5
      console.log('  Top 5:');
      data.slice(0, 5).forEach((item, i) => {
        console.log(`    ${i + 1}. ${item.name} - Score: ${item.score} (Rating: ${item.rating}, Reviews: ${item.reviews})`);
      });
      console.log('');

    } catch (err) {
      console.log(`Error processing ${filename}: ${err.message}`);
    }
  });

  console.log(`\nDone! Updated scores for ${totalUpdated} items.`);
}

main();
