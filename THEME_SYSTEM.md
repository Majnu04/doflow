# 🎨 DoFlow Theme System Documentation

## Architecture Overview

This is a **production-ready dark/light theme system** using React Context API + TailwindCSS.

### Key Features
✅ Zero-flicker theme loading  
✅ System preference detection  
✅ localStorage persistence  
✅ Instant theme switching  
✅ TypeScript support  
✅ Mobile-optimized (meta theme-color)  
✅ Accessible (ARIA labels)

---

## 📁 Folder Structure

```
src/
├── contexts/
│   └── ThemeContext.tsx          # Theme Context + Provider
├── components/
│   ├── ThemeToggle.tsx           # Toggle button components
│   ├── Navbar.tsx                # Updated with theme support
│   └── ui/                       # All UI components with dark mode
├── styles/
│   └── index.css                 # Global styles with CSS variables
└── store/
    └── index.ts                  # Redux (theme removed, using Context)
```

---

## 🚀 Implementation Guide

### 1. ThemeContext Setup

**Location:** `src/contexts/ThemeContext.tsx`

Features:
- Auto-detects system preference
- Saves to localStorage
- Exposes `theme`, `toggleTheme`, `setTheme`

Usage:
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### 2. Theme Toggle Component

**Location:** `src/components/ThemeToggle.tsx`

Three variants provided:
- `ThemeToggle` - Animated icon with smooth transition
- `ThemeToggleCompact` - Minimal version
- `ThemeToggleWithLabel` - With text label

### 3. Prevent Flicker Script

**Location:** `index.html`

Critical script that runs BEFORE React:
```html
<script>
  (function() {
    const theme = localStorage.getItem('theme') || 
                 (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
  })();
</script>
```

### 4. Wrap App with ThemeProvider

**Location:** `index.tsx`

```tsx
<Provider store={store}>
  <ThemeProvider>
    <App />
  </ThemeProvider>
</Provider>
```

---

## 🎨 Tailwind Color System

### Recommended Color Classes

#### Backgrounds
```tsx
className="bg-light-bg dark:bg-dark-bg"                    // Page background
className="bg-light-card dark:bg-dark-card"                // Cards
className="bg-light-cardAlt dark:bg-dark-cardAlt"          // Hover states
```

#### Text
```tsx
className="text-light-text dark:text-dark-text"            // Headings
className="text-light-textSecondary dark:text-dark-muted"  // Body text
className="text-light-textMuted dark:text-dark-muted"      // Muted text
```

#### Borders
```tsx
className="border-light-border dark:border-dark-border"
```

#### Brand Colors (Same in both themes)
```tsx
className="text-brand-primary"        // #4F46E5 (Indigo)
className="bg-brand-primary"
className="hover:bg-brand-primaryHover"
```

---

## 📄 Page Examples

### Example 1: Hero Section

```tsx
<section className="py-20 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
  <div className="max-w-7xl mx-auto px-4">
    <h1 className="text-5xl font-bold text-light-text dark:text-dark-text mb-6 transition-colors duration-300">
      Master Your Skills
    </h1>
    <p className="text-xl text-light-textSecondary dark:text-dark-muted transition-colors duration-300">
      Learn from industry experts
    </p>
    <button className="mt-8 px-8 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-2xl shadow-lg transition-all duration-300">
      Get Started
    </button>
  </div>
</section>
```

### Example 2: Course Card

```tsx
<div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
  <img src="course.jpg" className="w-full h-48 object-cover rounded-xl mb-4" />
  <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2 transition-colors duration-300">
    React Masterclass
  </h3>
  <p className="text-light-textSecondary dark:text-dark-muted mb-4 transition-colors duration-300">
    Learn React from scratch
  </p>
  <div className="flex items-center justify-between">
    <span className="text-2xl font-bold text-brand-primary">$49</span>
    <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primaryHover transition-colors duration-300">
      Enroll
    </button>
  </div>
</div>
```

### Example 3: Dashboard Stats

```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  {stats.map((stat) => (
    <div key={stat.label} className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 transition-colors duration-300">
      <div className="text-brand-primary text-3xl mb-2">{stat.icon}</div>
      <div className="text-3xl font-bold text-light-text dark:text-dark-text transition-colors duration-300">
        {stat.value}
      </div>
      <div className="text-sm text-light-textMuted dark:text-dark-muted transition-colors duration-300">
        {stat.label}
      </div>
    </div>
  ))}
</div>
```

### Example 4: Video Player Page

```tsx
<div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
  {/* Video Container */}
  <div className="bg-black rounded-2xl overflow-hidden shadow-xl">
    <video className="w-full aspect-video" controls />
  </div>
  
  {/* Video Info */}
  <div className="mt-6 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 transition-colors duration-300">
    <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4 transition-colors duration-300">
      Introduction to React Hooks
    </h1>
    <div className="flex items-center gap-4 text-light-textMuted dark:text-dark-muted transition-colors duration-300">
      <span>👁️ 1,234 views</span>
      <span>⏱️ 45:30</span>
    </div>
  </div>
</div>
```

---

## 🎯 Best Practices

### 1. Always Add Transitions
```tsx
className="transition-colors duration-300"
```

### 2. Use Semantic Color Names
❌ Don't: `className="bg-white dark:bg-gray-900"`  
✅ Do: `className="bg-light-card dark:bg-dark-card"`

### 3. Group Dark Mode Classes
```tsx
className="
  bg-light-card dark:bg-dark-card 
  text-light-text dark:text-dark-text 
  border-light-border dark:border-dark-border
  transition-colors duration-300
"
```

### 4. Consistent Shadow Usage
```tsx
className="shadow-sm hover:shadow-lg dark:shadow-none"
```

### 5. Test Both Themes
Always verify:
- Text readability
- Border visibility
- Hover states
- Focus states
- Loading states

---

## 🔧 Customization

### Change Theme Colors

Edit `tailwind.config.js`:
```js
colors: {
  light: {
    bg: '#F9FAFB',      // Change light background
    card: '#FFFFFF',
    // ...
  },
  dark: {
    bg: '#0F172A',      // Change dark background
    card: '#1E293B',
    // ...
  }
}
```

### Add Custom Color Variables

In `src/styles/index.css`:
```css
.dark {
  --custom-accent: #FF6B6B;
}
```

Use in components:
```tsx
<div style={{ color: 'var(--custom-accent)' }}>Custom color</div>
```

---

## 🐛 Troubleshooting

### Theme Not Persisting
- Check localStorage in DevTools
- Verify ThemeProvider wraps entire app

### Flicker on Load
- Ensure script in index.html runs BEFORE React
- Check no conflicting theme initialization

### Classes Not Applying
- Verify `darkMode: 'class'` in tailwind.config.js
- Check if `dark` class is on `<html>` element

### TypeScript Errors
- Ensure ThemeContext is imported correctly
- Check `useTheme()` is called inside ThemeProvider

---

## 📱 Mobile Optimization

Theme-color meta tag updates automatically:
```html
<meta name="theme-color" content="#FFFFFF" />  <!-- Light -->
<meta name="theme-color" content="#0F172A" />  <!-- Dark -->
```

---

## ♿ Accessibility

All theme toggles include:
```tsx
aria-label="Toggle theme"
```

Keyboard navigation supported by default.

---

## 🚀 Performance

- Zero runtime overhead (CSS variables + class toggle)
- No prop drilling (Context API)
- Minimal re-renders (only when theme changes)
- Lazy loading not needed (theme is global state)

---

## 📦 Production Checklist

- [x] ThemeProvider wraps app
- [x] Flicker prevention script in index.html
- [x] All pages use dark mode classes
- [x] Theme toggle in Navbar
- [x] localStorage persistence
- [x] System preference detection
- [x] Meta theme-color updates
- [x] Transition animations
- [x] TypeScript types
- [x] Accessibility labels

---

## 🎉 You're Ready!

Your theme system is now production-ready. Test thoroughly in both themes and enjoy the elite UI experience!

For questions or issues, check the implementation files or create an issue.
