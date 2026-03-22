import { Link } from "react-router-dom"

function Hero() {
  return (
    <section className="bg-green-100 py-28 text-center">

      <h1 className="text-5xl font-bold mb-6">
        Smart Crop Yield Prediction
      </h1>

      <p className="text-lg text-gray-700 mb-8 max-w-xl mx-auto">
        Predict crop yield using machine learning, weather data and IoT sensors.
        Empower farmers with data-driven decisions.
      </p>

      <div className="space-x-4">
        <Link to="/prediction">
          <button type="button" className="bg-green-700 text-white px-6 py-3 rounded-lg">
            Try Prediction
          </button>
        </Link>

        <a href="#features">
          <button type="button" className="border px-6 py-3 rounded-lg">
            Learn More
          </button>
        </a>
      </div>

    </section>
  )
}

export default Hero