import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-green-700 text-white">

      <h1 className="text-2xl font-bold">
        CropYield AI
      </h1>

      <div className="space-x-6 hidden md:flex">
        <Link to="/">Home</Link>
        <Link to="/prediction">Prediction</Link>
        <a href="#features">Features</a>
        <a href="#how">How it Works</a>
      </div>

      <div className="space-x-3">

        <Link to="/login">
          <button className="px-4 py-2 border rounded">
            Login
          </button>
        </Link>

        <Link to="/signup">
          <button className="px-4 py-2 bg-white text-green-700 rounded">
            Sign Up
          </button>
        </Link>

      </div>

    </nav>
  )
}

export default Navbar