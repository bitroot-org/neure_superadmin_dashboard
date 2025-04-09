import React from "react";
import CustomIcon from "./CustomIcon";
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

  // Custom icon renderer to ensure visibility in collapsed mode
  const renderIcon = (Icon) => {
    return <CustomIcon icon={Icon} />;
  };

  const menuData = [
    {
      path: "/home",
      name: "Home",
      icon: renderIcon(HomeOutlined),
    },
    {
      path: "/companies",
      name: "Companies",
      icon: renderIcon(TeamOutlined),
    },
    {
      path: "/employees",
      name: "Employees",
      icon: renderIcon(UserOutlined),
    },
    {
      path: "/workshops",
      name: "Workshops",
      icon: renderIcon(FileTextOutlined),
    },
    {
      path: "/therapists",
      name: "Therapists",
      icon: renderIcon(SolutionOutlined),
    },
    {
      path: "/soundscapes",
      name: "Soundscapes",
      icon: renderIcon(NotificationOutlined),
    },
    {
      path: "/resources",
      name: "Resources",
      icon: renderIcon(FolderOpenOutlined),
    },
    {
      path: "/assessments",
      name: "Assessments",
      icon: renderIcon(FolderOpenOutlined),
    },
    {
      path: "/analytics",
      name: "Analytics",
      icon: renderIcon(BarChartOutlined),
    },
    {
      path: '/announcements',
      name: 'Announcements',
      icon: renderIcon(NotificationOutlined),
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
      icon: renderIcon(LogoutOutlined),
    }
  ];

  return (
    <ProLayout
      title={<span className={styles.logoTitle}>Neure</span>}
      menuDataRender={() => menuData}
      logo={neurelogo}
      menuItemRender={(item, dom) => (
        item.key === "logout" ?
        // For logout item, use a button with onClick instead of Link
        <button
          onClick={handleLogout}
          className={styles.menuButton}
          style={{
            cursor: 'pointer',
            color: 'white',
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
          className={styles.menuLink}
          style={{
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {dom}
        </Link>
      )}
      contentStyle={{ margin: 0, padding: 0 }}
      fixSiderbar
      menuProps={{
        selectedKeys: [location.pathname],
        mode: 'inline',
        inlineIndent: 16
      }}
      menuContentRender={(_, dom) => {
        return (
          <div className={styles.menuContent}>
            {dom}
          </div>
        );
      }}
      siderWidth={260}
      collapsedWidth={80}
      breakpoint="lg"
      collapsible={true}
      defaultCollapsed={false}
      className={styles.customSidebar}
    >
      <div className={styles.contentContainer}>
        <Outlet />
      </div>
    </ProLayout>
  );
};

export default Sidebar;
