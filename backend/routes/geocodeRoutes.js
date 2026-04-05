const express = require("express")
const router = express.Router()
const { geocodeSearch, geocodeStatus } = require("../controllers/geocodeController")

router.get("/status", geocodeStatus)
router.get("/", geocodeSearch)

module.exports = router
