// Search Functionality - All Categories
let allSearchData = [];
let searchDropdown = null;

// Category configuration for search
const searchCategories = [
    { key: 'localities', file: null, label: 'Localities', icon: '🏘️', route: '/locality/' },
    { key: 'restaurants', file: 'data/restaurants.json', label: 'Restaurants', icon: '🍽️', route: '/entity/restaurants/' },
    { key: 'cafes', file: 'data/cafes.json', label: 'Cafes', icon: '☕', route: '/entity/cafes/' },
    { key: 'hotels', file: 'data/hotels.json', label: 'Hotels', icon: '🏨', route: '/entity/hotels/' },
    { key: 'malls', file: 'data/malls.json', label: 'Malls', icon: '🛒', route: '/entity/malls/' },
    { key: 'boutiques', file: 'data/boutiques.json', label: 'Boutiques', icon: '👗', route: '/entity/boutiques/' },
    { key: 'specialty_shops', file: 'data/specialty_shops.json', label: 'Specialty Shops', icon: '🎁', route: '/entity/specialty_shops/' },
    { key: 'museums', file: 'data/museums.json', label: 'Museums', icon: '🏛️', route: '/entity/museums/' },
    { key: 'religious_sites', file: 'data/religious_sites.json', label: 'Religious Sites', icon: '🛕', route: '/entity/religious_sites/' },
    { key: 'healthcare', file: 'data/healthcare.json', label: 'Healthcare', icon: '🏥', route: '/entity/healthcare/' },
    { key: 'education', file: 'data/education.json', label: 'Education', icon: '🎓', route: '/entity/education/' },
    { key: 'banking', file: 'data/banking.json', label: 'Banking', icon: '🏦', route: '/entity/banking/' }
];

// Initialize search on page load
document.addEventListener('DOMContentLoaded', initSearch);

async function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    // Load all search data
    await loadAllSearchData();

    // Create dropdown container
    createSearchDropdown();

    // Add event listeners
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim()) {
            handleSearchInput({ target: searchInput });
        }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-bar')) {
            hideSearchDropdown();
        }
    });

    // Handle keyboard navigation
    searchInput.addEventListener('keydown', handleSearchKeydown);
}

async function loadAllSearchData() {
    allSearchData = [];

    // Load localities from rankings
    try {
        const rankingsData = await loadRankings();
        if (rankingsData) {
            const localities = rankingsData.all_rankings || rankingsData.top_10 || [];
            localities.forEach(loc => {
                allSearchData.push({
                    name: loc.name,
                    category: 'localities',
                    categoryLabel: 'Localities',
                    icon: '🏘️',
                    route: `/locality/${loc.name}`,
                    score: loc.overall_score,
                    id: loc.name
                });
            });
        }
    } catch (e) {
        console.warn('Could not load localities for search');
    }

    // Load all other categories
    for (const cat of searchCategories) {
        if (!cat.file) continue; // Skip localities, already loaded

        try {
            const response = await fetch(cat.file);
            if (response.ok) {
                const data = await response.json();
                data.forEach(item => {
                    allSearchData.push({
                        name: item.name,
                        category: cat.key,
                        categoryLabel: cat.label,
                        icon: cat.icon,
                        route: `${cat.route}${encodeURIComponent(item.id || item.name)}`,
                        score: item.score || item.rating,
                        id: item.id || item.name,
                        locality: item.locality
                    });
                });
            }
        } catch (e) {
            console.warn(`Could not load ${cat.key} for search`);
        }
    }

    console.log(`Search initialized with ${allSearchData.length} items across all categories`);
}

function createSearchDropdown() {
    const searchBar = document.querySelector('.search-bar');
    if (!searchBar) return;

    searchDropdown = document.createElement('div');
    searchDropdown.className = 'search-dropdown';
    searchDropdown.style.display = 'none';
    searchBar.appendChild(searchDropdown);
}

function handleSearchInput(e) {
    const query = e.target.value.trim().toLowerCase();

    if (!query) {
        hideSearchDropdown();
        return;
    }

    const results = searchAllCategories(query);
    showSearchResults(query, results);
}

function searchAllCategories(query) {
    if (!allSearchData.length) return [];

    // Search by name
    const matches = allSearchData.filter(item => {
        const name = item.name.toLowerCase();
        return name.includes(query) || name.startsWith(query);
    });

    // Sort: exact matches first, then starts with, then contains, then by score
    matches.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        // Exact match comes first
        if (aName === query) return -1;
        if (bName === query) return 1;

        // Starts with comes next
        const aStarts = aName.startsWith(query);
        const bStarts = bName.startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Then by score (higher first)
        const aScore = a.score || 0;
        const bScore = b.score || 0;
        if (aScore !== bScore) return bScore - aScore;

        // Then alphabetical
        return aName.localeCompare(bName);
    });

    // Limit to 15 results max
    return matches.slice(0, 15);
}

function showSearchResults(query, results) {
    if (!searchDropdown) return;

    let html = '';

    if (results.length > 0) {
        // Group results by category for better UX
        const grouped = {};
        results.forEach(item => {
            if (!grouped[item.categoryLabel]) {
                grouped[item.categoryLabel] = [];
            }
            grouped[item.categoryLabel].push(item);
        });

        let globalIdx = 0;
        for (const [category, items] of Object.entries(grouped)) {
            html += `<div class="search-category-header">${category}</div>`;
            items.forEach(item => {
                const scoreDisplay = item.score ? (typeof item.score === 'number' ? item.score.toFixed(1) : item.score) : '';
                const localityDisplay = item.locality ? `<span class="result-locality">${item.locality}</span>` : '';

                html += `
                    <div class="search-result-item" data-route="${item.route}" data-index="${globalIdx}">
                        <span class="result-icon">${item.icon}</span>
                        <div class="result-info">
                            <span class="result-name">${highlightMatch(item.name, query)}</span>
                            ${localityDisplay}
                        </div>
                        ${scoreDisplay ? `<span class="result-score">${scoreDisplay}</span>` : ''}
                    </div>
                `;
                globalIdx++;
            });
        }
    } else {
        // No results
        html = `
            <div class="search-no-results">
                <p>No results for "<strong>${escapeHtml(query)}</strong>"</p>
                <p class="search-hint">Try searching for localities, restaurants, hotels, or other places.</p>
            </div>
        `;
    }

    searchDropdown.innerHTML = html;
    searchDropdown.style.display = 'block';

    // Add click handlers
    searchDropdown.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const route = item.dataset.route;
            window.location.hash = route;
            hideSearchDropdown();
            document.getElementById('search-input').value = '';
        });
    });
}

function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return escapeHtml(text);

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);

    return escapeHtml(before) + '<mark>' + escapeHtml(match) + '</mark>' + escapeHtml(after);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function hideSearchDropdown() {
    if (searchDropdown) {
        searchDropdown.style.display = 'none';
    }
}

function handleSearchKeydown(e) {
    if (!searchDropdown || searchDropdown.style.display === 'none') return;

    const items = searchDropdown.querySelectorAll('.search-result-item');
    if (items.length === 0) return;

    const currentActive = searchDropdown.querySelector('.search-result-item.active');
    let currentIndex = currentActive ? parseInt(currentActive.dataset.index) : -1;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentIndex = Math.min(currentIndex + 1, items.length - 1);
        updateActiveItem(items, currentIndex);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        updateActiveItem(items, currentIndex);
    } else if (e.key === 'Enter' && currentActive) {
        e.preventDefault();
        const route = currentActive.dataset.route;
        window.location.hash = route;
        hideSearchDropdown();
        document.getElementById('search-input').value = '';
    } else if (e.key === 'Escape') {
        hideSearchDropdown();
    }
}

function updateActiveItem(items, index) {
    items.forEach(item => item.classList.remove('active'));
    if (items[index]) {
        items[index].classList.add('active');
        items[index].scrollIntoView({ block: 'nearest' });
    }
}
