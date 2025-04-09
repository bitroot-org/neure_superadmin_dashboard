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

const App = () => (
  <ConfigProvider
    locale={enUS}
    theme={{
      token: {
        fontFamily: 'Archivo, sans-serif',
        // Primary colors
        colorPrimary: '#2A5D63',
        colorPrimaryHover: '#1A3A3D',
        colorPrimaryActive: '#1A3A3D',
        colorPrimaryBg: '#7BA9AD',
        colorPrimaryBgHover: '#2A5D63',

        // Background colors
        colorBgBase: '#F5F2ED',
        colorBgContainer: '#ffffff',
        colorBgElevated: '#ffffff',
        colorBgLayout: '#F5F2ED',

        // Border radius
        borderRadius: 8,
        borderRadiusLG: 12,

        // Other customizations
        boxShadow: 'var(--shadow-sm)',
        boxShadowSecondary: 'var(--shadow-md)',
        colorBorder: 'rgba(212, 183, 143, 0.2)',
        colorBorderSecondary: 'rgba(212, 183, 143, 0.1)',
        colorTextBase: '#1E2023',
        colorTextSecondary: '#6E7175',
        colorTextTertiary: 'rgba(110, 113, 117, 0.7)',
        colorSuccess: '#4D8B6C',
        colorWarning: '#D9A86C',
        colorError: '#B55A5A',
        colorInfo: '#2A5D63',
      },
      components: {
        Typography: {
          titleFontFamily: 'Playfair Display, serif',
          fontWeightStrong: 600,
          colorTextHeading: '#1A3A3D',
        },
        Table: {
          headerFontSize: 14,
          headerFontWeight: 600,
          headerBg: 'var(--background-alt)',
          headerColor: '#1A3A3D',
          fontWeightStrong: 600,
          colorBgContainer: '#ffffff',
          borderRadius: 8,
          boxShadow: 'var(--shadow-sm)',
        },
        Button: {
          colorPrimary: '#2A5D63',
          colorPrimaryHover: '#1A3A3D',
          colorPrimaryActive: '#1A3A3D',
          borderRadius: 4,
          controlHeight: 38,
          controlHeightLG: 46,
          controlHeightSM: 30,
          paddingContentHorizontal: 20,
        },
        Card: {
          colorBgContainer: '#ffffff',
          borderRadiusLG: 8,
          boxShadow: 'var(--shadow-sm)',
          colorBorderBg: 'rgba(212, 183, 143, 0.2)',
          headerBg: '#ffffff',
          headerFontSize: 16,
          headerFontWeight: 600,
          headerHeight: 56,
          paddingLG: 24,
        },
        Layout: {
          colorBgHeader: '#1A3A3D',
          colorBgBody: '#F5F2ED',
          colorBgTrigger: '#2A5D63',
          siderWidth: 260,
        },
        Menu: {
          colorItemBg: 'transparent',
          colorItemText: '#F5F2ED',
          colorItemTextSelected: '#ffffff',
          colorItemBgSelected: '#1A3A3D',
          colorItemBgHover: 'rgba(123, 169, 173, 0.3)',
          itemHeight: 48,
          itemMarginInline: 12,
          iconSize: 18,
          iconMarginInlineEnd: 16,
          collapsedIconSize: 20,
        },
        Statistic: {
          contentFontFamily: 'Cormorant, serif',
          contentFontSize: 28,
          contentFontWeight: 600,
          titleFontSize: 14,
        },
        Tabs: {
          inkBarColor: 'var(--gold)',
          cardGutter: 8,
          horizontalItemGutter: 32,
          horizontalItemPadding: '12px 0',
          titleFontSize: 16,
        },
        Modal: {
          headerBg: '#ffffff',
          titleFontSize: 18,
          titleColor: '#1A3A3D',
          contentBg: '#ffffff',
          footerBg: '#ffffff',
          borderRadiusLG: 8,
        },
        Drawer: {
          headerBg: '#ffffff',
          titleFontSize: 18,
          titleColor: '#1A3A3D',
          contentBg: '#ffffff',
          footerBg: '#ffffff',
          borderRadiusLG: 8,
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
          </Route>
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  </ConfigProvider>
);

export default App;
