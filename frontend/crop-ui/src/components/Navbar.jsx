import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-green-700 text-white">
      <Link to="/" className="text-2xl font-bold hover:opacity-90">
        CropYield AI
      </Link>

      <div className="space-x-6 hidden md:flex">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <a href="/#features" className="hover:underline">
          Features
        </a>
        <a href="/#how" className="hover:underline">
          How it Works
        </a>
      </div>

      <div className="space-x-3 flex items-center">
        {user ? (
          <>
            <Link to="/dashboard">
              <button
                type="button"
                className="px-4 py-2 border border-white rounded hover:bg-white/10"
              >
                Dashboard
              </button>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-green-700 rounded hover:bg-green-50"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button
                type="button"
                className="px-4 py-2 border border-white rounded hover:bg-white/10"
              >
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button
                type="button"
                className="px-4 py-2 bg-white text-green-700 rounded hover:bg-green-50"
              >
                Sign Up
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;