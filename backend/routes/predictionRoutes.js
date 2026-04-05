const express = require("express")
const router = express.Router()
const { predictCropYield, getPredictionHistory, deletePrediction, getProfitRank, updateHarvest } = require("../controllers/predictionController")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/", predictCropYield)
router.post("/profit-rank", authMiddleware, getProfitRank)
router.get("/history", authMiddleware, getPredictionHistory)
router.put("/:id/harvest", authMiddleware, updateHarvest)
router.delete("/:id", authMiddleware, deletePrediction)

module.exports = router
