import React from "react";
import { ProLayout } from "@ant-design/pro-layout";
import { Link, Outlet, useLocation } from "react-router-dom";
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
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const location = useLocation();
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
      path: "/soundscapes",
      name: "Soundscapes",
      icon: <NotificationOutlined />,
    },
    {
      path: "/resources",
      name: "Resources",
      icon: <FolderOpenOutlined />,
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
    // {
    //   path: "/activitylog",
    //   name: "Activity Log",
    //   icon: <HistoryOutlined />,
    // },
    // {
    //   path: "/profile",
    //   name: "Profile",
    //   icon: <ProfileOutlined />,
    // },
    // {
    //   path: "/settings",
    //   name: "Settings",
    //   icon: <SettingOutlined />,
    // },
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
      menuItemRender={(item, dom) => (
        <Link 
          to={item.path}
          style={{
            color: location.pathname === item.path ? 'white' : undefined,
          }}
        >
          {dom}
        </Link>
      )}
      contentStyle={{ margin: 0, padding: 0 }}
      fixSiderbar
      menuProps={{
        selectedKeys: [location.pathname],
      }}
    >
      <div
        style={{
          padding: "24px",
          minHeight: "100vh",
          background: "#6faaf7",
        }}
      >
        <Outlet />
      </div>
    </ProLayout>
  );
};

export default Sidebar;
