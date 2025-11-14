import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import PrivateRoute from "./components/common/PrivateRoute";
import Navbar from "./components/Layout/Navbar";
import Sidebar from "./components/Layout/Sidebar";
import { AuthProvider } from "./context/AuthContext";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        404
                      </h1>
                      <p className="text-xl text-gray-600">Page not found</p>
                      <button
                        onClick={() => window.history.back()}
                        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

export default App;
