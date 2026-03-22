function Features() {
  return (
    <section id="features" className="py-20 px-10 text-center">


      <h2 className="text-3xl font-bold mb-12">
        Platform Features
      </h2>

      <div className="grid md:grid-cols-3 gap-8">

        <div className="p-6 shadow rounded-lg">
          <h3 className="text-xl font-semibold mb-3">
            AI Yield Prediction
          </h3>
          <p>
            Machine learning models analyze climate and soil data to estimate crop yield.
          </p>
        </div>

        <div className="p-6 shadow rounded-lg">
          <h3 className="text-xl font-semibold mb-3">
            IoT Sensor Integration
          </h3>
          <p>
            Real-time monitoring of soil moisture, temperature and humidity.
          </p>
        </div>

        <div className="p-6 shadow rounded-lg">
          <h3 className="text-xl font-semibold mb-3">
            Visual Analytics
          </h3>
          <p>
            Graphs and charts help farmers understand trends and make decisions.
          </p>
        </div>

      </div>

    </section>
  )
}

export default Features