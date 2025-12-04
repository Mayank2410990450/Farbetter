const express = require("express");
const {
  getOffers,
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  seedOffers,
} = require("../controller/offer.controller");

const protect = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/roles.middleware");

const router = express.Router();

// Public routes
router.get("/", getOffers);

// Admin routes
router.get("/admin/all", protect, allowRoles('admin'), getAllOffers);
router.get("/:id", protect, allowRoles('admin'), getOfferById);
router.post("/", protect, allowRoles('admin'), createOffer);
router.put("/:id", protect, allowRoles('admin'), updateOffer);
router.delete("/:id", protect, allowRoles('admin'), deleteOffer);
router.post("/seed", seedOffers);

module.exports = router;
