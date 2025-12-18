// Shared UI Components - Consistent cards, headers, and layouts across the app

/**
 * Section Header Component
 * @param {Object} options - Configuration options
 * @param {string} options.title - Section title
 * @param {string} [options.subtitle] - Optional subtitle
 * @param {string} [options.actionText] - Action button text
 * @param {string} [options.actionHref] - Action button link
 * @param {string} [options.badge] - Optional badge text (e.g., "Coming Soon")
 */
function createSectionHeader(options) {
    const { title, subtitle = '', actionText = '', actionHref = '', badge = '' } = options;

    return `
        <div class="section-header-unified">
            <div class="section-header-left">
                <h2 class="section-title-unified">${title}</h2>
                ${badge ? `<span class="section-badge">${badge}</span>` : ''}
                ${subtitle ? `<p class="section-subtitle">${subtitle}</p>` : ''}
            </div>
            ${actionText ? `
                <div class="section-header-right">
                    <a href="${actionHref}" class="section-action-btn">${actionText}</a>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Category Card Component (for navigation grids)
 * @param {Object} options - Configuration options
 * @param {string} options.title - Card title
 * @param {string} options.description - Card description
 * @param {string} options.icon - Emoji or icon
 * @param {string} options.href - Link destination
 * @param {string} [options.image] - Background image URL
 * @param {string} [options.badge] - Badge text (e.g., "New", "Coming Soon")
 * @param {boolean} [options.disabled] - Whether the card is disabled
 */
function createCategoryCard(options) {
    const {
        title,
        description,
        icon,
        href,
        image = 'images/skyline.png',
        badge = '',
        disabled = false
    } = options;

    const disabledClass = disabled ? 'category-card-disabled' : '';
    const linkAttr = disabled ? 'onclick="return false;"' : '';

    return `
        <a href="${href}" class="category-card-unified ${disabledClass}" ${linkAttr}>
            <div class="category-card-bg" style="background-image: url('${image}')"></div>
            <div class="category-card-overlay"></div>
            ${badge ? `<span class="category-card-badge">${badge}</span>` : ''}
            <div class="category-card-content">
                <span class="category-card-icon">${icon}</span>
                <h3 class="category-card-title">${title}</h3>
                <p class="category-card-desc">${description}</p>
            </div>
        </a>
    `;
}

/**
 * Subcategory Card Component (smaller cards within a category)
 * @param {Object} options - Configuration options
 * @param {string} options.title - Card title
 * @param {string} options.description - Card description
 * @param {string} options.icon - Emoji or icon
 * @param {string} options.href - Link destination
 * @param {string} [options.badge] - Badge text
 * @param {boolean} [options.disabled] - Whether the card is disabled
 */
function createSubcategoryCard(options) {
    const { title, description, icon, href, badge = '', disabled = false } = options;

    const disabledClass = disabled ? 'subcategory-card-disabled' : '';
    const linkAttr = disabled ? 'onclick="return false;"' : '';

    return `
        <a href="${href}" class="subcategory-card ${disabledClass}" ${linkAttr}>
            <div class="subcategory-icon">${icon}</div>
            <div class="subcategory-info">
                <h4 class="subcategory-title">${title}</h4>
                <p class="subcategory-desc">${description}</p>
            </div>
            ${badge ? `<span class="subcategory-badge">${badge}</span>` : ''}
        </a>
    `;
}

/**
 * List Card Component (for items in a category)
 * @param {Object} options - Configuration options
 * @param {number} options.rank - Item rank
 * @param {string} options.title - Item title
 * @param {string} options.subtitle - Item subtitle (e.g., locality name)
 * @param {string} options.image - Image URL
 * @param {number} [options.rating] - Rating (1-5)
 * @param {number} [options.reviews] - Number of reviews
 * @param {number} [options.score] - Score (0-100)
 * @param {string[]} [options.tags] - Tags/vibes array
 * @param {string} [options.href] - Link destination
 * @param {string} [options.accentColor] - Accent color for the card
 */
function createListCard(options) {
    const {
        rank,
        title,
        subtitle = '',
        image,
        rating = null,
        reviews = null,
        score = null,
        tags = [],
        href = '#',
        accentColor = '#00aa6c'
    } = options;

    const stars = rating ? '⭐'.repeat(Math.round(rating)) : '';
    const tagBadges = tags.slice(0, 3).map(tag => `<span class="list-card-tag">${tag}</span>`).join('');
    const featuredClass = rank <= 3 ? 'list-card-featured' : '';

    return `
        <div class="list-card ${featuredClass}">
            <div class="list-card-rank" style="background: ${accentColor}">#${rank}</div>
            <div class="list-card-image-container">
                <img src="${image}" alt="${title}" class="list-card-image" loading="lazy"
                     onerror="this.src='images/skyline.png'">
            </div>
            <div class="list-card-content">
                <h3 class="list-card-title">${title}</h3>
                ${subtitle ? `<p class="list-card-subtitle">${subtitle}</p>` : ''}
                ${rating !== null ? `
                    <div class="list-card-rating">
                        <span class="rating-value">${rating}</span>
                        <span class="rating-stars">${stars}</span>
                        ${reviews !== null ? `<span class="review-count">(${reviews.toLocaleString()})</span>` : ''}
                    </div>
                ` : ''}
                ${tags.length > 0 ? `<div class="list-card-tags">${tagBadges}</div>` : ''}
                ${score !== null ? `
                    <div class="list-card-score" style="color: ${accentColor}; border-color: ${accentColor}">
                        Score: ${Math.round(score)}/100
                    </div>
                ` : ''}
            </div>
            ${href !== '#' ? `<a href="${href}" class="list-card-link"></a>` : ''}
        </div>
    `;
}

/**
 * Coming Soon Placeholder Component
 * @param {Object} options - Configuration options
 * @param {string} options.title - Page title
 * @param {string} options.description - Description text
 * @param {string} options.icon - Emoji or icon
 * @param {string[]} [options.subcategories] - List of subcategories coming
 * @param {string} [options.backHref] - Back button destination
 */
function createComingSoonPage(options) {
    const {
        title,
        description,
        icon,
        subcategories = [],
        backHref = '#/'
    } = options;

    const subcatList = subcategories.length > 0
        ? `<div class="coming-soon-subcategories">
            <p>Coming categories:</p>
            <ul>${subcategories.map(s => `<li>${s}</li>`).join('')}</ul>
           </div>`
        : '';

    return `
        <div class="coming-soon-page">
            <a href="${backHref}" class="back-link">← Back to Home</a>
            <div class="coming-soon-content">
                <span class="coming-soon-icon">${icon}</span>
                <h1 class="coming-soon-title">${title}</h1>
                <p class="coming-soon-description">${description}</p>
                ${subcatList}
                <div class="coming-soon-badge">Coming Soon</div>
            </div>
        </div>
    `;
}

/**
 * Category Page Layout Component
 * @param {Object} options - Configuration options
 * @param {string} options.title - Page title
 * @param {string} options.subtitle - Page subtitle
 * @param {string} options.heroImage - Hero background image URL
 * @param {string} options.content - Main content HTML
 */
function createCategoryPageLayout(options) {
    const { title, subtitle, heroImage, content } = options;

    return `
        <div class="category-page">
            <div class="category-hero" style="background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${heroImage}')">
                <div class="category-hero-content">
                    <h1 class="category-hero-title">${title}</h1>
                    <p class="category-hero-subtitle">${subtitle}</p>
                </div>
            </div>
            <div class="category-body">
                ${content}
            </div>
        </div>
    `;
}

/**
 * Navigation Group for dropdown menus
 * @param {Object} options - Configuration options
 * @param {string} options.label - Group label
 * @param {string} options.icon - Group icon
 * @param {Array} options.items - Array of {label, href, badge?} items
 */
function createNavGroup(options) {
    const { label, icon, items } = options;

    const menuItems = items.map(item => `
        <a href="${item.href}" class="nav-dropdown-item">
            ${item.label}
            ${item.badge ? `<span class="nav-item-badge">${item.badge}</span>` : ''}
        </a>
    `).join('');

    return `
        <div class="nav-group">
            <button class="nav-group-trigger">
                <span class="nav-group-icon">${icon}</span>
                <span class="nav-group-label">${label}</span>
                <span class="nav-group-arrow">▼</span>
            </button>
            <div class="nav-dropdown">
                ${menuItems}
            </div>
        </div>
    `;
}
