const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getWeatherForecast } = require("../controllers/weatherController");

router.get("/", auth, getWeatherForecast);

module.exports = router;
