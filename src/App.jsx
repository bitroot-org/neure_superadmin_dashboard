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
import Company from "./pages/company/Company";
import Employees from "./pages/Employees/Employees";
import Assessments from "./pages/Assessments/Assessments";
import Therapists from "./pages/Therapists/Therapists";
import Soundscapes from "./pages/Soundscapes/Soundscapes";
import Resources from "./pages/Resources/Resources";
import Workshops from "./pages/Workshops/Workshops";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics/Analytics";
import "./index.css";

const App = () => (
  <ConfigProvider locale={enUS}>
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
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/assessments" element={<Assessments />} />
            <Route path="/therapists" element={<Therapists />} />
            <Route path="/workshops" element={<Workshops />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/soundscapes" element={<Soundscapes />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/assessments" element={<Assessments />} />
          </Route>
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  </ConfigProvider>
);

export default App;
