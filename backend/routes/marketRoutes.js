const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getPrices, getBestTime } = require("../controllers/marketController");

router.get("/prices",    auth, getPrices);
router.get("/best-time", auth, getBestTime);

module.exports = router;
