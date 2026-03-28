const express = require("express")
const router = express.Router()
const { predictCropYield, getPredictionHistory, deletePrediction } = require("../controllers/predictionController")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/", predictCropYield)
router.get("/history", authMiddleware, getPredictionHistory)
router.delete("/:id", authMiddleware, deletePrediction)

module.exports = router
