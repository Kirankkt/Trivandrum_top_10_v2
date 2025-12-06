// Search Functionality
let searchData = null;
let searchDropdown = null;

// Initialize search on page load
document.addEventListener('DOMContentLoaded', initSearch);

async function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    // Load search data
    const rankingsData = await loadRankings();
    if (rankingsData) {
        searchData = rankingsData.all_rankings || rankingsData.top_10 || [];
    }

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

    const results = searchLocalities(query);
    showSearchResults(query, results);
}

function searchLocalities(query) {
    if (!searchData) return [];

    // Search by name
    const matches = searchData.filter(locality => {
        const name = locality.name.toLowerCase();
        // Match if query is included anywhere or starts with query
        return name.includes(query) || name.startsWith(query);
    });

    // Sort: exact matches first, then starts with, then contains
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

        // Then alphabetical
        return aName.localeCompare(bName);
    });

    return matches;
}

function showSearchResults(query, results) {
    if (!searchDropdown) return;

    let html = '';

    if (results.length > 0) {
        // Show matching localities
        results.forEach((locality, idx) => {
            const categoryIcon = locality.data?.category_icon || '🏘️';
            const score = locality.overall_score ? locality.overall_score.toFixed(1) : 'N/A';

            html += `
                <div class="search-result-item" data-locality="${locality.name}" data-index="${idx}">
                    <span class="result-icon">${categoryIcon}</span>
                    <span class="result-name">${highlightMatch(locality.name, query)}</span>
                    <span class="result-score">${score}</span>
                </div>
            `;
        });
    } else {
        // No results - Authoritative message
        html = `
            <div class="search-no-results">
                <p><strong>"${escapeHtml(query)}"</strong> is not in the Top 20.</p>
                <p class="search-hint">We exclusively track Trivandrum's 20 most premium localities.</p>
            </div>
            <div class="search-request">
                <p>📍 <strong>Explore the list</strong></p>
                <p class="request-note">See all ranked locations starting from #1.</p>
                <button class="request-locality-btn btn-secondary" id="view-all-rankings-btn">
                    View Full Rankings
                </button>
            </div>
        `;
    }

    searchDropdown.innerHTML = html;
    searchDropdown.style.display = 'block';

    // Add click handlers
    searchDropdown.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const name = item.dataset.locality;
            window.location.hash = `/locality/${name}`;
            hideSearchDropdown();
            document.getElementById('search-input').value = '';
        });
    });

    // Add "View All" button handler
    const viewAllBtn = document.getElementById('view-all-rankings-btn');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            window.location.hash = '/'; // Go to home/rankings
            hideSearchDropdown();
            document.getElementById('search-input').value = '';
        });
    }
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
        const name = currentActive.dataset.locality;
        window.location.hash = `/locality/${name}`;
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


