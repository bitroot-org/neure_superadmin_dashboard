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
  CommentOutlined,
  GiftOutlined,
  QuestionCircleOutlined,
  FormOutlined,
  UserSwitchOutlined,
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

  // Get the current path to determine selected keys
  const currentPath = location.pathname;
  
  // Define selected keys based on current path
  const selectedKeys = [currentPath];
  
  // Define open keys for submenus
  const openKeys = currentPath.includes('/employees/assessment') ? ['assessments'] : [];

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
      path: "/superadmins",
      name: "Superadmins",
      icon: <UserSwitchOutlined />,
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
      key: 'assessments',
      name: 'Assessments',
      icon: <FormOutlined />,
      children: [
        {
          key: '/employees/assessments',  // Use path as key
          name: 'Manage Assessments',
          path: '/employees/assessments',
        },
        {
          key: '/employees/assessment-reports',  // Use path as key
          name: 'Assessment Reports',
          path: '/employees/assessment-reports',
        }
      ]
    },
    {
      path: '/announcements',
      name: 'Announcements',
      icon: <NotificationOutlined />,
    },
    {
      path: '/feedback',
      name: 'Feedback',
      icon: <CommentOutlined />,
    },
    {
      path: '/AccountsDeactivation',
      name: 'Accounts Deactivation',
      icon: <NotificationOutlined />,
    },
    {
      path: "/rewards",
      name: "Rewards",
      icon: <GiftOutlined />,
    },
    {
      path: "/faq",
      name: "FAQ",
      icon: <QuestionCircleOutlined />,
    },
    {
      path: "/activitylog",
      name: "Activity History",
      icon: <HistoryOutlined />,
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
      title="Neure Dashboard"
      menuDataRender={() => menuData}
      logo={neurelogo}
      menuItemRender={(item, dom) => {
        // For logout item, use a button with onClick
        if (item.key === "logout") {
          return (
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
          );
        }
        
        // For regular menu items with a path, use Link
        if (item.path) {
          return (
            <Link
              to={item.path}
              style={{
                color: location.pathname === item.path ? 'white' : undefined,
              }}
            >
              {dom}
            </Link>
          );
        }
        
        // For items without a path (like parent menu items), just return the DOM
        return dom;
      }}
      contentStyle={{ margin: 0, padding: 0 }}
      fixSiderbar
      menuProps={{
        selectedKeys: selectedKeys,
        defaultOpenKeys: openKeys,
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
