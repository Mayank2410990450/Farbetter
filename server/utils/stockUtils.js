/**
 * Backend Stock Management Utilities
 * Ensures inventory is managed safely and accurately
 */

/**
 * Safely decrement stock for a product
 * Used when an order is placed
 * @param {Model} Product - Mongoose Product model
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to decrement
 * @returns {Promise<object>} - Updated product or error
 */
const decrementStock = async (Product, productId, quantity) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock available');
    }

    product.stock -= quantity;
    await product.save();

    return {
      success: true,
      stock: product.stock,
      product,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Increment stock for a product (refund/cancellation)
 * @param {Model} Product - Mongoose Product model
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to increment
 * @returns {Promise<object>} - Updated product or error
 */
const incrementStock = async (Product, productId, quantity) => {
  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: quantity } },
      { new: true }
    );

    if (!product) {
      throw new Error('Product not found');
    }

    return {
      success: true,
      stock: product.stock,
      product,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Check if product is in stock
 * @param {Model} Product - Mongoose Product model
 * @param {string} productId - Product ID
 * @param {number} quantity - Required quantity
 * @returns {Promise<boolean>}
 */
const isProductInStock = async (Product, productId, quantity) => {
  try {
    const product = await Product.findById(productId);
    return product && product.stock >= quantity;
  } catch (error) {
    console.error('Error checking stock:', error);
    return false;
  }
};

/**
 * Get low stock products (admin alert)
 * @param {Model} Product - Mongoose Product model
 * @param {number} threshold - Low stock threshold
 * @returns {Promise<array>}
 */
const getLowStockProducts = async (Product, threshold = 10) => {
  try {
    return await Product.find({
      stock: { $lte: threshold, $gt: 0 },
    }).sort({ stock: 1 });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
};

/**
 * Get out of stock products
 * @param {Model} Product - Mongoose Product model
 * @returns {Promise<array>}
 */
const getOutOfStockProducts = async (Product) => {
  try {
    return await Product.find({ stock: 0 }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching out of stock products:', error);
    return [];
  }
};

/**
 * Validate order items before checkout
 * Ensures all items are in stock with required quantities
 * @param {Model} Product - Mongoose Product model
 * @param {array} items - Array of { productId, quantity }
 * @returns {Promise<object>} - { valid: boolean, errors: array }
 */
const validateOrderItems = async (Product, items) => {
  const errors = [];

  try {
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        errors.push(`Product ${item.productId} not found`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(
          `${product.title}: Only ${product.stock} available (requested ${item.quantity})`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    console.error('Error validating order items:', error);
    return {
      valid: false,
      errors: ['Error validating order items. Please try again.'],
    };
  }
};

module.exports = {
  decrementStock,
  incrementStock,
  isProductInStock,
  getLowStockProducts,
  getOutOfStockProducts,
  validateOrderItems,
};
