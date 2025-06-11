# Dark Mode Implementation Guide

## Overview

This document outlines the comprehensive dark mode implementation for the Neure Super Admin Dashboard. The implementation provides a seamless toggle between light and dark themes while maintaining the luxury, classic, modern design aesthetic.

## Features Implemented

### 1. Theme Toggle Functionality
- **Location**: Theme toggle button in the sidebar header
- **Persistence**: User preference saved in localStorage
- **System Integration**: Automatically detects system preference on first visit
- **Smooth Transitions**: 0.3s ease transitions for all theme changes

### 2. CSS Variables System
- **Comprehensive Color Palette**: Defined for both light and dark modes
- **Semantic Naming**: Variables named by purpose (background-primary, text-heading, etc.)
- **Backward Compatibility**: Legacy variables maintained for existing code

### 3. Color Palette Integration
- **Light Mode**: Original palette (#006A71, #48A6A7, #9ACBD0, #F2EFE7)
- **Dark Mode**: Adapted palette with proper contrast ratios
- **Accessibility**: WCAG compliant contrast ratios maintained

### 4. Component Coverage
- ✅ Home page and dashboard
- ✅ Sidebar and navigation elements
- ✅ Tables and data displays
- ✅ Forms and input elements
- ✅ Modals and drawers
- ✅ Feedback tab and all existing components

## File Structure

```
src/
├── contexts/
│   └── ThemeContext.jsx          # Theme state management
├── components/
│   └── ThemeToggle/
│       ├── ThemeToggle.jsx       # Toggle button component
│       └── ThemeToggle.module.css # Toggle button styles
├── utils/
│   └── themeConfig.js            # Ant Design theme configurations
├── pages/
│   ├── Home/Home.module.css      # Updated with theme variables
│   └── Feedback/Feedback.module.css # Updated with theme variables
├── components/Sidebar/
│   ├── Sidebar.jsx               # Added theme toggle
│   └── Sidebar.module.css        # Updated with theme variables
├── index.css                     # Global theme variables and overrides
└── App.jsx                       # Theme provider integration
```

## Implementation Details

### Theme Context (`src/contexts/ThemeContext.jsx`)
- Manages global theme state
- Handles localStorage persistence
- Listens for system preference changes
- Provides theme utilities (isDark, isLight, toggleTheme)

### CSS Variables (`src/index.css`)
- **Light Theme**: 40+ semantic color variables
- **Dark Theme**: Corresponding dark variants
- **Smooth Transitions**: Applied to all interactive elements
- **Global Overrides**: Ant Design component styling

### Ant Design Integration (`src/utils/themeConfig.js`)
- Separate theme configurations for light/dark modes
- Component-specific customizations
- Token-based theming system

## Usage

### Accessing Theme State
```jsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'light' : 'dark'} mode
      </button>
    </div>
  );
};
```

### Using CSS Variables
```css
.myComponent {
  background-color: var(--background-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
}
```

### Adding Theme Toggle to Components
```jsx
import ThemeToggle from '../ThemeToggle/ThemeToggle';

const Header = () => (
  <div className="header">
    <h1>My App</h1>
    <ThemeToggle />
  </div>
);
```

## CSS Variable Reference

### Background Colors
- `--background-primary`: Main page background
- `--background-secondary`: Card/container background
- `--background-tertiary`: Subtle background areas
- `--background-elevated`: Elevated surfaces (modals, dropdowns)

### Text Colors
- `--text-primary`: Primary text content
- `--text-secondary`: Secondary/muted text
- `--text-tertiary`: Very muted text
- `--text-heading`: Headings and titles
- `--text-inverse`: Text on dark backgrounds

### Interactive Colors
- `--hover-bg`: Hover state backgrounds
- `--active-bg`: Active state backgrounds
- `--focus-outline`: Focus outline color

### Border & Shadow Colors
- `--border-primary`: Primary borders
- `--border-secondary`: Secondary borders
- `--shadow-primary`: Primary shadows
- `--shadow-secondary`: Secondary shadows

## Accessibility Features

1. **Proper Contrast Ratios**: All text meets WCAG AA standards
2. **System Preference Detection**: Respects user's OS theme setting
3. **Keyboard Navigation**: Theme toggle accessible via keyboard
4. **Screen Reader Support**: ARIA labels for theme toggle
5. **Reduced Motion**: Respects prefers-reduced-motion setting

## Browser Support

- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+

## Performance Considerations

- **CSS Variables**: Minimal performance impact
- **Transitions**: Hardware-accelerated where possible
- **localStorage**: Efficient theme persistence
- **Bundle Size**: ~3KB additional JavaScript

## Future Enhancements

1. **Auto Theme Switching**: Based on time of day
2. **Custom Color Themes**: User-defined color schemes
3. **High Contrast Mode**: Enhanced accessibility option
4. **Theme Animations**: More sophisticated transition effects

## Troubleshooting

### Theme Not Persisting
- Check localStorage permissions
- Verify ThemeProvider wraps entire app

### Styles Not Updating
- Ensure CSS variables are used instead of hardcoded colors
- Check for CSS specificity issues

### Performance Issues
- Disable transitions temporarily: `* { transition: none !important; }`
- Check for excessive re-renders in theme context

## Testing

1. **Manual Testing**: Toggle between themes and verify all components
2. **Accessibility Testing**: Use screen readers and keyboard navigation
3. **Browser Testing**: Test across different browsers and devices
4. **Performance Testing**: Monitor for layout shifts and rendering issues
