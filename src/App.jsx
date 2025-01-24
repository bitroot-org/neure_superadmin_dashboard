import React from "react";
import { ConfigProvider } from 'antd';
import enUS from 'antd/es/locale/en_US';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import ManageCompanies from "./pages/Companies/ManageCompanies";
import ROIMetrics from "./pages/Companies/ROIMetrics";
import ManageEmployees from "./pages/Employees/ManageEmployees";
import Assessments from "./pages/Employees/Assessments";
import Therapists from "./pages/Therapists";
import WorkshopFolders from "./pages/Workshops/WorkshopFolders";
import Schedules from "./pages/Workshops/Schedules";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
// import "./index.css";

const App = () => (
  <ConfigProvider locale={enUS}>
  <Router>
    <Routes>
      <Route element={<Sidebar />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/companies/manage" element={<ManageCompanies />} />
        <Route path="/companies/roi-metrics" element={<ROIMetrics />} />
        <Route path="/employees/manage" element={<ManageEmployees />} />
        <Route path="/employees/assessments" element={<Assessments />} />
        <Route path="/therapists" element={<Therapists />} />
        <Route path="/workshops/folders" element={<WorkshopFolders />} />
        <Route path="/workshops/schedules" element={<Schedules />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/analytics" element={<Analytics />} />
      </Route>
    </Routes>
  </Router>
  </ConfigProvider>
);

export default App;
