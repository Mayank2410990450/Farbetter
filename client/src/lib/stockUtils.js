/**
 * Stock Management Utilities
 * Handles inventory management for production e-commerce
 */

/**
 * Check if product is in stock
 * @param {number} stock - Current stock level
 * @param {number} quantity - Quantity requested
 * @returns {boolean}
 */
export const isInStock = (stock, quantity) => {
  return stock >= quantity;
};

/**
 * Get stock status with badge color
 * @param {number} stock - Current stock level
 * @returns {object} - { status: string, color: string, badge: string }
 */
export const getStockStatus = (stock) => {
  if (stock === 0) {
    return {
      status: 'Out of Stock',
      color: 'bg-red-100 text-red-800',
      badge: 'Out of Stock',
      isAvailable: false,
    };
  }

  if (stock <= 5) {
    return {
      status: 'Low Stock',
      color: 'bg-yellow-100 text-yellow-800',
      badge: `${stock} Left`,
      isAvailable: true,
    };
  }

  if (stock <= 20) {
    return {
      status: 'Limited Stock',
      color: 'bg-blue-100 text-blue-800',
      badge: 'In Stock',
      isAvailable: true,
    };
  }

  return {
    status: 'In Stock',
    color: 'bg-green-100 text-green-800',
    badge: 'In Stock',
    isAvailable: true,
  };
};

/**
 * Format stock message for UI display
 * @param {number} stock - Current stock level
 * @returns {string}
 */
export const getStockMessage = (stock) => {
  if (stock === 0) {
    return 'This product is currently out of stock. Join the waitlist to be notified when it\'s back in stock.';
  }

  if (stock === 1) {
    return 'Only 1 item left in stock - Order now!';
  }

  if (stock <= 5) {
    return `Only ${stock} items left in stock - Hurry!`;
  }

  if (stock <= 20) {
    return `${stock} items in stock`;
  }

  return 'In stock';
};

/**
 * Calculate maximum quantity a user can purchase
 * @param {number} stock - Current stock level
 * @param {number} userLimit - Optional limit per user (default: 10)
 * @returns {number}
 */
export const getMaxPurchaseQuantity = (stock, userLimit = 10) => {
  return Math.min(stock, userLimit);
};

/**
 * Check if stock is running low (for admin alerts)
 * @param {number} stock - Current stock level
 * @param {number} threshold - Low stock threshold (default: 10)
 * @returns {boolean}
 */
export const isLowStock = (stock, threshold = 10) => {
  return stock < threshold && stock > 0;
};

/**
 * Check if product needs urgent restock
 * @param {number} stock - Current stock level
 * @param {number} criticalThreshold - Critical threshold (default: 2)
 * @returns {boolean}
 */
export const isCriticalStock = (stock, criticalThreshold = 2) => {
  return stock <= criticalThreshold && stock > 0;
};
