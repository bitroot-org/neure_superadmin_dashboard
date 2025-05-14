import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  
  useEffect(() => {
    // More comprehensive token validation
    const validateToken = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const expiresAt = localStorage.getItem('expiresAt');
        
        // If we have both tokens, consider the user authenticated
        if (token && refreshToken) {
          console.log('Token found, user is authenticated');
          setIsAuthenticated(true);
          return;
        }
        
        console.log('No valid tokens found');
        setIsAuthenticated(false);
      } catch (error) {
        console.error('Error validating token:', error);
        setIsAuthenticated(false);
      }
    };
    
    validateToken();
  }, [location.pathname]); // Re-validate when path changes

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Optional: show a loading indicator
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
