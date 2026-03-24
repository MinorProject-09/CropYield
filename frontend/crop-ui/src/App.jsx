import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage"
import PredictionPage from "./pages/PredictionPage"
import Login from "./pages/auth/Login"
import SignUp from "./pages/auth/SignUp"
import OAuthCallback from "./pages/auth/OAuthCallback"
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<SignUp />} />

        <Route path="/prediction" element={<PredictionPage />} />


        <Route path="/auth/callback" element={<OAuthCallback />} />

     


          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;