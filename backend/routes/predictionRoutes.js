const express = require("express")
const router = express.Router()

const { predictCropYield } = require("../controllers/predictionController")

router.post("/", predictCropYield)

module.exports = router