/**
 * Theme utility functions for the Neure Super Admin Dashboard
 */

/**
 * Get theme-aware styles based on current theme
 * @param {string} theme - Current theme ('light' or 'dark')
 * @param {object} lightStyles - Styles for light theme
 * @param {object} darkStyles - Styles for dark theme
 * @returns {object} Theme-appropriate styles
 */
export const getThemeStyles = (theme, lightStyles, darkStyles) => {
  return theme === 'dark' ? darkStyles : lightStyles;
};

/**
 * Get theme-aware color value
 * @param {string} theme - Current theme ('light' or 'dark')
 * @param {string} lightColor - Color for light theme
 * @param {string} darkColor - Color for dark theme
 * @returns {string} Theme-appropriate color
 */
export const getThemeColor = (theme, lightColor, darkColor) => {
  return theme === 'dark' ? darkColor : lightColor;
};

/**
 * Generate theme-aware CSS class names
 * @param {string} baseClass - Base CSS class name
 * @param {string} theme - Current theme ('light' or 'dark')
 * @param {object} options - Additional options
 * @returns {string} Combined class names
 */
export const getThemeClassName = (baseClass, theme, options = {}) => {
  const { prefix = '', suffix = '' } = options;
  return `${prefix}${baseClass} ${baseClass}-${theme}${suffix}`.trim();
};

/**
 * Check if current theme is dark
 * @param {string} theme - Current theme
 * @returns {boolean} True if dark theme
 */
export const isDarkTheme = (theme) => theme === 'dark';

/**
 * Check if current theme is light
 * @param {string} theme - Current theme
 * @returns {boolean} True if light theme
 */
export const isLightTheme = (theme) => theme === 'light';

/**
 * Get system theme preference
 * @returns {string} 'dark' or 'light'
 */
export const getSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

/**
 * Theme-aware style constants
 */
export const THEME_COLORS = {
  light: {
    primary: '#48A6A7',
    primaryDark: '#006A71',
    primaryLight: '#9ACBD0',
    background: '#F2EFE7',
    backgroundSecondary: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: 'rgba(154, 203, 208, 0.2)',
  },
  dark: {
    primary: '#6BC9CE',
    primaryDark: '#4ABBC2',
    primaryLight: '#8DD5D9',
    background: '#0f0f0f',
    backgroundSecondary: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#d9d9d9',
    border: 'rgba(75, 187, 194, 0.3)',
  },
};

/**
 * Get color from theme constants
 * @param {string} theme - Current theme
 * @param {string} colorKey - Color key from THEME_COLORS
 * @returns {string} Color value
 */
export const getThemeColorValue = (theme, colorKey) => {
  return THEME_COLORS[theme]?.[colorKey] || THEME_COLORS.light[colorKey];
};

/**
 * Generate inline styles for theme-aware components
 * @param {string} theme - Current theme
 * @param {object} styleMap - Map of CSS properties to theme color keys
 * @returns {object} Inline styles object
 */
export const generateThemeStyles = (theme, styleMap) => {
  const styles = {};
  
  Object.entries(styleMap).forEach(([cssProperty, colorKey]) => {
    styles[cssProperty] = getThemeColorValue(theme, colorKey);
  });
  
  return styles;
};

/**
 * Theme transition configuration
 */
export const THEME_TRANSITION = {
  duration: '0.3s',
  easing: 'ease',
  properties: ['background-color', 'color', 'border-color', 'box-shadow'],
};

/**
 * Get CSS transition string for theme changes
 * @returns {string} CSS transition value
 */
export const getThemeTransition = () => {
  return THEME_TRANSITION.properties
    .map(prop => `${prop} ${THEME_TRANSITION.duration} ${THEME_TRANSITION.easing}`)
    .join(', ');
};
