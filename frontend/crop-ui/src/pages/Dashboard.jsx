import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] bg-green-50 py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-green-900 mb-4">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-gray-700 mb-8">
            You&apos;re signed in. Your account is ready — explore the app from
            here or return home anytime.
          </p>
          <Link
            to="/"
            className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
    </>
  );
}

export default Dashboard;
