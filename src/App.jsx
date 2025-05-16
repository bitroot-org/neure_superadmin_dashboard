import React, { useEffect, useState } from "react";
import { ConfigProvider } from "antd";
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

const App = () => {
  return (
    <ConfigProvider
      locale={enUS}
      theme={{
        token: {
          fontFamily: "Archivo, sans-serif",
          // Primary colors
          colorPrimary: "#48A6A7",
          colorPrimaryHover: "#006A71",
          colorPrimaryActive: "#006A71",
          colorPrimaryBg: "#9ACBD0",
          colorPrimaryBgHover: "#48A6A7",

          // Background colors
          colorBgBase: "#F2EFE7",
          colorBgContainer: "#ffffff",
          colorBgElevated: "#ffffff",
          colorBgLayout: "#F2EFE7",

          // Border radius
          borderRadius: 8,
          borderRadiusLG: 12,

          // Other customizations
          boxShadow: "0 2px 8px rgba(0, 106, 113, 0.1)",
          boxShadowSecondary: "0 4px 12px rgba(0, 106, 113, 0.12)",
        },
        components: {
          Typography: {
            titleFontFamily: "Clash Display, sans-serif",
            fontWeightStrong: 600,
            colorTextHeading: "#006A71",
          },
          Table: {
            headerFontSize: 14,
            headerFontWeight: 600,
            headerBg: "#9ACBD0",
            headerColor: "#006A71",
            fontWeightStrong: 600,
            colorBgContainer: "#ffffff",
          },
          Button: {
            colorPrimary: "#48A6A7",
            colorPrimaryHover: "#006A71",
            colorPrimaryActive: "#006A71",
            borderRadius: 6,
          },
          Card: {
            colorBgContainer: "#ffffff",
            borderRadiusLG: 12,
            boxShadow: "0 2px 8px rgba(0, 106, 113, 0.08)",
          },
        },
      }}
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
      </Router>
    </ConfigProvider>
  );
};

export default App;
