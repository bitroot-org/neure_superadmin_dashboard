import React, { useEffect, useState } from "react";
import { ConfigProvider, message } from "antd";
import enUS from "antd/es/locale/en_US";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import LoginPage from "./pages/Login";
import Header from "./components/Header";
import Home from "./pages/Home/Home";
import Company from "./pages/Company/Company";
import CompanyAnalytics from "./pages/Company/CompanyAnalytics";
import Employees from "./pages/Employees/Employees";
import Assessments from "./pages/Assessments/Assessments";
import Therapists from "./pages/Therapists/Therapists";
import Soundscapes from "./pages/Soundscapes/Soundscapes";
import Resources from "./pages/Resources/Resources";
import Workshops from "./pages/Workshops/Workshops";
import Announcements from "./pages/Announcements/Announcements";
import Analytics from "./pages/Analytics/Analytics";
import AccountsDeactivation from "./pages/AccountsDeactivation/AccountsDeactivation";
import Feedback from "./pages/Feedback/Feedback";
import Rewards from "./pages/Rewards/Rewards";
import FAQ from "./pages/FAQ/FAQ";
import ActivityHistory from "./pages/ActivityHistory/ActivityHistory";
import AssessmentReports from "./pages/Assessments/AssessmentReports";
import Superadmins from "./pages/Superadmins/Superadmins";
import PasswordChange from './components/PasswordChange/PasswordChange';
import { changePassword } from './services/api';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { getThemeConfig } from './utils/themeConfig';

// Authentication check function
const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  return !!(token && refreshToken);
};

// Create a separate component for auth checking
const AuthChecker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    // Small delay to ensure localStorage is properly read
    const timer = setTimeout(() => {
      console.log("Auth check - path:", location.pathname);
      console.log("Auth state:", isAuthenticated());
      console.log("Token exists:", !!localStorage.getItem("accessToken"));
      console.log("Refresh token exists:", !!localStorage.getItem("refreshToken"));
      
      if (location.pathname !== '/login' && !isAuthenticated()) {
        navigate('/login', { replace: true });
      } else if (location.pathname === '/login' && isAuthenticated()) {
        navigate('/home', { replace: true });
      }
      
      setIsCheckingAuth(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname, navigate]);
  
  // Don't render children until auth check is complete
  return null;
};

// Create a themed App component that uses the theme context
const ThemedApp = () => {
  const { theme } = useTheme();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);

  useEffect(() => {
    // Check if user is logged in and if it's their first login
    const isFirstLogin = localStorage.getItem("isFirstLogin") === "true";
    console.log("isFirstLogin from localStorage:", isFirstLogin);
    
    // Get user data to verify if it's actually the first login
    const userData = localStorage.getItem("userData");
    let user = null;
    
    if (userData) {
      try {
        user = JSON.parse(userData);
        console.log("User data from localStorage:", user);
        console.log("last_login value:", user.last_login);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    
    // Show password change modal if it's the first login (last_login is null)
    if (isAuthenticated() && isFirstLogin && user && user.last_login === null) {
      console.log("Showing password change modal");
      setIsFirstTimeLogin(true);
      setShowPasswordChange(true);
    } else {
      console.log("Not showing password change modal. Conditions:", {
        isAuthenticated: isAuthenticated(),
        isFirstLogin,
        hasUser: !!user,
        lastLoginIsNull: user ? user.last_login === null : false
      });
    }
  }, []);

  const handlePasswordChange = async ({ currentPassword, newPassword }) => {
    try {

      const UserData = localStorage.getItem("userData");
      const parsedUserData = JSON.parse(UserData);
      console.log("Parsed user data:", parsedUserData);
      const email = parsedUserData.email;

      const data = {
        email,
        old_password: currentPassword,
        new_password: newPassword
      };

      // Call the API with the correct parameters
      const response = await changePassword(data);
      
      if (response && response.status) {
        // If successful, update localStorage
        localStorage.setItem("isFirstLogin", "false");
        
        // Update user data in localStorage to reflect that they've logged in
        const userData = localStorage.getItem("userData");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            user.last_login = new Date().toISOString();
            localStorage.setItem("userData", JSON.stringify(user));
          } catch (e) {
            console.error("Error updating user data:", e);
          }
        }
        
        setShowPasswordChange(false);
        setIsFirstTimeLogin(false);
        
        // Show success message
        message.success("Password changed successfully");
      } else {
        message.error(response?.message || "Failed to change password");
        throw new Error(response?.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      message.error(error.message || "Failed to change password");
      throw error;
    }
  };

  return (
    <ConfigProvider
      locale={enUS}
      theme={getThemeConfig(theme)}
    >
      <Router>
        <AuthChecker />
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated() ? <Navigate to="/home" replace /> : <LoginPage />
            }
          />

          {/* Protected Routes */}
          <Route 
            element={
              isAuthenticated() ? <Sidebar /> : <Navigate to="/login" replace />
            }
          >
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/companies" element={<Company />} />
            <Route
              path="/companies/:companyId/analytics"
              element={<CompanyAnalytics />}
            />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/assessments" element={<Assessments />} />
            <Route
              path="/employees/assessment-reports"
              element={<AssessmentReports />}
            />
            <Route path="/therapists" element={<Therapists />} />
            <Route path="/workshops" element={<Workshops />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/soundscapes" element={<Soundscapes />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route
              path="/accountsDeactivation"
              element={<AccountsDeactivation />}
            />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/activitylog" element={<ActivityHistory />} />
            <Route path="/superadmins" element={<Superadmins />} />

            <Route
              path="*"
              element={
                isAuthenticated() ? (
                  // Only redirect to home if not on a valid route
                  <Navigate to="/home" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Route>
        </Routes>
        <PasswordChange
          visible={showPasswordChange}
          onClose={() => {
            if (!isFirstTimeLogin) {
              setShowPasswordChange(false);
            }
          }}
          onSubmit={handlePasswordChange}
          isFirstLogin={isFirstTimeLogin}
          onSkip={() => {
            localStorage.setItem("isFirstLogin", "false");
            setShowPasswordChange(false);
            setIsFirstTimeLogin(false);
          }}
        />
      </Router>
    </ConfigProvider>
  );
};

// Main App component wrapped with ThemeProvider
const App = () => {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
};

export default App;
