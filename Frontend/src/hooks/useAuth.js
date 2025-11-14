import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export const useAuth = () => {
  const { user, loading, error, dispatch } = useContext(AuthContext);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set auth token
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data
          const response = await api.get('/api/auth/me');
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: response.data
          });
          
          // Redirect to intended page or dashboard
          const from = location.state?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setIsInitialized(true);
      }
    };
    
    checkAuth();
  }, [dispatch, navigate, location]);

  // Login function
  const login = useCallback(async (email, password) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Update context
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data.user
      });
      
      // Redirect to dashboard or intended page
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message
      });
      return { success: false, message };
    }
  }, [dispatch, navigate, location]);

  // Register function
  const register = useCallback(async (userData) => {
    dispatch({ type: 'REGISTER_REQUEST' });
    
    try {
      const response = await api.post('/api/auth/register', userData);
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Update context
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: response.data.user
      });
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: message
      });
      return { success: false, message };
    }
  }, [dispatch, navigate]);

  // Logout function
  const logout = useCallback(() => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Update context
    dispatch({ type: 'LOGOUT' });
    
    // Redirect to login
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);

  // Update user profile
  const updateProfile = useCallback(async (userData) => {
    dispatch({ type: 'UPDATE_PROFILE_REQUEST' });
    
    try {
      const response = await api.put('/api/auth/me', userData);
      
      // Update context
      dispatch({
        type: 'UPDATE_PROFILE_SUCCESS',
        payload: response.data
      });
      
      return { success: true, user: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      dispatch({
        type: 'UPDATE_PROFILE_FAILURE',
        payload: message
      });
      return { success: false, message };
    }
  }, [dispatch]);

  // Check if user has required role
  const hasRole = useCallback((requiredRole) => {
    if (!user) return false;
    
    // If no role required, allow access
    if (!requiredRole) return true;
    
    // Check if user has the required role
    return user.roles?.includes(requiredRole);
  }, [user]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isInitialized,
    login,
    register,
    logout,
    updateProfile,
    hasRole
  };
};

export default useAuth;
