import React from "react";
import { ConfigProvider } from 'antd';
import enUS from 'antd/es/locale/en_US';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
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
import Notifications from "./pages/Notifications";
import Announcements from "./pages/Announcements/Announcements";
import Analytics from "./pages/Analytics/Analytics";
import AccountsDeactivation from "./pages/AccountsDeactivation/AccountsDeactivation";

const App = () => (
  <ConfigProvider
    locale={enUS}
    theme={{
      token: {
        fontFamily: 'Archivo, sans-serif',
        // Primary colors
        colorPrimary: '#48A6A7',
        colorPrimaryHover: '#006A71',
        colorPrimaryActive: '#006A71',
        colorPrimaryBg: '#9ACBD0',
        colorPrimaryBgHover: '#48A6A7',

        // Background colors
        colorBgBase: '#F2EFE7',
        colorBgContainer: '#ffffff',
        colorBgElevated: '#ffffff',
        colorBgLayout: '#F2EFE7',

        // Border radius
        borderRadius: 8,
        borderRadiusLG: 12,

        // Other customizations
        boxShadow: '0 2px 8px rgba(0, 106, 113, 0.1)',
        boxShadowSecondary: '0 4px 12px rgba(0, 106, 113, 0.12)',
      },
      components: {
        Typography: {
          titleFontFamily: 'Clash Display, sans-serif',
          fontWeightStrong: 600,
          colorTextHeading: '#006A71',
        },
        Table: {
          headerFontSize: 14,
          headerFontWeight: 600,
          headerBg: '#9ACBD0',
          headerColor: '#006A71',
          fontWeightStrong: 600,
          colorBgContainer: '#ffffff',
        },
        Button: {
          colorPrimary: '#48A6A7',
          colorPrimaryHover: '#006A71',
          colorPrimaryActive: '#006A71',
          borderRadius: 6,
        },
        Card: {
          colorBgContainer: '#ffffff',
          borderRadiusLG: 12,
          boxShadow: '0 2px 8px rgba(0, 106, 113, 0.08)',
        },
        Layout: {
          colorBgHeader: '#006A71',
          colorBgBody: '#F2EFE7',
          colorBgTrigger: '#48A6A7',
        },
        Menu: {
          colorItemBg: 'transparent',
          colorItemText: '#F2EFE7',
          colorItemTextSelected: '#ffffff',
          colorItemBgSelected: '#006A71',
          colorItemBgHover: 'rgba(154, 203, 208, 0.3)',
        },
      },
    }}
  >
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Sidebar />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/companies" element={<Company />} />
            <Route path="/companies/:companyId/analytics" element={<CompanyAnalytics />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/assessments" element={<Assessments />} />
            <Route path="/therapists" element={<Therapists />} />
            <Route path="/workshops" element={<Workshops />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/soundscapes" element={<Soundscapes />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/accountsDeactivation" element={<AccountsDeactivation />} />
          </Route>
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  </ConfigProvider>
);

export default App;
