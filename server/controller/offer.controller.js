const Offer = require("../models/offer.modal");
const asyncHandler = require("../middlewares/asyncHandler");

// Get all active offers
const getOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find({ active: true }).sort({ order: 1 });
  res.json(offers);
});

// Get all offers (admin)
const getAllOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find().sort({ order: 1 });
  res.json(offers);
});

// Get single offer
const getOfferById = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    return res.status(404).json({ message: "Offer not found" });
  }
  res.json(offer);
});

// Create offer
const createOffer = asyncHandler(async (req, res) => {
  const { title, description, badge, backgroundColor, icon, order } = req.body;

  const offer = new Offer({
    title,
    description,
    badge,
    backgroundColor,
    icon,
    order,
  });

  const createdOffer = await offer.save();
  res.status(201).json(createdOffer);
});

// Update offer
const updateOffer = asyncHandler(async (req, res) => {
  const { title, description, badge, backgroundColor, icon, active, order } =
    req.body;

  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    return res.status(404).json({ message: "Offer not found" });
  }

  offer.title = title || offer.title;
  offer.description = description || offer.description;
  offer.badge = badge || offer.badge;
  offer.backgroundColor = backgroundColor || offer.backgroundColor;
  offer.icon = icon !== undefined ? icon : offer.icon;
  offer.active = active !== undefined ? active : offer.active;
  offer.order = order !== undefined ? order : offer.order;

  const updatedOffer = await offer.save();
  res.json(updatedOffer);
});

// Delete offer
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    return res.status(404).json({ message: "Offer not found" });
  }

  await Offer.findByIdAndDelete(req.params.id);
  res.json({ message: "Offer deleted successfully" });
});

// Seed default offers
const seedOffers = asyncHandler(async (req, res) => {
  const existingOffers = await Offer.countDocuments();
  if (existingOffers > 0) {
    return res.json({ message: "Offers already exist" });
  }

  const defaultOffers = [
    {
      title: "Free Shipping",
      description: "On Orders Above ₹599",
      badge: "FREE SHIPPING",
      backgroundColor: "bg-gradient-to-r from-blue-500 to-blue-600",
      icon: true,
      order: 1,
    },
  ];

  await Offer.insertMany(defaultOffers);
  res.json({ message: "Offers seeded successfully" });
});

module.exports = {
  getOffers,
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  seedOffers,
};
