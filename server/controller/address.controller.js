// controllers/address.controller.js
const Address = require("../models/address.modal");
const asyncHandler = require("../middlewares/asyncHandler");

// Add new address
exports.addAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const address = await Address.create({ ...req.body, user: userId });

  const addressCount = await Address.countDocuments({ user: userId });
  if (addressCount === 1) {
    address.isDefault = true;
    await address.save();
  }

  res.status(201).json({ success: true, address });
});

// Get user addresses
exports.getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user.id }).sort({
    isDefault: -1,
    createdAt: -1
  });

  res.json({ success: true, addresses });
});

// Set default address
exports.setDefaultAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  await Address.updateMany({ user: userId }, { isDefault: false });
  await Address.findByIdAndUpdate(id, { isDefault: true });

  res.json({ success: true, message: "Default address updated" });
});

// Delete address
exports.deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const address = await Address.findOneAndDelete({ _id: id, user: req.user.id });

  if (!address)
    return res.status(404).json({ success: false, message: "Address not found" });

  // Assign new default if needed
  if (address.isDefault) {
    const remaining = await Address.find({ user: req.user.id });
    if (remaining.length > 0) {
      remaining[0].isDefault = true;
      await remaining[0].save();
    }
  }

  res.json({ success: true, message: "Address deleted" });
});
