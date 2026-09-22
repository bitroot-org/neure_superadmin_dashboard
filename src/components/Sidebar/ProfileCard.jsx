import React, { useMemo } from "react";
import { Popover, Tooltip } from "antd";
import { LogoutOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { useTheme } from "../../contexts/ThemeContext";
import styles from "./ProfileCard.module.css";

// Login stores the user row (minus password) in localStorage.userData.
const readUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem("userData") || "{}") || {};
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
    const name = fullName || user.username || user.email?.split("@")[0] || "Superadmin";
    const initials = name
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
    return { name, email: user.email || "", initials: initials || "S" };
  } catch {
    return { name: "Superadmin", email: "", initials: "S" };
  }
};

const ThemeRow = () => {
  const { isDark } = useTheme();
  return (
    <div className={styles.themeRow}>
      <span className={styles.themeLabel}>
        {isDark ? <MoonOutlined /> : <SunOutlined />}
        {isDark ? "Dark mode" : "Light mode"}
      </span>
      <ThemeToggle variant="switch" size="small" />
    </div>
  );
};

const ProfileCard = ({ collapsed, onLogout }) => {
  const user = useMemo(readUser, []);

  const identity = (
    <div className={styles.identity}>
      <span className={styles.avatar} aria-hidden="true">{user.initials}</span>
      <div className={styles.text}>
        <span className={styles.name} title={user.name}>{user.name}</span>
        <span className={styles.email} title={user.email}>{user.email || "Superadmin"}</span>
      </div>
    </div>
  );

  const logoutButton = (
    <Tooltip title="Log out" placement="top">
      <button type="button" className={styles.logout} onClick={onLogout} aria-label="Log out">
        <LogoutOutlined />
      </button>
    </Tooltip>
  );

  // Collapsed sidebar: just the avatar; the full card opens in a popover.
  if (collapsed) {
    return (
      <Popover
        placement="rightBottom"
        trigger="click"
        arrow={false}
        content={
          <div className={styles.popover}>
            <div className={styles.header}>
              {identity}
              {logoutButton}
            </div>
            <ThemeRow />
          </div>
        }
      >
        <button type="button" className={styles.collapsedAvatar} aria-label="Account and theme">
          <span className={styles.avatar}>{user.initials}</span>
        </button>
      </Popover>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {identity}
        {logoutButton}
      </div>
      <ThemeRow />
    </div>
  );
};

export default ProfileCard;
