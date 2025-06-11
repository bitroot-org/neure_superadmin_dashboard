import React from 'react';
import { Button, Switch, Tooltip, Space } from 'antd';
import { BulbOutlined, BulbFilled, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './ThemeToggle.module.css';

const ThemeToggle = ({
  variant = 'button', // 'button', 'switch', or 'icon-switch'
  size = 'middle',
  type = 'text',
  showTooltip = true,
  showLabels = false,
  className = '',
  style = {}
}) => {
  const { theme, toggleTheme, isDark, isLoading } = useTheme();

  const handleToggle = () => {
    if (!isLoading) {
      toggleTheme();
    }
  };

  // Switch variant with sun/moon icons
  if (variant === 'switch' || variant === 'icon-switch') {
    const switchContent = (
      <div className={`${styles.switchContainer} ${className}`} style={style}>
        {showLabels && (
          <Space size="small" className={styles.switchLabels}>
            <SunOutlined className={`${styles.switchIcon} ${!isDark ? styles.active : ''}`} />
            <Switch
              checked={isDark}
              onChange={handleToggle}
              loading={isLoading}
              size={size === 'large' ? 'default' : 'small'}
              className={styles.themeSwitch}
              aria-label="Toggle theme"
            />
            <MoonOutlined className={`${styles.switchIcon} ${isDark ? styles.active : ''}`} />
          </Space>
        )}
        {!showLabels && (
          <Switch
            checked={isDark}
            onChange={handleToggle}
            loading={isLoading}
            size={size === 'large' ? 'default' : 'small'}
            className={styles.themeSwitch}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            aria-label="Toggle theme"
          />
        )}
      </div>
    );

    // Remove tooltip conditional rendering and just return the content
    return switchContent;
  }

  // Original button variant
  const buttonContent = (
    <Button
      type={type}
      size={size}
      icon={isDark ? <BulbFilled /> : <BulbOutlined />}
      onClick={handleToggle}
      loading={isLoading}
      className={`${styles.themeToggle} ${className}`}
      style={style}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    />
  );

  if (showTooltip) {
    return (
      <Tooltip
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        placement="bottom"
      >
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
};

export default ThemeToggle;
