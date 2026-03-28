import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌾</span>
              <span className="text-white font-bold text-lg">CropYield AI</span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered crop recommendation for Indian farmers. Built with soil science, machine learning, and a deep respect for agriculture.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/signup" className="hover:text-white transition">Get Started</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Crops Supported</h4>
            <p className="text-sm leading-relaxed">
              Rice, Wheat, Maize, Chickpea, Kidney Beans, Pigeon Peas, Moth Beans, Mung Bean, Black Gram, Lentil, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut, Cotton, Jute, Coffee.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          <p>© 2026 CropYield AI Platform. All rights reserved.</p>
          <p>Helping Indian farmers make smarter agricultural decisions.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
