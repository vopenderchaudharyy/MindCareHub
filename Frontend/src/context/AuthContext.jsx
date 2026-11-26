import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile } from '../services';

const AuthContext = createContext();

const getAuthErrorMessage = (error, action) => {
  if (error.message === 'API_NOT_CONFIGURED') {
    return 'The API service is not configured for this deployment.';
  }

  if (error.message === 'INVALID_AUTH_RESPONSE') {
    return 'The API returned an invalid response. Please check the deployment configuration.';
  }

  return error.response?.data?.message
    || error.response?.data?.errors?.[0]?.msg
    || (error.response?.status === 404
      ? 'The API endpoint could not be found.'
      : !error.response
        ? 'Could not reach the API. Please try again later.'
        : `${action} failed. Please try again.`);
};

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
      if (!data?._id || !data?.token) {
        throw new Error('INVALID_AUTH_RESPONSE');
      }

      // data = { _id, name, email, token }
      localStorage.setItem('token', data.token);
      setCurrentUser({ _id: data._id, name: data.name, email: data.email });
      return { success: true };
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Login');
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const { data } = await registerUser(userData);
      if (!data?._id || !data?.token) {
        throw new Error('INVALID_AUTH_RESPONSE');
      }

      // data = { _id, name, email, token }
      localStorage.setItem('token', data.token);
      setCurrentUser({ _id: data._id, name: data.name, email: data.email });
      return { success: true };
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Registration');
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
