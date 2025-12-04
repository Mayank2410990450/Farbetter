// routes/address.routes.js
const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const { addAddress, getAddresses, setDefaultAddress, deleteAddress } = require("../controller/address.controller");

router.post("/", protect, addAddress);
router.get("/", protect, getAddresses);
router.put("/default/:id", protect, setDefaultAddress);
router.delete("/:id", protect, deleteAddress);

module.exports = router;
