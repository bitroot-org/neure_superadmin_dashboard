import React from "react";
import { ProLayout } from "@ant-design/pro-layout";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  SolutionOutlined,
  HistoryOutlined,
  SettingOutlined,
  LogoutOutlined,
  CommentOutlined,
  QuestionCircleOutlined,
  UserSwitchOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { Modal } from "antd"; // Import Modal for confirmation dialog
import neurelogo from "../../assets/darkneurelogo.png";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
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

  // Get the current path to determine selected keys
  const currentPath = location.pathname;
  
  // Define selected keys based on current path
  const selectedKeys = [currentPath];
  
  const menuData = [
    {
      path: "/home",
      name: "Dashboard",
      icon: <HomeOutlined />,
    },
    {
      path: "/prodesk-therapists",
      name: "Therapists",
      icon: <SolutionOutlined />,
    },
    {
      path: "/therapist-resources",
      name: "Therapist Resources",
      icon: <MedicineBoxOutlined />,
    },
    {
      path: '/feedback',
      name: 'Feedback',
      icon: <CommentOutlined />,
    },
    {
      path: "/faq",
      name: "FAQ",
      icon: <QuestionCircleOutlined />,
    },
    {
      path: "/superadmins",
      name: "Superadmins",
      icon: <UserSwitchOutlined />,
    },
    {
      path: '/AccountsDeactivation',
      name: 'Account Management',
      icon: <SettingOutlined />,
    },
    {
      path: "/activitylog",
      name: "Activity Logs",
      icon: <HistoryOutlined />,
    },
    {
      key: "theme-toggle",
      path: "#",
      name: "Theme",
      icon: <SettingOutlined />,
    },
    {
      key: "logout",
      path: "#",
      name: "Logout",
      icon: <LogoutOutlined />,
    }
  ];

  return (
    <ProLayout
      title="Neure"
      menuDataRender={() => menuData}
      logo={neurelogo}
      menuItemRender={(item, dom) => {
        // For theme toggle item, render the ThemeToggle component
        if (item.key === "theme-toggle") {
          return (
            <div className={styles.themeMenuItem}>
              <div className={styles.themeMenuLabel}>
                <SettingOutlined />
                <span>Theme</span>
              </div>
              <div className={styles.themeToggleWrapper}>
                <ThemeToggle 
                  variant="switch" 
                  showTooltip={true} 
                  size="small" 
                  className={styles.sidebarThemeToggle}
                />
              </div>
            </div>
          );
        }

        // For logout item, use a button with onClick
        if (item.key === "logout") {
          return (
            <button
              onClick={handleLogout}
              style={{
                cursor: 'pointer',
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
          );
        }
        
        // For regular menu items with a path, use Link
        if (item.path) {
          return <Link to={item.path}>{dom}</Link>;
        }
        
        // For items without a path (like parent menu items), just return the DOM
        return dom;
      }}
      contentStyle={{ margin: 0, padding: 0 }}
      fixSiderbar
      menuProps={{
        selectedKeys: selectedKeys,
      }}
    >
      <div
        style={{
          padding: "24px",
          minHeight: "100vh",
          background: "var(--background)",
        }}
      >
        <Outlet />
      </div>
    </ProLayout>
  );
};

export default Sidebar;
