const benefits = [
  {
    icon: "📈",
    title: "Higher Crop Yield",
    desc: "Farmers using data-driven crop selection report up to 30% better yields compared to traditional guesswork.",
  },
  {
    icon: "💰",
    title: "Reduce Input Costs",
    desc: "Avoid spending on seeds and fertilizers for crops that won't thrive in your soil. Plant right the first time.",
  },
  {
    icon: "🌦️",
    title: "Climate-Resilient Choices",
    desc: "Our model accounts for your region's climate patterns, helping you pick crops suited to local rainfall and temperature.",
  },
  {
    icon: "⚡",
    title: "Instant Results",
    desc: "No waiting for agronomists or lab reports. Get a recommendation in seconds, right from your phone.",
  },
  {
    icon: "🗣️",
    title: "Works in Your Language",
    desc: "Voice input and UI support for Hindi, Tamil, Telugu, and English — because agriculture is local.",
  },
  {
    icon: "🔒",
    title: "Your Data is Safe",
    desc: "We never sell your farm data. Your location and soil information stays private and secure.",
  },
];

function Benefits() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-green-700 text-sm font-semibold uppercase tracking-widest">Why Farmers Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Real benefits, real results
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Designed with Indian farmers in mind — practical, fast, and free to use.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="flex gap-4 p-6 rounded-2xl bg-green-50 border border-green-100">
              <div className="text-3xl flex-shrink-0">{b.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Benefits;
