import { BrowserRouter, Routes, Route } from "react-router-dom"

import LandingPage from "./pages/LandingPage"
import PredictionPage from "./pages/PredictionPage"
import Login from "./pages/auth/Login"
import SignUp from "./pages/auth/SignUp"
import OAuthCallback from "./pages/auth/OAuthCallback"

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/prediction" element={<PredictionPage />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<SignUp />} />

        <Route path="/auth/callback" element={<OAuthCallback />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App