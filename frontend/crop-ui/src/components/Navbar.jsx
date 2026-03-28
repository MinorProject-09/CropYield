import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-[cardIn_0.3s_ease_both]">
        <div className="text-4xl mb-3">👋</div>
        <h3 className="text-xl font-bold text-green-900 mb-2">Logging out?</h3>
        <p className="text-gray-500 text-sm mb-6">You'll need to sign in again to access your dashboard and predictions.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Stay
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-green-700 text-white font-medium hover:bg-green-800 transition"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    setShowLogout(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      {showLogout && (
        <LogoutModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogout(false)}
        />
      )}

      <nav className="sticky top-0 z-40 flex justify-between items-center px-6 py-3 bg-green-800 text-white shadow-md">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-90">
          <span className="text-2xl">🌾</span>
          <span>CropYield AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="space-x-6 hidden md:flex text-sm font-medium">
          <Link to="/" className="hover:text-green-200 transition">Home</Link>
          {user && <Link to="/prediction" className="hover:text-green-200 transition">Prediction</Link>}
          {user && <Link to="/dashboard" className="hover:text-green-200 transition">Dashboard</Link>}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden md:block text-sm text-green-200 mr-1">
                Hi, {user.name?.split(" ")[0]}
              </span>
              <button
                type="button"
                onClick={() => setShowLogout(true)}
                className="px-4 py-2 text-sm bg-white text-green-800 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button type="button" className="px-4 py-2 text-sm border border-white/50 rounded-lg hover:bg-white/10 transition">
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button type="button" className="px-4 py-2 text-sm bg-white text-green-800 rounded-lg font-semibold hover:bg-green-50 transition">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
