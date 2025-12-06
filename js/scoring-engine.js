/**
 * Trivandrum Top 10 Rankings - Scoring Engine
 * Category-agnostic weighted scoring algorithm
 */

class ScoringEngine {
    constructor(schema) {
        this.schema = schema;
    }

    /**
     * Calculate score for a single item
     * @param {Object} item - Item with data properties
     * @param {string} categoryId - Category ID (e.g., 'localities')
     * @param {Object} customWeights - Optional custom category weights
     * @returns {Object} - Score object with total and breakdown
     */
    calculateScore(item, categoryId, customWeights = null) {
        const category = this.schema.categories[categoryId];
        if (!category) {
            throw new Error(`Category ${categoryId} not found in schema`);
        }

        let totalScore = 0;
        const breakdown = {
            overall: 0,
            categories: []
        };

        // Iterate through scoring categories (Accessibility, Safety, etc.)
        for (const scoringCategory of category.scoringCategories) {
            const weight = customWeights?.[scoringCategory.id] ?? scoringCategory.weight;
            const categoryScore = this.calculateCategoryScore(item, scoringCategory);

            totalScore += categoryScore * weight;

            breakdown.categories.push({
                id: scoringCategory.id,
                name: scoringCategory.name,
                score: categoryScore,
                weight: weight,
                weightedScore: categoryScore * weight,
                metrics: this.getMetricsBreakdown(item, scoringCategory)
            });
        }

        breakdown.overall = totalScore * 10; // Scale to 0-10
        return breakdown;
    }

    /**
     * Calculate score for a single category (e.g., Accessibility)
     */
    calculateCategoryScore(item, scoringCategory) {
        let categoryScore = 0;

        for (const metric of scoringCategory.metrics) {
            const rawValue = item.data[metric.id];
            if (rawValue === undefined || rawValue === null) {
                console.warn(`Missing metric ${metric.id} for item ${item.id}`);
                continue;
            }

            const normalizedValue = this.normalizeValue(rawValue, metric);
            categoryScore += normalizedValue * metric.weight;
        }

        return categoryScore;
    }

    /**
     * Normalize a raw metric value to 0-1 scale
     */
    normalizeValue(rawValue, metric) {
        const { min, max, invertScale } = metric;

        // Clamp value to min/max range
        const clampedValue = Math.max(min, Math.min(max, rawValue));

        // Normalize to 0-1
        let normalized = (clampedValue - min) / (max - min);

        // Invert if needed (e.g., lower travel time = better)
        if (invertScale) {
            normalized = 1 - normalized;
        }

        return normalized;
    }

    /**
     * Get detailed breakdown of metrics for a category
     */
    getMetricsBreakdown(item, scoringCategory) {
        return scoringCategory.metrics.map(metric => {
            const rawValue = item.data[metric.id];
            const normalized = this.normalizeValue(rawValue, metric);

            return {
                id: metric.id,
                name: metric.name,
                rawValue: rawValue,
                normalizedValue: normalized,
                score: normalized * 10, // Scale to 0-10 for display
                weight: metric.weight,
                unit: metric.unit
            };
        });
    }

    /**
     * Rank all items in a category
     * @param {Array} items - Array of items to rank
     * @param {string} categoryId - Category ID
     * @param {Object} customWeights - Optional custom weights
     * @returns {Array} - Sorted array with scores
     */
    rankItems(items, categoryId, customWeights = null) {
        const scoredItems = items.map(item => {
            const scoreBreakdown = this.calculateScore(item, categoryId, customWeights);
            return {
                ...item,
                score: scoreBreakdown.overall,
                breakdown: scoreBreakdown
            };
        });

        // Sort by score descending
        return scoredItems.sort((a, b) => b.score - a.score);
    }

    /**
     * Get top N items
     */
    getTopN(items, categoryId, n = 10, customWeights = null) {
        const ranked = this.rankItems(items, categoryId, customWeights);
        return ranked.slice(0, n);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoringEngine;
}
