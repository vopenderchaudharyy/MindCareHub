import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile } from '../services';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on initial load
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const { data } = await getProfile();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error('Session check failed:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const { data } = await loginUser({ email, password });
      // data = { _id, name, email, token }
      localStorage.setItem('token', data.token);
      setCurrentUser({ _id: data._id, name: data.name, email: data.email });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const { data } = await registerUser(userData);
      // data = { _id, name, email, token }
      localStorage.setItem('token', data.token);
      setCurrentUser({ _id: data._id, name: data.name, email: data.email });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
