// Compare Tool - State Manager
// Allows comparing up to 3 items within the same category

const CompareManager = {
    MAX_ITEMS: 3,
    STORAGE_KEY: 'tvm_compare',

    // Get current compare state
    getState() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : { category: null, items: [] };
        } catch (e) {
            return { category: null, items: [] };
        }
    },

    // Save state to localStorage
    saveState(state) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        this.updateUI();
    },

    // Add item to compare
    add(category, item) {
        const state = this.getState();

        // If different category, clear and start fresh
        if (state.category && state.category !== category) {
            state.items = [];
        }

        state.category = category;

        // Check if already added
        const exists = state.items.find(i => i.id === item.id || i.name === item.name);
        if (exists) {
            this.showToast('Already in compare list');
            return false;
        }

        // Check max limit
        if (state.items.length >= this.MAX_ITEMS) {
            this.showToast(`Maximum ${this.MAX_ITEMS} items allowed`);
            return false;
        }

        state.items.push({
            id: item.id || item.name,
            name: item.name,
            score: item.score || item.overall_score,
            image: item.image || item.photo_url
        });

        this.saveState(state);
        this.showToast(`Added "${item.name}" to compare`);
        return true;
    },

    // Remove item from compare
    remove(itemId) {
        const state = this.getState();
        state.items = state.items.filter(i => i.id !== itemId && i.name !== itemId);

        if (state.items.length === 0) {
            state.category = null;
        }

        this.saveState(state);
        return true;
    },

    // Clear all
    clear() {
        this.saveState({ category: null, items: [] });
    },

    // Check if item is in compare list
    isInCompare(itemId) {
        const state = this.getState();
        return state.items.some(i => i.id === itemId || i.name === itemId);
    },

    // Get count
    getCount() {
        return this.getState().items.length;
    },

    // Show toast notification
    showToast(message) {
        // Remove existing toast
        const existing = document.querySelector('.compare-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'compare-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    // Update floating compare bar UI
    updateUI() {
        const state = this.getState();
        let bar = document.querySelector('.compare-bar');

        if (state.items.length === 0) {
            if (bar) bar.remove();
            return;
        }

        // Create bar if doesn't exist
        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'compare-bar';
            document.body.appendChild(bar);
        }

        const categoryLabel = this.getCategoryLabel(state.category);

        bar.innerHTML = `
            <div class="compare-bar-content">
                <div class="compare-bar-items">
                    <span class="compare-bar-label">Compare ${categoryLabel}:</span>
                    ${state.items.map(item => `
                        <div class="compare-bar-item">
                            <span class="compare-bar-item-name">${item.name}</span>
                            <button class="compare-bar-item-remove" data-id="${item.id}" title="Remove">×</button>
                        </div>
                    `).join('')}
                    ${state.items.length < this.MAX_ITEMS ? `<span class="compare-bar-hint">Add ${this.MAX_ITEMS - state.items.length} more</span>` : ''}
                </div>
                <div class="compare-bar-actions">
                    <button class="compare-bar-clear">Clear</button>
                    <button class="compare-bar-go" ${state.items.length < 2 ? 'disabled' : ''}>
                        Compare Now
                    </button>
                </div>
            </div>
        `;

        // Event listeners
        bar.querySelectorAll('.compare-bar-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.remove(btn.dataset.id);
            });
        });

        bar.querySelector('.compare-bar-clear').addEventListener('click', () => {
            this.clear();
        });

        bar.querySelector('.compare-bar-go').addEventListener('click', () => {
            if (state.items.length >= 2) {
                window.location.hash = `/compare/${state.category}`;
            }
        });
    },

    getCategoryLabel(category) {
        const labels = {
            localities: 'Localities',
            restaurants: 'Restaurants',
            cafes: 'Cafes',
            hotels: 'Hotels',
            malls: 'Malls',
            boutiques: 'Boutiques',
            specialty_shops: 'Specialty Shops',
            museums: 'Museums',
            religious_sites: 'Religious Sites',
            healthcare: 'Healthcare',
            education: 'Education'
        };
        return labels[category] || category;
    },

    // Initialize - call on page load
    init() {
        this.updateUI();
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    CompareManager.init();
});

// Also init on hash change (SPA navigation)
window.addEventListener('hashchange', () => {
    setTimeout(() => CompareManager.updateUI(), 100);
});
