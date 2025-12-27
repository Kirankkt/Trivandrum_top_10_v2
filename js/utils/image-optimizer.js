/**
 * Image Optimization Utilities
 * Provides WebP support with fallbacks for older browsers
 */

(function() {
    // Check WebP support once on load
    let webpSupported = null;

    async function checkWebPSupport() {
        if (webpSupported !== null) return webpSupported;

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                webpSupported = img.width > 0 && img.height > 0;
                resolve(webpSupported);
            };
            img.onerror = () => {
                webpSupported = false;
                resolve(false);
            };
            // Tiny WebP image
            img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
        });
    }

    // Initialize WebP check
    checkWebPSupport();

    /**
     * Get optimized image URL
     * Returns WebP version if supported and exists, otherwise original
     *
     * @param {string} url - Original image URL
     * @returns {string} - Optimized image URL
     */
    function getOptimizedImageUrl(url) {
        if (!url) return url;

        // Skip external URLs (Google Places photos, etc.)
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // Skip if already WebP
        if (url.endsWith('.webp')) {
            return url;
        }

        // Only convert local images with supported formats
        if (!/\.(png|jpg|jpeg)$/i.test(url)) {
            return url;
        }

        // If WebP not supported, return original
        if (webpSupported === false) {
            return url;
        }

        // Return WebP version (will fall back naturally if file doesn't exist)
        return url.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    }

    /**
     * Create an image element with WebP support
     * Uses picture element for proper fallback
     *
     * @param {string} src - Original image source
     * @param {string} alt - Alt text
     * @param {string} className - CSS class names
     * @param {boolean} lazy - Use lazy loading (default: true)
     * @returns {string} - HTML string
     */
    function createOptimizedImage(src, alt = '', className = '', lazy = true) {
        if (!src) {
            return `<img src="https://via.placeholder.com/400x250?text=No+Image" alt="${alt}" class="${className}" loading="lazy">`;
        }

        // External URLs don't get WebP treatment
        if (src.startsWith('http://') || src.startsWith('https://')) {
            return `<img src="${src}" alt="${alt}" class="${className}" ${lazy ? 'loading="lazy"' : ''} onerror="this.src='https://via.placeholder.com/400x250?text=No+Image'">`;
        }

        // Local images with supported formats get picture element
        if (/\.(png|jpg|jpeg)$/i.test(src)) {
            const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
            return `
                <picture>
                    <source srcset="${webpSrc}" type="image/webp">
                    <img src="${src}" alt="${alt}" class="${className}" ${lazy ? 'loading="lazy"' : ''} onerror="this.src='https://via.placeholder.com/400x250?text=No+Image'">
                </picture>
            `;
        }

        // Default fallback
        return `<img src="${src}" alt="${alt}" class="${className}" ${lazy ? 'loading="lazy"' : ''} onerror="this.src='https://via.placeholder.com/400x250?text=No+Image'">`;
    }

    /**
     * Create a background image style with WebP support
     *
     * @param {string} url - Original image URL
     * @returns {string} - CSS background-image value
     */
    function getOptimizedBackgroundUrl(url) {
        const optimizedUrl = getOptimizedImageUrl(url);
        return optimizedUrl;
    }

    // Export to global scope
    window.ImageOptimizer = {
        getOptimizedUrl: getOptimizedImageUrl,
        createImage: createOptimizedImage,
        getBackgroundUrl: getOptimizedBackgroundUrl,
        isWebPSupported: () => webpSupported
    };
})();
