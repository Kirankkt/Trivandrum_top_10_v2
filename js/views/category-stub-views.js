// Category Stub Views - Coming Soon pages for new categories

/**
 * Shop Category Views
 */
function renderMallsView() {
    const app = document.getElementById('app');
    app.innerHTML = createComingSoonPage({
        title: 'Malls',
        description: 'Discover the best shopping malls in Trivandrum — from mega malls to local favorites.',
        icon: '🏬',
        subcategories: ['Lulu Mall', 'Mall of Travancore', 'Spencer Plaza', 'More coming...'],
        backHref: '#/'
    });
    window.scrollTo(0, 0);
}

function renderBoutiquesView() {
    const app = document.getElementById('app');
    app.innerHTML = createComingSoonPage({
        title: 'Boutiques',
        description: 'Find unique fashion boutiques and designer stores across the city.',
        icon: '👗',
        subcategories: ['Fashion Boutiques', 'Bridal Wear', 'Traditional Kerala Wear', 'Designer Stores'],
        backHref: '#/'
    });
    window.scrollTo(0, 0);
}

function renderSpecialtyShopsView() {
    const app = document.getElementById('app');
    app.innerHTML = createComingSoonPage({
        title: 'Specialty Shops',
        description: 'Explore specialty stores for books, electronics, home decor, and more.',
        icon: '🛍️',
        subcategories: ['Bookstores', 'Electronics', 'Home Decor', 'Spices & Ayurveda', 'Handicrafts'],
        backHref: '#/'
    });
    window.scrollTo(0, 0);
}

/**
 * Culture Category Views
 */
function renderMuseumsView() {
    const app = document.getElementById('app');
    app.innerHTML = createComingSoonPage({
        title: 'Museums',
        description: 'Explore Trivandrum\'s rich cultural heritage through its museums and galleries.',
        icon: '🏛️',
        subcategories: ['Napier Museum', 'Natural History Museum', 'Kuthira Malika Palace', 'Art Galleries'],
        backHref: '#/'
    });
    window.scrollTo(0, 0);
}

function renderReligiousSitesView() {
    const app = document.getElementById('app');
    app.innerHTML = createComingSoonPage({
        title: 'Religious Sites',
        description: 'Discover temples, churches, and mosques that define Trivandrum\'s spiritual landscape.',
        icon: '🛕',
        subcategories: ['Padmanabhaswamy Temple', 'Attukal Bhagavathy Temple', 'Churches', 'Mosques'],
        backHref: '#/'
    });
    window.scrollTo(0, 0);
}

/**
 * Services Category Views
 */
function renderServicesView() {
    const app = document.getElementById('app');
    app.innerHTML = createComingSoonPage({
        title: 'Services & Gaps',
        description: 'Find essential services and identify what\'s missing in different localities.',
        icon: '🔧',
        subcategories: ['Healthcare', 'Education', 'Banking & Finance', 'Government Services', 'Service Gaps Analysis'],
        backHref: '#/'
    });
    window.scrollTo(0, 0);
}

/**
 * Shop Category Landing Page (optional - for future use)
 */
function renderShopCategoryView() {
    const app = document.getElementById('app');

    const content = `
        ${createSectionHeader({
            title: 'Shopping in Trivandrum',
            subtitle: 'From mega malls to specialty stores'
        })}
        <div class="subcategory-grid">
            ${createSubcategoryCard({
                title: 'Malls',
                description: 'Major shopping centers and mega malls',
                icon: '🏬',
                href: '#/malls',
                badge: 'Soon',
                disabled: true
            })}
            ${createSubcategoryCard({
                title: 'Boutiques',
                description: 'Fashion boutiques and designer stores',
                icon: '👗',
                href: '#/boutiques',
                badge: 'Soon',
                disabled: true
            })}
            ${createSubcategoryCard({
                title: 'Specialty Shops',
                description: 'Books, electronics, home decor & more',
                icon: '🛍️',
                href: '#/specialty-shops',
                badge: 'Soon',
                disabled: true
            })}
        </div>
    `;

    app.innerHTML = createCategoryPageLayout({
        title: 'Shop',
        subtitle: 'Discover shopping destinations across Trivandrum',
        heroImage: 'images/skyline.png',
        content: content
    });
    window.scrollTo(0, 0);
}

/**
 * Culture Category Landing Page (optional - for future use)
 */
function renderCultureCategoryView() {
    const app = document.getElementById('app');

    const content = `
        ${createSectionHeader({
            title: 'Culture & Heritage',
            subtitle: 'Explore Trivandrum\'s rich history and traditions'
        })}
        <div class="subcategory-grid">
            ${createSubcategoryCard({
                title: 'Museums',
                description: 'Art galleries and historical museums',
                icon: '🏛️',
                href: '#/museums',
                badge: 'Soon',
                disabled: true
            })}
            ${createSubcategoryCard({
                title: 'Religious Sites',
                description: 'Temples, churches, and mosques',
                icon: '🛕',
                href: '#/religious-sites',
                badge: 'Soon',
                disabled: true
            })}
        </div>
    `;

    app.innerHTML = createCategoryPageLayout({
        title: 'Culture',
        subtitle: 'Heritage, museums, and spiritual landmarks',
        heroImage: 'images/skyline.png',
        content: content
    });
    window.scrollTo(0, 0);
}
