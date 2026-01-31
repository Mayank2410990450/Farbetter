/**
 * Caching Middleware for Express
 * 
 * Features:
 * - In-memory cache for API responses
 * - Cache headers for static assets
 * - Configurable TTL per route
 * - Cache invalidation helpers
 */

// Simple in-memory cache store
const cache = new Map();

/**
 * Cache configuration for different route types
 */
const CACHE_CONFIG = {
    // Static assets - cache for 1 year (immutable)
    static: {
        maxAge: 31536000, // 1 year in seconds
        immutable: true
    },
    // Product listings - cache for 5 minutes
    products: {
        maxAge: 300, // 5 minutes
        staleWhileRevalidate: 60
    },
    // Single product - cache for 2 minutes
    product: {
        maxAge: 120, // 2 minutes
        staleWhileRevalidate: 30
    },
    // Categories - cache for 1 hour
    categories: {
        maxAge: 3600, // 1 hour
        staleWhileRevalidate: 300
    },
    // User-specific data - no cache
    user: {
        maxAge: 0,
        private: true
    },
    // Default - 1 minute cache
    default: {
        maxAge: 60,
        staleWhileRevalidate: 30
    }
};

/**
 * Generate cache key from request
 */
const getCacheKey = (req) => {
    return `${req.method}:${req.originalUrl}`;
};

/**
 * API Response Cache Middleware
 * Caches GET requests in memory
 */
const apiCache = (ttlSeconds = 60) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Skip cache for authenticated requests
        if (req.headers.authorization || req.cookies?.token) {
            return next();
        }

        const key = getCacheKey(req);
        const cached = cache.get(key);

        // Return cached response if valid
        if (cached && cached.expiry > Date.now()) {
            res.set('X-Cache', 'HIT');
            res.set('Cache-Control', `public, max-age=${Math.floor((cached.expiry - Date.now()) / 1000)}`);
            return res.json(cached.data);
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json to cache the response
        res.json = (data) => {
            // Only cache successful responses
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cache.set(key, {
                    data,
                    expiry: Date.now() + (ttlSeconds * 1000)
                });
            }
            res.set('X-Cache', 'MISS');
            res.set('Cache-Control', `public, max-age=${ttlSeconds}`);
            return originalJson(data);
        };

        next();
    };
};

/**
 * Set Cache-Control headers for browser caching
 */
const setCacheHeaders = (type = 'default') => {
    return (req, res, next) => {
        const config = CACHE_CONFIG[type] || CACHE_CONFIG.default;

        let cacheControl = '';

        if (config.private) {
            cacheControl = 'private, no-cache, no-store, must-revalidate';
        } else {
            cacheControl = `public, max-age=${config.maxAge}`;

            if (config.staleWhileRevalidate) {
                cacheControl += `, stale-while-revalidate=${config.staleWhileRevalidate}`;
            }

            if (config.immutable) {
                cacheControl += ', immutable';
            }
        }

        res.set('Cache-Control', cacheControl);
        next();
    };
};

/**
 * Static assets cache middleware
 * For images, CSS, JS files
 */
const staticCache = (maxAge = 86400) => {
    return (req, res, next) => {
        // Set aggressive caching for static files
        res.set('Cache-Control', `public, max-age=${maxAge}, immutable`);
        next();
    };
};

/**
 * Clear cache for specific patterns
 */
const clearCache = (pattern = null) => {
    if (pattern) {
        // Clear matching keys
        for (const key of cache.keys()) {
            if (key.includes(pattern)) {
                cache.delete(key);
            }
        }
    } else {
        // Clear all cache
        cache.clear();
    }
};

/**
 * Clear product cache (call after product updates)
 */
const clearProductCache = () => {
    clearCache('/api/products');
    clearCache('/api/product');
};

/**
 * Clear category cache (call after category updates)
 */
const clearCategoryCache = () => {
    clearCache('/api/categories');
    clearCache('/api/category');
};

/**
 * Cache stats for monitoring
 */
const getCacheStats = () => {
    let validEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    for (const [key, value] of cache.entries()) {
        if (value.expiry > now) {
            validEntries++;
        } else {
            expiredEntries++;
        }
    }

    return {
        totalEntries: cache.size,
        validEntries,
        expiredEntries,
        memoryUsage: process.memoryUsage().heapUsed
    };
};

/**
 * Cleanup expired cache entries periodically
 */
const startCacheCleanup = (intervalMs = 60000) => {
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of cache.entries()) {
            if (value.expiry <= now) {
                cache.delete(key);
            }
        }
    }, intervalMs);
};

// Start cleanup on module load
startCacheCleanup();

module.exports = {
    apiCache,
    setCacheHeaders,
    staticCache,
    clearCache,
    clearProductCache,
    clearCategoryCache,
    getCacheStats,
    CACHE_CONFIG
};
