import React from "react";
import { ProLayout } from "@ant-design/pro-layout";
import { Link, Outlet } from "react-router-dom";
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  NotificationOutlined,
  BarChartOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  ProfileOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import neurelogo from "../../assets/darkneurelogo.png";
import Header from "../Header";
import path from "path";
const Sidebar = () => {
  const menuData = [
    {
      path: "/home",
      name: "Home",
      icon: <HomeOutlined />,
    },
    {
      path: "/companies",
      name: "Companies",
      icon: <TeamOutlined />,
    },
    {
      path: "/employees",
      name: "Employees",
      icon: <UserOutlined />,
    },
    {
      path: "/workshops",
      name: "Workshops",
      icon: <FileTextOutlined />,
    },
    {
      path: "/therapists",
      name: "Therapists",
      icon: <SolutionOutlined />,
    },
    {
      path: "/assessments",
      name: "Assessments",
      icon: <FolderOpenOutlined /> ,
    },
    {
      path: "/analytics",
      name: "Analytics",
      icon: <BarChartOutlined />,
    },
    {
      path: "/activitylog",
      name: "Activity Log",
      icon: <HistoryOutlined />,
    },
    {
      type: 'divider',
    },
    {
      path: "/profile",
      name: "Profile",
      icon: <ProfileOutlined />,
    },
    {
      path: "/settings",
      name: "Settings",
      icon: <SettingOutlined />,
    },
    {
      path: "/logout",
      name: "Logout",
      icon: <LogoutOutlined />,
    }
  ];

  return (
    <ProLayout
      title="Neure Dashboard"
      menuDataRender={() => menuData}
      logo={neurelogo}
      menuItemRender={(item, dom) => <Link to={item.path}>{dom}</Link>}
      contentStyle={{ margin: -10, padding: 0 }}
      fixSiderbar
    >
      <div
        style={{
          padding: "24px",
          minHeight: "100vh",
          background: "yellow",
        }}
      >
        <Outlet />
      </div>
    </ProLayout>
  );
};

export default Sidebar;
