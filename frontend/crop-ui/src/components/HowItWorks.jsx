function HowItWorks() {
  return (
    <section id="how" className="bg-gray-100 py-20 px-10 text-center">


      <h2 className="text-3xl font-bold mb-12">
        How It Works
      </h2>

      <div className="grid md:grid-cols-3 gap-10">

        <div>
          <h3 className="text-xl font-semibold mb-2">
            1. Collect Data
          </h3>
          <p>
            IoT sensors and weather APIs collect real-time environmental data.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">
            2. AI Analysis
          </h3>
          <p>
            Machine learning models process the data to predict crop yield.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">
            3. Smart Insights
          </h3>
          <p>
            Farmers receive predictions, charts and crop recommendations.
          </p>
        </div>

      </div>

    </section>
  )
}

export default HowItWorks