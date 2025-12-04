const ShippingSettings = require("../models/shippingSettings.modal");
const asyncHandler = require("../middlewares/asyncHandler");

// Get current shipping settings (public endpoint)
exports.getShippingSettings = asyncHandler(async (req, res) => {
  try {
    let settings = await ShippingSettings.findOne({}).lean();
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = {
        shippingCost: 0,
        freeShippingThreshold: null,
        description: "Standard shipping applied to all orders"
      };
    }

    res.status(200).json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error("Error in getShippingSettings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shipping settings"
    });
  }
});

// Update shipping settings (admin only)
exports.updateShippingSettings = asyncHandler(async (req, res) => {
  try {
    const { shippingCost, freeShippingThreshold, description } = req.body;

    // Validate inputs
    if (shippingCost !== undefined && (shippingCost < 0 || isNaN(shippingCost))) {
      return res.status(400).json({
        success: false,
        message: "Shipping cost must be a non-negative number"
      });
    }

    if (freeShippingThreshold !== undefined && freeShippingThreshold !== null && (freeShippingThreshold < 0 || isNaN(freeShippingThreshold))) {
      return res.status(400).json({
        success: false,
        message: "Free shipping threshold must be a non-negative number or null"
      });
    }

    // Find and update or create new settings
    let settings = await ShippingSettings.findOne({});
    
    if (!settings) {
      settings = new ShippingSettings();
    }

    settings.shippingCost = shippingCost !== undefined ? shippingCost : settings.shippingCost;
    settings.freeShippingThreshold = freeShippingThreshold !== undefined ? freeShippingThreshold : settings.freeShippingThreshold;
    settings.description = description !== undefined ? description : settings.description;
    settings.lastUpdatedBy = req.user?.id;

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Shipping settings updated successfully",
      settings: settings
    });
  } catch (error) {
    console.error("Error in updateShippingSettings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update shipping settings"
    });
  }
});
