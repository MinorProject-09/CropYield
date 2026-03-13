const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv").config()

const app = express()

app.use(cors())
app.use(express.json())

// Test route
app.get("/", (req, res) => {
  res.send("Crop Yield Prediction API Running")
})

// Routes
const predictionRoutes = require("./routes/predictionRoutes")
app.use("/api/predict", predictionRoutes)

const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected")
  app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  )
})
.catch(err => console.log(err))