import React from "react";
import { ProLayout } from "@ant-design/pro-layout";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
import { Modal } from "antd"; // Import Modal for confirmation dialog
import neurelogo from "../../assets/darkneurelogo.png";
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Add useNavigate hook for redirection
  
  // Updated logout handler function with console logging
  const handleLogout = (e) => {
    console.log("Logout clicked");
    // Prevent default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Show confirmation dialog
    Modal.confirm({
      title: 'Confirm Logout',
      content: 'Are you sure you want to logout?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        console.log("Logout confirmed");
        // Clear all items from localStorage
        localStorage.clear();
        // Redirect to login page
        navigate('/login');
      },
      onCancel: () => {
        console.log("Logout cancelled");
      }
    });
  };

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
      key: "logout",
      path: "#",
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
        item.key === "logout" ? 
        // For logout item, use a button with onClick instead of Link
        <button 
          onClick={handleLogout}
          style={{
            cursor: 'pointer',
            color: location.pathname === item.path ? 'white' : undefined,
            background: 'transparent',
            border: 'none',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            textAlign: 'left'
          }}
        >
          {dom}
        </button>
        :
        // For regular menu items, use Link as before
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
