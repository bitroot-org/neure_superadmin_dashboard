import React, { useState, useEffect } from "react";
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
  TagsOutlined,
  GiftOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  StopOutlined,
  CreditCardOutlined,
  TransactionOutlined,
  BellOutlined,
  ToolOutlined,
  TeamOutlined,
  WalletOutlined,
  CustomerServiceOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import { Modal } from "antd"; // Import Modal for confirmation dialog
import neurelogo from "../../assets/darkneurelogo.png";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import WhatsNew from "../WhatsNew/WhatsNew";
import { clearSessionStorage } from "../../utils/storage";
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
        // Clear session data (keeps preferences like "Don't show this again")
        clearSessionStorage();
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
  
  // Leaves keep their real routes; groups use a "/section/*" key that is never navigated to.
  const menuData = [
    {
      path: "/home",
      name: "Dashboard",
      icon: <HomeOutlined />,
    },
    {
      path: "/section/therapists",
      name: "Therapists",
      icon: <TeamOutlined />,
      children: [
        { path: "/prodesk-therapists", name: "Therapists", icon: <SolutionOutlined /> },
        { path: "/therapist-resources", name: "Therapist Resources", icon: <MedicineBoxOutlined /> },
        { path: "/consent-logs", name: "Consent Logs", icon: <SafetyCertificateOutlined /> },
        { path: "/accountsDeactivation", name: "Accounts Deactivated", icon: <StopOutlined /> },
        /* Session Details entry hidden per request, keep for later reuse
        { path: "/sessions", name: "Session Details", icon: <CalendarOutlined /> },
        */
      ],
    },
    {
      path: "/section/billing",
      name: "Billing",
      icon: <WalletOutlined />,
      children: [
        { path: "/subscriptions", name: "Subscriptions", icon: <CreditCardOutlined /> },
        { path: "/payments", name: "Payments", icon: <TransactionOutlined /> },
        { path: "/codes-promotions", name: "Codes & Promotions", icon: <TagsOutlined /> },
        { path: "/referrals", name: "Referral Program", icon: <GiftOutlined /> },
      ],
    },
    {
      path: "/section/support",
      name: "Support",
      icon: <CustomerServiceOutlined />,
      children: [
        { path: "/feedback", name: "Feedback", icon: <CommentOutlined /> },
        { path: "/faq", name: "FAQ", icon: <QuestionCircleOutlined /> },
        { path: "/prodesk-notifications", name: "Prodesk Notifications", icon: <BellOutlined /> },
      ],
    },
    {
      path: "/section/system",
      name: "System",
      icon: <ControlOutlined />,
      children: [
        { path: "/prodesk-maintenance", name: "Maintenance Mode", icon: <ToolOutlined /> },
        { path: "/superadmins", name: "Superadmins", icon: <UserSwitchOutlined /> },
        { path: "/activitylog", name: "Activity Logs", icon: <HistoryOutlined /> },
      ],
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

  // Open the section that contains the current page; users can toggle others freely.
  const activeSection = menuData.find(g => g.children?.some(c => c.path === currentPath))?.path;
  const [openKeys, setOpenKeys] = useState(activeSection ? [activeSection] : []);

  useEffect(() => {
    if (activeSection) setOpenKeys(keys => (keys.includes(activeSection) ? keys : [...keys, activeSection]));
  }, [activeSection]);

  return (
    <ProLayout
      title="Neure"
      menuDataRender={() => menuData}
      logo={
        <span className={styles.logoSquircle}>
          <img src={neurelogo} alt="Neure" />
        </span>
      }
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
      location={{ pathname: currentPath }}
      menuProps={{
        selectedKeys: selectedKeys,
        openKeys,
        onOpenChange: setOpenKeys,
      }}
    >
      <div
        style={{
          padding: "24px",
          minHeight: "100vh",
          background: "transparent",
        }}
      >
        <Outlet />
        <WhatsNew />
      </div>
    </ProLayout>
  );
};

export default Sidebar;
