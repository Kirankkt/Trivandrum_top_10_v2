// Locality Finder Quiz - ML-powered locality matching using cosine similarity

// Quiz questions configuration
const quizQuestions = [
  {
    id: 'budget',
    question: 'What is your property budget range?',
    options: [
      { label: 'Budget-friendly (Under 12L/cent)', value: 'low', vector: { economy: 1.0, prestige: 0.2 } },
      { label: 'Mid-range (12-18L/cent)', value: 'mid', vector: { economy: 0.6, prestige: 0.5 } },
      { label: 'Premium (18-22L/cent)', value: 'high', vector: { economy: 0.3, prestige: 0.8 } },
      { label: 'Ultra-premium (22L+ /cent)', value: 'ultra', vector: { economy: 0.1, prestige: 1.0 } }
    ]
  },
  {
    id: 'workplace',
    question: 'Where do you primarily work or commute to?',
    options: [
      { label: 'Technopark / IT Corridor', value: 'technopark', vector: { technopark_proximity: 1.0, city_proximity: 0.3 } },
      { label: 'City Centre / Secretariat', value: 'city', vector: { technopark_proximity: 0.3, city_proximity: 1.0 } },
      { label: 'Medical College Area', value: 'medical', vector: { medical_proximity: 1.0, city_proximity: 0.5 } },
      { label: 'Remote / Flexible', value: 'remote', vector: { technopark_proximity: 0.5, city_proximity: 0.5, environment: 0.8 } }
    ]
  },
  {
    id: 'household',
    question: 'Who will be living with you?',
    options: [
      { label: 'Just me', value: 'single', vector: { amenities: 0.8, environment: 0.5, safety: 0.6 } },
      { label: 'Me and partner', value: 'couple', vector: { amenities: 0.9, environment: 0.7, safety: 0.7 } },
      { label: 'Family with young children', value: 'young_family', vector: { safety: 1.0, schools: 1.0, environment: 0.8, amenities: 0.9 } },
      { label: 'Family with school-age children', value: 'school_family', vector: { schools: 1.0, safety: 0.9, amenities: 0.8 } }
    ]
  },
  {
    id: 'priority',
    question: 'What matters most in your ideal neighborhood?',
    options: [
      { label: 'Safety and security', value: 'safety', vector: { safety: 1.0, environment: 0.6 } },
      { label: 'Shops, restaurants, entertainment', value: 'amenities', vector: { amenities: 1.0, city_proximity: 0.7 } },
      { label: 'Green spaces and quiet environment', value: 'peace', vector: { environment: 1.0, noise_low: 1.0, safety: 0.6 } },
      { label: 'Prestige and upscale neighborhood', value: 'prestige', vector: { prestige: 1.0, amenities: 0.7 } }
    ]
  },
  {
    id: 'lifestyle',
    question: 'How would you describe your lifestyle?',
    options: [
      { label: 'Fast-paced, need everything nearby', value: 'urban', vector: { amenities: 1.0, city_proximity: 0.9, accessibility: 0.9 } },
      { label: 'Balanced - work hard, relax at home', value: 'balanced', vector: { amenities: 0.7, environment: 0.7, safety: 0.7 } },
      { label: 'Quiet and peaceful, minimal hustle', value: 'peaceful', vector: { environment: 1.0, noise_low: 1.0, amenities: 0.4 } },
      { label: 'Beach lover, coastal vibes', value: 'coastal', vector: { beach_access: 1.0, environment: 0.8 } }
    ]
  },
  {
    id: 'commute',
    question: 'How far are you willing to commute daily?',
    options: [
      { label: 'Under 15 minutes', value: 'short', vector: { accessibility: 1.0 } },
      { label: '15-30 minutes', value: 'medium', vector: { accessibility: 0.7 } },
      { label: '30-45 minutes', value: 'long', vector: { accessibility: 0.4 } },
      { label: 'Commute time does not matter', value: 'any', vector: { accessibility: 0.5, environment: 0.3 } }
    ]
  }
];

// Locality feature vectors (pre-computed from data)
function buildLocalityVectors(localities) {
  // Find min/max for normalization
  const minMax = {
    land_price: { min: Infinity, max: -Infinity },
    technopark_time: { min: Infinity, max: -Infinity },
    city_centre_time: { min: Infinity, max: -Infinity },
    medical_college_time: { min: Infinity, max: -Infinity }
  };

  localities.forEach(loc => {
    const data = loc.data || {};
    if (loc.land_price < minMax.land_price.min) minMax.land_price.min = loc.land_price;
    if (loc.land_price > minMax.land_price.max) minMax.land_price.max = loc.land_price;
    if (data.technopark_time < minMax.technopark_time.min) minMax.technopark_time.min = data.technopark_time;
    if (data.technopark_time > minMax.technopark_time.max) minMax.technopark_time.max = data.technopark_time;
    if (data.city_centre_time < minMax.city_centre_time.min) minMax.city_centre_time.min = data.city_centre_time;
    if (data.city_centre_time > minMax.city_centre_time.max) minMax.city_centre_time.max = data.city_centre_time;
    if (data.medical_college_time < minMax.medical_college_time.min) minMax.medical_college_time.min = data.medical_college_time;
    if (data.medical_college_time > minMax.medical_college_time.max) minMax.medical_college_time.max = data.medical_college_time;
  });

  return localities.map(loc => {
    const breakdown = loc.breakdown || {};
    const data = loc.data || {};

    // Normalize scores to 0-1
    const normalize = (val, min, max) => max > min ? 1 - (val - min) / (max - min) : 0.5;

    return {
      name: loc.name,
      overall_score: loc.overall_score,
      land_price: loc.land_price,
      apartment_price: loc.apartment_price,
      rank: loc.rank,
      vector: {
        accessibility: (breakdown.accessibility || 5) / 10,
        amenities: (breakdown.amenities || 5) / 10,
        safety: (breakdown.safety || 5) / 10,
        environment: (breakdown.environment || 5) / 10,
        economy: (breakdown.economy || 5) / 10,
        prestige: (breakdown.prestige || 5) / 10,
        technopark_proximity: normalize(data.technopark_time || 30, minMax.technopark_time.min, minMax.technopark_time.max),
        city_proximity: normalize(data.city_centre_time || 15, minMax.city_centre_time.min, minMax.city_centre_time.max),
        medical_proximity: normalize(data.medical_college_time || 20, minMax.medical_college_time.min, minMax.medical_college_time.max),
        noise_low: (data.noise_score || 5) / 10,
        schools: (data.school_avg_rating || 4) / 5,
        beach_access: loc.name === 'Kovalam' || loc.name === 'Varkala' ? 1.0 : 0.1
      }
    };
  });
}

// Build user preference vector from quiz answers
function buildUserVector(answers) {
  const userVector = {};
  const dimensions = ['accessibility', 'amenities', 'safety', 'environment', 'economy', 'prestige',
    'technopark_proximity', 'city_proximity', 'medical_proximity', 'noise_low', 'schools', 'beach_access'];

  // Initialize all dimensions to 0
  dimensions.forEach(dim => userVector[dim] = 0);

  // Aggregate vectors from all answers
  let totalWeight = 0;
  Object.values(answers).forEach(answer => {
    if (answer && answer.vector) {
      Object.entries(answer.vector).forEach(([key, value]) => {
        userVector[key] = (userVector[key] || 0) + value;
      });
      totalWeight++;
    }
  });

  // Normalize
  if (totalWeight > 0) {
    Object.keys(userVector).forEach(key => {
      userVector[key] = Math.min(userVector[key] / totalWeight, 1);
    });
  }

  return userVector;
}

// Cosine similarity calculation
function cosineSimilarity(vecA, vecB) {
  const keys = Object.keys(vecA);
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  keys.forEach(key => {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  });

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// Find matching localities
function findMatches(userVector, localityVectors) {
  const matches = localityVectors.map(loc => ({
    ...loc,
    similarity: cosineSimilarity(userVector, loc.vector)
  }));

  // Sort by similarity descending
  matches.sort((a, b) => b.similarity - a.similarity);

  return matches.slice(0, 5); // Top 5 matches
}

// Generate match reasons based on user preferences and locality features
function generateMatchReasons(userVector, localityVector, localityName) {
  const reasons = [];
  const thresholds = { high: 0.7, medium: 0.5 };

  // Check which user preferences are strongest
  const userPriorities = Object.entries(userVector)
    .filter(([key, val]) => val > thresholds.medium)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  userPriorities.forEach(([key, userVal]) => {
    const locVal = localityVector[key] || 0;
    if (locVal > thresholds.medium) {
      switch (key) {
        case 'safety':
          reasons.push('Strong safety and security profile');
          break;
        case 'amenities':
          reasons.push('Excellent access to shops and services');
          break;
        case 'environment':
          reasons.push('Pleasant, green environment');
          break;
        case 'prestige':
          reasons.push('Premium, upscale neighborhood');
          break;
        case 'economy':
          reasons.push('Good value for money');
          break;
        case 'technopark_proximity':
          reasons.push('Quick commute to Technopark');
          break;
        case 'city_proximity':
          reasons.push('Close to city centre');
          break;
        case 'medical_proximity':
          reasons.push('Near Medical College area');
          break;
        case 'schools':
          reasons.push('Highly-rated schools nearby');
          break;
        case 'noise_low':
          reasons.push('Quiet, peaceful atmosphere');
          break;
        case 'beach_access':
          reasons.push('Beach lifestyle access');
          break;
        case 'accessibility':
          reasons.push('Well-connected, easy commutes');
          break;
      }
    }
  });

  return reasons.slice(0, 3); // Max 3 reasons
}

// Main render function
async function renderLocalityFinderView() {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="loading">Loading quiz...</div>';

  // Load locality data
  const response = await fetch('data/clean_rankings.json');
  const data = await response.json();
  const localities = data.all_rankings || [];
  const localityVectors = buildLocalityVectors(localities);

  // Quiz state
  let currentQuestion = -1; // -1 = intro screen
  const answers = {};

  function renderQuiz() {
    if (currentQuestion === -1) {
      // Intro screen
      app.innerHTML = `
        <div class="quiz-container">
          <div class="quiz-intro">
            <span class="quiz-badge">ML-Powered</span>
            <h1 class="quiz-title">Find Your Ideal Locality</h1>
            <p class="quiz-description">
              Answer 6 quick questions about your lifestyle and preferences.
              Our algorithm will match you with the best neighborhoods in Trivandrum.
            </p>
            <div class="quiz-meta">
              <div class="quiz-meta-item">
                <span class="meta-value">6</span>
                <span class="meta-label">Questions</span>
              </div>
              <div class="quiz-meta-item">
                <span class="meta-value">30</span>
                <span class="meta-label">Seconds</span>
              </div>
              <div class="quiz-meta-item">
                <span class="meta-value">20</span>
                <span class="meta-label">Localities</span>
              </div>
            </div>
            <button class="quiz-start-btn" id="start-quiz">Start Quiz</button>
            <a href="#/localities" class="quiz-skip-link">or browse all localities</a>
          </div>
        </div>
      `;

      document.getElementById('start-quiz').addEventListener('click', () => {
        currentQuestion = 0;
        renderQuiz();
      });
      return;
    }

    if (currentQuestion >= quizQuestions.length) {
      // Show results
      renderResults();
      return;
    }

    const question = quizQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

    app.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-progress">
          <div class="quiz-progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="quiz-header">
          <span class="quiz-step">Question ${currentQuestion + 1} of ${quizQuestions.length}</span>
          ${currentQuestion > 0 ? '<button class="quiz-back-btn" id="quiz-back">Back</button>' : ''}
        </div>
        <div class="quiz-question">
          <h2>${question.question}</h2>
          <div class="quiz-options">
            ${question.options.map((opt, idx) => `
              <button class="quiz-option" data-index="${idx}">
                ${opt.label}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Event listeners
    document.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        answers[question.id] = question.options[idx];
        currentQuestion++;
        renderQuiz();
      });
    });

    const backBtn = document.getElementById('quiz-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        currentQuestion--;
        renderQuiz();
      });
    }
  }

  function renderResults() {
    const userVector = buildUserVector(answers);
    const matches = findMatches(userVector, localityVectors);

    app.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-results">
          <div class="results-header">
            <span class="results-badge">Analysis Complete</span>
            <h1 class="results-title">Your Top Matches</h1>
            <p class="results-subtitle">Based on your preferences, here are the best localities for you</p>
          </div>

          <div class="results-grid">
            ${matches.map((match, idx) => {
              const matchPercent = Math.round(match.similarity * 100);
              const reasons = generateMatchReasons(userVector, match.vector, match.name);
              const isTop = idx === 0;

              return `
                <div class="result-card ${isTop ? 'result-card-top' : ''}">
                  ${isTop ? '<div class="result-best-match">Best Match</div>' : ''}
                  <div class="result-rank">#${idx + 1}</div>
                  <div class="result-match-score">
                    <span class="match-percent">${matchPercent}%</span>
                    <span class="match-label">Match</span>
                  </div>
                  <h3 class="result-name">${match.name}</h3>
                  <div class="result-overall">
                    <span class="overall-score">${match.overall_score?.toFixed(1) || 'N/A'}</span>
                    <span class="overall-label">Overall Score</span>
                  </div>
                  <div class="result-reasons">
                    ${reasons.map(r => `<span class="reason-tag">${r}</span>`).join('')}
                  </div>
                  <div class="result-price">
                    Land: ${match.land_price}L/cent | Apt: ${match.apartment_price}/sqft
                  </div>
                  <a href="#/locality/${encodeURIComponent(match.name)}" class="result-explore-btn">
                    Explore ${match.name}
                  </a>
                </div>
              `;
            }).join('')}
          </div>

          <div class="results-actions">
            <button class="quiz-retake-btn" id="retake-quiz">Retake Quiz</button>
            <a href="#/localities" class="quiz-browse-btn">Browse All Localities</a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('retake-quiz').addEventListener('click', () => {
      currentQuestion = -1;
      Object.keys(answers).forEach(key => delete answers[key]);
      renderQuiz();
    });
  }

  renderQuiz();
}
