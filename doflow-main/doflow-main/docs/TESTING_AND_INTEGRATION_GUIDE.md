# Testing & Integration Guide

## Part 1: Responsive Behavior Testing

### Testing Checklist

#### 🖥️ Desktop Testing (1440px+)

- [ ] **LearningPage**
  - [ ] Sidebar visible at 320px fixed width
  - [ ] Sidebar remains open by default
  - [ ] Module accordion expands/collapses smoothly
  - [ ] Lesson selection highlights current item
  - [ ] Progress bars animate on load
  - [ ] Two-column layout (sidebar + content)
  - [ ] Sticky sidebar behavior (if implemented)
  
- [ ] **CourseDetailsPage**
  - [ ] Hero section gradient renders correctly
  - [ ] Two-column layout (2/3 + 1/3 split)
  - [ ] Purchase card sticky at lg:top-24
  - [ ] Curriculum modules collapse/expand
  - [ ] CTA buttons state-aware (enrolled vs not)
  - [ ] Card shadows and hover effects work

#### 💻 Tablet Testing (768px - 1023px)

- [ ] **LearningPage**
  - [ ] Sidebar converts to drawer (slide-in from left)
  - [ ] Hamburger menu appears in top-left
  - [ ] Backdrop overlay blocks content when drawer open
  - [ ] Touch gestures close drawer (tap outside)
  - [ ] Bottom navigation bar appears
  - [ ] Content width adjusts properly
  
- [ ] **CourseDetailsPage**
  - [ ] Layout switches to single column
  - [ ] Purchase card moves above content
  - [ ] Curriculum remains collapsible
  - [ ] Touch targets increased (44x44px min)
  - [ ] Hero section height adjusts

#### 📱 Mobile Testing (375px - 767px)

- [ ] **LearningPage**
  - [ ] Drawer slides in smoothly from left
  - [ ] Close button (X) visible in drawer header
  - [ ] Bottom sticky navigation shows 4 buttons
  - [ ] Bottom nav icons clear and tappable
  - [ ] Content padding reduced for mobile
  - [ ] Breadcrumb hides on mobile
  - [ ] Module cards stack vertically
  
- [ ] **CourseDetailsPage**
  - [ ] Hero section responsive height
  - [ ] Purchase card full width on mobile
  - [ ] CTA buttons full width or stacked
  - [ ] Curriculum accordion touch-friendly
  - [ ] Stats row wraps properly
  - [ ] Images scale correctly

#### 🔍 Breakpoint Verification

Test at these exact widths:

| Device | Width | Expected Behavior |
|--------|-------|-------------------|
| iPhone SE | 375px | Mobile layout, drawer, bottom nav |
| iPhone 12/13 | 390px | Mobile layout |
| iPhone 14 Pro Max | 430px | Mobile layout |
| iPad Mini | 768px | Tablet layout, drawer |
| iPad Pro | 1024px | Desktop layout, sidebar |
| Desktop | 1440px | Full desktop, sticky sidebar |
| Wide Desktop | 1920px | Max width container |

### Cross-Browser Testing

- [ ] **Chrome** (v90+)
  - [ ] Layout renders correctly
  - [ ] Animations smooth
  - [ ] Dark mode toggle works
  
- [ ] **Firefox** (v88+)
  - [ ] CSS Grid layout correct
  - [ ] Transitions work
  - [ ] Dark mode correct
  
- [ ] **Safari** (v14+)
  - [ ] Webkit prefixes work
  - [ ] Touch gestures work
  - [ ] Dark mode adapts to system
  
- [ ] **Edge** (v90+)
  - [ ] All features work
  - [ ] No visual glitches

### Performance Testing

- [ ] **Load Times**
  - [ ] Skeleton loaders appear immediately
  - [ ] Content loads within 2 seconds (good connection)
  - [ ] No layout shift (CLS < 0.1)
  - [ ] Images lazy load below fold
  
- [ ] **Animations**
  - [ ] Progress bars animate at 60fps
  - [ ] Drawer transitions smooth (300ms)
  - [ ] No jank on scroll
  - [ ] Reduced motion respected

### Accessibility Testing

- [ ] **Keyboard Navigation**
  - [ ] Tab order logical
  - [ ] Focus visible on all interactive elements
  - [ ] Drawer closes with Escape key
  - [ ] Module accordion keyboard accessible
  
- [ ] **Screen Reader**
  - [ ] Page landmarks announced
  - [ ] Current lesson announced
  - [ ] Progress percentage announced
  - [ ] Button states clear ("enrolled" vs "add to cart")
  
- [ ] **Color Contrast**
  - [ ] Text meets WCAG AA (4.5:1 minimum)
  - [ ] Interactive elements distinct
  - [ ] Dark mode equally accessible
  
- [ ] **Touch Targets**
  - [ ] Minimum 44x44px on mobile
  - [ ] Adequate spacing between targets
  - [ ] No accidental taps

### Dark Mode Testing

- [ ] Colors appropriate in dark mode
- [ ] Shadows visible but not harsh
- [ ] Text readable on all backgrounds
- [ ] Orange accent visible in dark mode
- [ ] Skeleton loaders use dark gray
- [ ] No white flashes on load

### Testing Tools

**Recommended Extensions:**

- **Responsive Viewer** (Chrome): Test multiple viewports simultaneously
- **axe DevTools** (Chrome/Firefox): Accessibility auditing
- **Lighthouse** (Chrome DevTools): Performance and best practices
- **React DevTools**: Component state inspection
- **Redux DevTools**: State management debugging

**Manual Testing Commands:**

```bash
# Start dev server
npm run dev

# Test on local network (mobile devices)
npm run dev -- --host

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Part 2: Integration Guide

### Step 1: Backup Existing Files

```bash
# Navigate to pages directory
cd doflow-main/doflow-main/pages

# Create backups
cp LearningPage.tsx LearningPage.backup.tsx
cp CourseDetailsPage.tsx CourseDetailsPage.backup.tsx

echo "✅ Backups created"
```

### Step 2: Install Dependencies (if needed)

Check if these are already in `package.json`:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-redux": "^8.1.0",
    "@reduxjs/toolkit": "^1.9.5",
    "react-hot-toast": "^2.4.1",
    "react-icons": "^4.11.0",
    "@monaco-editor/react": "^4.5.1"
  }
}
```

If any are missing:

```bash
npm install react-icons react-hot-toast @monaco-editor/react
```

### Step 3: Copy Skeleton Component

```bash
# Create components directory if it doesn't exist
mkdir -p src/components

# Copy skeleton component
# (Already created at src/components/Skeleton.tsx)
```

### Step 4: Replace LearningPage

**Option A: Direct Replacement (Recommended for testing)**

```bash
# Rename refactored file to main file
mv pages/LearningPageRefactored.tsx pages/LearningPage.tsx
```

**Option B: Gradual Migration**

1. Import both versions in your router/App.tsx
2. Use feature flag to toggle:

```tsx
// App.tsx or router config
import LearningPageOld from './pages/LearningPage';
import LearningPageNew from './pages/LearningPageRefactored';

const USE_NEW_UI = true; // Toggle this

function AppRoutes() {
  const LearningComponent = USE_NEW_UI ? LearningPageNew : LearningPageOld;
  
  return (
    <Routes>
      <Route path="/course/:courseId/learn" element={<LearningComponent />} />
      {/* ... other routes */}
    </Routes>
  );
}
```

### Step 5: Replace CourseDetailsPage

**Option A: Direct Replacement**

```bash
mv pages/CourseDetailsPageRefactored.tsx pages/CourseDetailsPage.tsx
```

**Option B: Gradual Migration**

```tsx
// Same feature flag approach as above
import CourseDetailsOld from './pages/CourseDetailsPage';
import CourseDetailsNew from './pages/CourseDetailsPageRefactored';

const USE_NEW_DETAILS_UI = true;

const DetailsComponent = USE_NEW_DETAILS_UI ? CourseDetailsNew : CourseDetailsOld;
```

### Step 6: Update Imports (if needed)

If your file structure differs, update import paths:

```tsx
// In LearningPage.tsx and CourseDetailsPage.tsx
import { Skeleton, SidebarSkeleton, LessonContentSkeleton } from '../src/components/Skeleton';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import api from '../src/utils/api';

// Verify these paths match your project structure
```

### Step 7: Update Router Configuration

Ensure routes are configured correctly:

```tsx
// App.tsx or main router file
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LearningPage from './pages/LearningPage';
import CourseDetailsPage from './pages/CourseDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Course Details - public view */}
        <Route 
          path="/courses/:courseId" 
          element={<CourseDetailsPage />} 
        />
        
        {/* Learning Interface - enrolled users */}
        <Route 
          path="/courses/:courseId/learn" 
          element={<LearningPage courseId={/* get from route */} />} 
        />
        
        {/* ... other routes */}
      </Routes>
    </Router>
  );
}
```

### Step 8: Test Navigation Flow

Verify the complete user journey:

1. **Browse courses** → Courses listing page
2. **Click course card** → CourseDetailsPage (refactored)
3. **Click "Enroll" or "Start Learning"** → LearningPage (refactored)
4. **Select lessons** → Lesson content renders
5. **Complete lesson** → Progress updates
6. **Navigate modules** → Sidebar/drawer works

### Step 9: Configure Redux Store (if not already)

Ensure your Redux store has necessary slices:

```tsx
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import coursesReducer from './slices/coursesSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Step 10: Add Loading States

The refactored pages already include skeleton loaders, but verify API calls:

```tsx
// Verify these endpoints work:
// GET /api/courses/:courseId
// GET /api/progress/:courseId
// POST /api/progress/complete-lesson
// POST /api/courses/:courseId/enroll

// Test with curl:
curl http://localhost:5000/api/courses/<courseId>
```

### Step 11: Environment Variables

Ensure your `.env` file has necessary variables:

```bash
# .env
VITE_API_URL=http://localhost:5000/api
MONGODB_URI=mongodb+srv://...
```

### Step 12: Production Build Test

```bash
# Build for production
npm run build

# Preview build locally
npm run preview

# Check for errors in console
# Verify:
# - No console errors
# - Styles load correctly
# - API calls work
# - Dark mode toggle works
```

### Step 13: Deploy to Staging

```bash
# If using Vercel
vercel --prod

# If using Netlify
netlify deploy --prod

# If using manual deployment
npm run build
# Upload dist/ folder to server
```

### Step 14: Monitor Production

After deployment, monitor:

- [ ] **Error Tracking**: Sentry/LogRocket for runtime errors
- [ ] **Analytics**: Track page views, engagement
- [ ] **Performance**: Lighthouse scores, Core Web Vitals
- [ ] **User Feedback**: Support tickets, feedback forms

---

## Rollback Plan

If issues occur, quick rollback:

```bash
# Restore backups
cp LearningPage.backup.tsx LearningPage.tsx
cp CourseDetailsPage.backup.tsx CourseDetailsPage.tsx

# Rebuild
npm run build

# Redeploy
vercel --prod
```

---

## Common Integration Issues

### Issue 1: Import Errors

**Error**: `Cannot find module '../src/components/Skeleton'`

**Solution**: Verify file paths match your structure

```bash
# Check where Skeleton.tsx is located
find . -name "Skeleton.tsx"

# Update import path accordingly
```

### Issue 2: Redux State Undefined

**Error**: `Cannot read property 'user' of undefined`

**Solution**: Ensure Redux provider wraps app

```tsx
// main.tsx or index.tsx
import { Provider } from 'react-redux';
import { store } from './src/store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

### Issue 3: API Calls Failing

**Error**: `404 Not Found` on API endpoints

**Solution**: Verify backend is running and endpoints match

```bash
# Start backend
cd backend
npm run dev

# Verify endpoint
curl http://localhost:5000/api/courses
```

### Issue 4: Styles Not Applying

**Error**: Tailwind classes not working

**Solution**: Verify Tailwind config includes new files

```js
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}", // Add this line
    "./components/**/*.{js,ts,jsx,tsx}", // And this
  ],
  // ...
};
```

### Issue 5: Dark Mode Not Working

**Error**: Dark mode classes not applying

**Solution**: Verify dark mode strategy in Tailwind config

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
  // ...
};
```

And ensure toggle button updates class:

```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

---

## Performance Optimization

After integration, optimize:

### Code Splitting

```tsx
// Lazy load pages
import { lazy, Suspense } from 'react';

const LearningPage = lazy(() => import('./pages/LearningPage'));
const CourseDetailsPage = lazy(() => import('./pages/CourseDetailsPage'));

function App() {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <Routes>
        <Route path="/courses/:id/learn" element={<LearningPage />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

### Bundle Analysis

```bash
# Install analyzer
npm install -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ]
});

# Build and view bundle
npm run build
```

### Image Optimization

```tsx
// Use modern formats
<img 
  src="/images/course.webp" 
  alt="Course thumbnail"
  loading="lazy"
  width={800}
  height={450}
/>
```

---

## Success Metrics

Track these after deployment:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load Time | < 2s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Core Web Vitals |
| First Contentful Paint | < 1.5s | Lighthouse |
| Accessibility Score | > 95 | Lighthouse |
| Mobile Usability | 100% | Google Search Console |
| Bounce Rate | < 40% | Analytics |
| Session Duration | > 5 min | Analytics |

---

## Next Steps

After successful integration:

1. **User Testing**: Gather feedback from real users
2. **A/B Testing**: Compare old vs new UI metrics
3. **Iterate**: Based on feedback, refine UI
4. **Document**: Update internal wiki/docs
5. **Train**: Educate team on new UI patterns

---

**Last Updated**: January 31, 2026  
**Version**: 1.0
