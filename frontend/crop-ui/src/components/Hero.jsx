import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const stats = [
  { value: "94%", label: "Prediction Accuracy" },
  { value: "12+", label: "Crop Types Supported" },
  { value: "28", label: "Indian States Covered" },
  { value: "10K+", label: "Farmers Empowered" },
];

function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          <span className="inline-block bg-green-600/60 border border-green-400/40 text-green-100 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            🌱 AI-Powered Agriculture
          </span>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Predict Your Crop Yield
            <span className="block text-green-300 mt-1">Before You Sow</span>
          </h1>

          <p className="text-lg md:text-xl text-green-100 mb-4 leading-relaxed max-w-2xl">
            CropYield AI combines machine learning, real-time soil data, and location intelligence to give Indian farmers accurate crop recommendations — in seconds.
          </p>

          <p className="text-sm text-green-300 mb-10">
            Enter your soil nutrients, location, and planting month. Our model does the rest.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to={user ? "/prediction" : "/signup"}>
              <button type="button" className="bg-white text-green-900 px-7 py-3.5 rounded-xl font-bold text-base hover:bg-green-50 transition shadow-lg">
                {user ? "Go to Prediction →" : "Get Started Free →"}
              </button>
            </Link>
            <a href="#how">
              <button type="button" className="border border-white/40 text-white px-7 py-3.5 rounded-xl font-medium text-base hover:bg-white/10 transition">
                See How It Works
              </button>
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center">
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-green-200 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
