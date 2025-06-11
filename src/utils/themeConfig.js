// Ant Design theme configurations for light and dark modes

export const lightThemeConfig = {
  token: {
    fontFamily: "Archivo, sans-serif",
    
    // Primary colors
    colorPrimary: "#48A6A7",
    colorPrimaryHover: "#006A71",
    colorPrimaryActive: "#006A71",
    colorPrimaryBg: "#9ACBD0",
    colorPrimaryBgHover: "#48A6A7",

    // Background colors
    colorBgBase: "#F2EFE7",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBgLayout: "#F2EFE7",
    colorBgSpotlight: "#f9f9f9",

    // Text colors
    colorText: "#333333",
    colorTextSecondary: "#666666",
    colorTextTertiary: "#999999",
    colorTextQuaternary: "#cccccc",

    // Border colors
    colorBorder: "rgba(154, 203, 208, 0.2)",
    colorBorderSecondary: "#e8e8e8",

    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,

    // Shadows
    boxShadow: "0 2px 8px rgba(0, 106, 113, 0.1)",
    boxShadowSecondary: "0 4px 12px rgba(0, 106, 113, 0.12)",
    boxShadowTertiary: "0 1px 2px rgba(0, 106, 113, 0.04)",

    // Other tokens
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1677ff",
  },
  components: {
    Typography: {
      titleFontFamily: "Clash Display, sans-serif",
      fontWeightStrong: 600,
      colorTextHeading: "#006A71",
    },
    Table: {
      headerFontSize: 14,
      headerFontWeight: 600,
      headerBg: "#9ACBD0",
      headerColor: "#006A71",
      fontWeightStrong: 600,
      colorBgContainer: "#ffffff",
      borderColor: "rgba(154, 203, 208, 0.2)",
    },
    Button: {
      colorPrimary: "#48A6A7",
      colorPrimaryHover: "#006A71",
      colorPrimaryActive: "#006A71",
      borderRadius: 6,
    },
    Card: {
      colorBgContainer: "#ffffff",
      borderRadiusLG: 12,
      boxShadow: "0 2px 8px rgba(0, 106, 113, 0.08)",
    },
    Layout: {
      colorBgHeader: "#ffffff",
      colorBgBody: "#F2EFE7",
      colorBgTrigger: "#48A6A7",
    },
    Menu: {
      colorBgContainer: "#ffffff",
      colorItemBg: "transparent",
      colorItemBgSelected: "#48A6A7",
      colorItemBgHover: "#48A6A7",
      colorItemText: "#333333",
      colorItemTextSelected: "#ffffff",
      colorItemTextHover: "#ffffff",
    },
    Drawer: {
      colorBgElevated: "#ffffff",
      colorBgMask: "rgba(0, 0, 0, 0.45)",
    },
    Modal: {
      colorBgElevated: "#ffffff",
      colorBgMask: "rgba(0, 0, 0, 0.45)",
    },
  },
};

export const darkThemeConfig = {
  token: {
    fontFamily: "Archivo, sans-serif",
    
    // Primary colors - adjusted for dark mode
    colorPrimary: "#6BC9CE",
    colorPrimaryHover: "#4ABBC2",
    colorPrimaryActive: "#4ABBC2",
    colorPrimaryBg: "#8DD5D9",
    colorPrimaryBgHover: "#6BC9CE",

    // Background colors
    colorBgBase: "#0f0f0f",
    colorBgContainer: "#1a1a1a",
    colorBgElevated: "#2a2a2a",
    colorBgLayout: "#0f0f0f",
    colorBgSpotlight: "#262626",

    // Text colors
    colorText: "#ffffff",
    colorTextSecondary: "#d9d9d9",
    colorTextTertiary: "#8c8c8c",
    colorTextQuaternary: "#595959",

    // Border colors
    colorBorder: "rgba(75, 187, 194, 0.3)",
    colorBorderSecondary: "#404040",

    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,

    // Shadows
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    boxShadowSecondary: "0 4px 12px rgba(0, 0, 0, 0.4)",
    boxShadowTertiary: "0 1px 2px rgba(0, 0, 0, 0.2)",

    // Other tokens
    colorSuccess: "#73d13d",
    colorWarning: "#ffc53d",
    colorError: "#ff7875",
    colorInfo: "#40a9ff",
  },
  components: {
    Typography: {
      titleFontFamily: "Clash Display, sans-serif",
      fontWeightStrong: 600,
      colorTextHeading: "#4ABBC2",
    },
    Table: {
      headerFontSize: 14,
      headerFontWeight: 600,
      headerBg: "#2a2a2a",
      headerColor: "#4ABBC2",
      fontWeightStrong: 600,
      colorBgContainer: "#1a1a1a",
      borderColor: "rgba(75, 187, 194, 0.3)",
    },
    Button: {
      colorPrimary: "#6BC9CE",
      colorPrimaryHover: "#4ABBC2",
      colorPrimaryActive: "#4ABBC2",
      borderRadius: 6,
    },
    Card: {
      colorBgContainer: "#1a1a1a",
      borderRadiusLG: 12,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
    },
    Layout: {
      colorBgHeader: "#1a1a1a",
      colorBgBody: "#0f0f0f",
      colorBgTrigger: "#6BC9CE",
    },
    Menu: {
      colorBgContainer: "#1a1a1a",
      colorItemBg: "transparent",
      colorItemBgSelected: "#6BC9CE",
      colorItemBgHover: "#6BC9CE",
      colorItemText: "#ffffff",
      colorItemTextSelected: "#000000",
      colorItemTextHover: "#000000",
    },
    Drawer: {
      colorBgElevated: "#1a1a1a",
      colorBgMask: "rgba(0, 0, 0, 0.7)",
    },
    Modal: {
      colorBgElevated: "#1a1a1a",
      colorBgMask: "rgba(0, 0, 0, 0.7)",
    },
  },
};

export const getThemeConfig = (theme) => {
  return theme === 'dark' ? darkThemeConfig : lightThemeConfig;
};
