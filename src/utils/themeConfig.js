import { theme } from "antd";

// Ant Design theme configurations for light and dark modes

export const lightThemeConfig = {
  token: {
    fontFamily: "Archivo, sans-serif",

    // Primary colors — emerald (light counterpart of dark mode's mint)
    colorPrimary: "#0E9F6E",
    colorPrimaryHover: "#16B37E",
    colorPrimaryActive: "#0B7D57",
    colorPrimaryBg: "#EEF7F2",
    colorPrimaryBgHover: "#DDF0E6",
    colorLink: "#0B7D57",
    colorLinkHover: "#0E9F6E",

    // Background colors
    colorBgBase: "#ffffff",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBgLayout: "#F4F7F5",
    colorBgSpotlight: "#1F2328",

    // Text colors
    colorText: "#1F2328",
    colorTextSecondary: "#5B6560",
    colorTextTertiary: "#8A938E",
    colorTextQuaternary: "#B7BEBA",
    colorTextHeading: "#1F2328",

    // Border colors
    colorBorder: "#E3E8E5",
    colorBorderSecondary: "#EBEFED",
    colorSplit: "rgba(16, 24, 20, 0.06)",

    // Border radius
    borderRadius: 4,
    borderRadiusLG: 6,
    borderRadiusSM: 2,
    borderRadiusXS: 1,

    // Shadows
    boxShadow: "0 1px 3px rgba(16, 24, 20, 0.06), 0 1px 2px rgba(16, 24, 20, 0.04)",
    boxShadowSecondary: "0 12px 32px rgba(16, 24, 20, 0.10)",
    boxShadowTertiary: "0 1px 2px rgba(16, 24, 20, 0.04)",

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
      colorTextHeading: "#1F2328",
    },
    Table: {
      headerFontSize: 14,
      headerFontWeight: 600,
      headerBg: "#F7F9F8",
      headerColor: "#5B6560",
      fontWeightStrong: 600,
      colorBgContainer: "#ffffff",
      borderColor: "#EBEFED",
      rowHoverBg: "rgba(14, 159, 110, 0.04)",
    },
    Button: {
      colorPrimary: "#0E9F6E",
      colorPrimaryHover: "#16B37E",
      colorPrimaryActive: "#0B7D57",
      primaryShadow: "0 1px 2px rgba(11, 125, 87, 0.25)",
      borderRadius: 3,
    },
    Card: {
      colorBgContainer: "#ffffff",
      borderRadiusLG: 6,
      boxShadow: "0 1px 3px rgba(16, 24, 20, 0.06)",
    },
    Layout: {
      colorBgHeader: "#ffffff",
      colorBgBody: "transparent",
      colorBgTrigger: "#0E9F6E",
      bodyBg: "transparent",
    },
    Menu: {
      colorBgContainer: "transparent",
      colorItemBg: "transparent",
      colorItemBgSelected: "rgba(14, 159, 110, 0.10)",
      colorItemBgHover: "rgba(14, 159, 110, 0.06)",
      colorItemText: "#3A423E",
      colorItemTextSelected: "#0B7D57",
      colorItemTextHover: "#1F2328",
    },
    Drawer: {
      colorBgElevated: "#ffffff",
      colorBgMask: "rgba(16, 24, 20, 0.35)",
    },
    Modal: {
      colorBgElevated: "#ffffff",
      colorBgMask: "rgba(16, 24, 20, 0.35)",
    },
    // colorBgSpotlight is dark here, so Tooltip text stays white.
    Tooltip: {
      colorBgSpotlight: "#1F2328",
      colorTextLightSolid: "#ffffff",
    },
  },
};

// Dark mode — near-black surfaces with subtle mint hints (matches the sign-in page).
export const darkThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    fontFamily: "Archivo, sans-serif",

    // Primary colors — soft mint accent
    colorPrimary: "#5FD3A5",
    colorPrimaryHover: "#7EE2BA",
    colorPrimaryActive: "#46B98C",
    colorPrimaryBg: "rgba(95, 211, 165, 0.12)",
    colorPrimaryBgHover: "rgba(95, 211, 165, 0.18)",
    colorLink: "#7EE2BA",
    colorLinkHover: "#A7F0CF",

    // Background colors
    colorBgBase: "#060807",
    colorBgContainer: "#0C100E",
    colorBgElevated: "#121815",
    colorBgLayout: "#060807",
    colorBgSpotlight: "#1A221E",
    colorBgMask: "rgba(0, 0, 0, 0.72)",

    // Text colors
    colorText: "#EEF3F0",
    colorTextSecondary: "#B4BDB8",
    colorTextTertiary: "#7C8681",
    colorTextQuaternary: "#525A56",
    colorTextHeading: "#EEF3F0",
    colorTextLightSolid: "#04110B",

    // Border colors
    colorBorder: "#212A26",
    colorBorderSecondary: "#18201C",
    colorSplit: "rgba(255, 255, 255, 0.06)",

    // Border radius
    borderRadius: 4,
    borderRadiusLG: 6,
    borderRadiusSM: 2,
    borderRadiusXS: 1,

    // Shadows
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
    boxShadowSecondary: "0 12px 32px rgba(0, 0, 0, 0.6)",
    boxShadowTertiary: "0 1px 2px rgba(0, 0, 0, 0.3)",

    // Status colors
    colorSuccess: "#5FD3A5",
    colorWarning: "#F5C451",
    colorError: "#FF7B7B",
    colorInfo: "#7CB7FF",
  },
  components: {
    Typography: {
      titleFontFamily: "Clash Display, sans-serif",
      fontWeightStrong: 600,
      colorTextHeading: "#EEF3F0",
    },
    Table: {
      headerFontSize: 14,
      headerFontWeight: 600,
      headerBg: "#101512",
      headerColor: "#B4BDB8",
      fontWeightStrong: 600,
      colorBgContainer: "#0C100E",
      borderColor: "#18201C",
      rowHoverBg: "rgba(95, 211, 165, 0.05)",
    },
    Button: {
      colorPrimary: "#5FD3A5",
      colorPrimaryHover: "#7EE2BA",
      colorPrimaryActive: "#46B98C",
      primaryColor: "#04110B",
      primaryShadow: "none",
      defaultBg: "#121815",
      defaultBorderColor: "#28322D",
      defaultColor: "#EEF3F0",
      borderRadius: 3,
    },
    Card: {
      colorBgContainer: "#0C100E",
      borderRadiusLG: 6,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
    },
    Layout: {
      colorBgHeader: "#0A0D0B",
      colorBgBody: "transparent",
      colorBgTrigger: "#5FD3A5",
      siderBg: "#0A0D0B",
      headerBg: "#0A0D0B",
      bodyBg: "transparent",
    },
    Menu: {
      colorBgContainer: "#0A0D0B",
      colorItemBg: "transparent",
      colorItemBgSelected: "rgba(95, 211, 165, 0.12)",
      colorItemBgHover: "rgba(255, 255, 255, 0.05)",
      colorItemText: "#B4BDB8",
      colorItemTextSelected: "#7EE2BA",
      colorItemTextHover: "#EEF3F0",
    },
    Drawer: {
      colorBgElevated: "#0C100E",
      colorBgMask: "rgba(0, 0, 0, 0.72)",
    },
    Modal: {
      contentBg: "#121815",
      headerBg: "#121815",
      footerBg: "transparent",
      titleColor: "#EEF3F0",
      colorBgMask: "rgba(0, 0, 0, 0.72)",
    },
    Message: {
      contentBg: "#121815",
    },
    Tooltip: {
      colorBgSpotlight: "#1A221E",
      colorTextLightSolid: "#EEF3F0",
    },
    Tag: {
      defaultBg: "#121815",
      defaultColor: "#B4BDB8",
    },
  },
};

export const getThemeConfig = (theme) => {
  return theme === 'dark' ? darkThemeConfig : lightThemeConfig;
};
