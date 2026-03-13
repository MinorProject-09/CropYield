function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-green-700 text-white">
      
      <h1 className="text-2xl font-bold">
        CropYield AI
      </h1>

      <div className="space-x-6 hidden md:flex">
        <a href="#">Home</a>
        <a href="#">Features</a>
        <a href="#">How it Works</a>
        <a href="#">Contact</a>
      </div>

      <div className="space-x-3">
        <button className="px-4 py-2 border rounded">
          Login
        </button>

        <button className="px-4 py-2 bg-white text-green-700 rounded">
          Sign Up
        </button>
      </div>

    </nav>
  )
}

export default Navbar