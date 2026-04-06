import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chatbot from "./components/Chatbot";
import LandingPage from "./pages/LandingPage"
import PredictionPage from "./pages/PredictionPage"
import ProfitPage from "./pages/ProfitPage"
import Login from "./pages/auth/Login"
import SignUp from "./pages/auth/SignUp"
import OAuthCallback from "./pages/auth/OAuthCallback"
import VerifyEmail from "./pages/auth/VerifyEmail"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from "./pages/auth/ResetPassword"
import CropCalendar from "./pages/CropCalendar"
import CropDetailPage from "./pages/CropDetailPage"
import IoTDashboard from "./pages/IoTDashboard"
import SchemeFinder from "./pages/SchemeFinder"
import WeatherPage from "./pages/WeatherPage"
import MarketPage from "./pages/MarketPage"
import CommunityPage from "./pages/CommunityPage"
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";


function AuthenticatedChatbot() {
  const { user, loading } = useAuth();
  if (loading || !user) return null;
  return <Chatbot />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/prediction" element={
            <ProtectedRoute>
              <PredictionPage />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <CropCalendar />
            </ProtectedRoute>
          } />
          <Route path="/profit" element={
            <ProtectedRoute>
              <ProfitPage />
            </ProtectedRoute>
          } />
          <Route path="/crop/:cropName" element={
            <ProtectedRoute>
              <CropDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/iot" element={
            <ProtectedRoute>
              <IoTDashboard />
            </ProtectedRoute>
          } />
          <Route path="/schemes" element={
            <ProtectedRoute>
              <SchemeFinder />
            </ProtectedRoute>
          } />
          <Route path="/weather" element={
            <ProtectedRoute>
              <WeatherPage />
            </ProtectedRoute>
          } />
          <Route path="/market" element={
            <ProtectedRoute>
              <MarketPage />
            </ProtectedRoute>
          } />
          <Route path="/community" element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          } />
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
        <AuthenticatedChatbot />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;