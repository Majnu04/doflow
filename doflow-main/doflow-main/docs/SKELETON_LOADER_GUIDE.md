# Skeleton Loader Implementation Guide

## Overview

Professional skeleton loader system for DoFlow LMS with shimmer animation, variant support, and dark mode compatibility.

---

## Component Location

```
src/components/Skeleton.tsx
```

---

## Basic Usage

### Simple Skeleton

```tsx
import { Skeleton } from '../src/components/Skeleton';

// Text skeleton
<Skeleton variant="text" />

// Custom width
<Skeleton variant="text" width="60%" />

// Multiple lines
<Skeleton variant="text" lines={3} />
```

### Skeleton Variants

```tsx
// Title (32px height)
<Skeleton variant="title" />

// Subtitle (24px height)
<Skeleton variant="subtitle" />

// Avatar (40x40px circle)
<Skeleton variant="avatar" />

// Card (200px height)
<Skeleton variant="card" height={300} />

// Button (120x40px)
<Skeleton variant="button" />

// Badge (60x24px)
<Skeleton variant="badge" />

// List item (56px height)
<Skeleton variant="list-item" />
```

---

## Composed Components

Pre-built skeleton patterns for common UI sections:

### ModuleSkeleton

Sidebar module card with header, progress bar, and lesson list.

```tsx
import { ModuleSkeleton } from '../src/components/Skeleton';

<ModuleSkeleton />
```

### LessonCardSkeleton

Course overview lesson card with title, description, and metadata.

```tsx
import { LessonCardSkeleton } from '../src/components/Skeleton';

<LessonCardSkeleton />
```

### CourseHeaderSkeleton

Hero section with breadcrumb, title, description, and stats.

```tsx
import { CourseHeaderSkeleton } from '../src/components/Skeleton';

<CourseHeaderSkeleton />
```

### ProgressBarSkeleton

Progress indicator with label and percentage.

```tsx
import { ProgressBarSkeleton } from '../src/components/Skeleton';

<ProgressBarSkeleton />
```

### SidebarSkeleton

Complete sidebar loading state with title, progress, and modules.

```tsx
import { SidebarSkeleton } from '../src/components/Skeleton';

<SidebarSkeleton />
```

### LessonContentSkeleton

Main content area with video placeholder, header, and sections.

```tsx
import { LessonContentSkeleton } from '../src/components/Skeleton';

<LessonContentSkeleton />
```

---

## Advanced Features

### Custom Border Radius

```tsx
<Skeleton variant="card" rounded="lg" />
<Skeleton variant="avatar" rounded="full" />
<Skeleton variant="text" rounded="none" />
```

Options: `'sm' | 'md' | 'lg' | 'full' | 'none'`

### Animation Speed

```tsx
<Skeleton variant="text" speed="slow" />
<Skeleton variant="text" speed="normal" /> // default
<Skeleton variant="text" speed="fast" />
```

### Minimum Loading Time Hook

Prevents skeleton flash for fast loads:

```tsx
import { useMinimumLoadingTime } from '../src/components/Skeleton';

const showSkeleton = useMinimumLoadingTime(isLoading, 500);

return showSkeleton ? <SidebarSkeleton /> : <ActualContent />;
```

---

## Implementation in LearningPage

### Step 1: Import Components

```tsx
import { 
  SidebarSkeleton, 
  LessonContentSkeleton,
  useMinimumLoadingTime 
} from '../src/components/Skeleton';
```

### Step 2: Add Loading State

```tsx
const [isLoading, setIsLoading] = useState(true);
const showSkeleton = useMinimumLoadingTime(isLoading, 500);
```

### Step 3: Conditional Rendering

```tsx
// Sidebar
{showSkeleton ? (
  <SidebarSkeleton />
) : (
  <div className="space-y-6">
    {/* Actual sidebar content */}
  </div>
)}

// Main content
{showSkeleton ? (
  <LessonContentSkeleton />
) : (
  <div className="space-y-6">
    {/* Actual lesson content */}
  </div>
)}
```

### Step 4: Fetch Data

```tsx
useEffect(() => {
  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data);
    } catch (error) {
      toast.error('Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchCourse();
}, [courseId]);
```

---

## Design Specifications

### Colors

| Mode | From | Via | To |
|------|------|-----|-----|
| Light | gray-200 | gray-100 | gray-200 |
| Dark | gray-700 | gray-600 | gray-700 |

### Animation

- **Duration**: 1.5s (normal), 2s (slow), 1s (fast)
- **Timing**: `ease-in-out`
- **Respects**: `prefers-reduced-motion`

### Accessibility

- `role="status"` for screen readers
- `aria-label="Loading content"`
- `.sr-only` text: "Loading..."

---

## Best Practices

### ✅ DO

- Match skeleton dimensions to actual content
- Use composed components for complex sections
- Add minimum loading time (500ms) to prevent flashing
- Test both light and dark modes
- Vary skeleton widths for realism (70%, 85%, 90%)

### ❌ DON'T

- Show skeleton for less than 300ms (causes flash)
- Create layout shift between skeleton and content
- Over-animate (keep shimmer subtle)
- Forget dark mode styles
- Use solid colors (always use gradient)

---

## Mobile Considerations

### Touch Targets

```tsx
// Larger skeleton for mobile touch areas
<Skeleton 
  variant="button" 
  height={48} // Instead of 40px
  className="lg:h-10" // Restore desktop size
/>
```

### Responsive Variants

```tsx
// Stack on mobile, grid on desktop
<div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6">
  {[1, 2, 3, 4].map(i => (
    <LessonCardSkeleton key={i} />
  ))}
</div>
```

---

## Performance Optimization

### Lazy Loading

```tsx
// Only show skeletons above fold
const [showAllSkeletons, setShowAllSkeletons] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setShowAllSkeletons(true), 100);
  return () => clearTimeout(timer);
}, []);

return (
  <>
    <ModuleSkeleton />
    {showAllSkeletons && (
      <>
        <ModuleSkeleton />
        <ModuleSkeleton />
      </>
    )}
  </>
);
```

### Memoization

```tsx
const SkeletonList = React.memo(() => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <ModuleSkeleton key={i} />
    ))}
  </div>
));
```

---

## Testing Checklist

- [ ] Skeleton matches final layout dimensions
- [ ] No layout shift when content loads
- [ ] Shimmer animation works smoothly
- [ ] Dark mode colors are appropriate
- [ ] Reduced motion preference respected
- [ ] Screen reader announces loading state
- [ ] Minimum loading time prevents flash
- [ ] Mobile touch areas are adequate
- [ ] Fast network: skeleton visible briefly
- [ ] Slow network: skeleton doesn't feel stuck

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Gradient | ✅ | ✅ | ✅ | ✅ |
| Animation | ✅ | ✅ | ✅ | ✅ |
| Dark Mode | ✅ | ✅ | ✅ | ✅ |
| Reduced Motion | ✅ | ✅ | ✅ | ✅ |

---

## Examples

### Loading Sidebar Only

```tsx
{isLoadingSidebar ? (
  <SidebarSkeleton />
) : (
  <Sidebar modules={course.sections} />
)}
```

### Loading Content Only

```tsx
{isLoadingLesson ? (
  <LessonContentSkeleton />
) : (
  <LessonContent lesson={currentLesson} />
)}
```

### Loading Everything

```tsx
{isLoading ? (
  <div className="flex h-screen">
    {/* Sidebar skeleton */}
    <aside className="hidden lg:block w-80 border-r">
      <SidebarSkeleton />
    </aside>
    
    {/* Content skeleton */}
    <main className="flex-1">
      <LessonContentSkeleton />
    </main>
  </div>
) : (
  <ActualLearningPage />
)}
```

---

## Custom Skeleton Composition

Create your own skeleton patterns:

```tsx
export const CustomCardSkeleton = () => (
  <div className="bg-white rounded-lg p-6 space-y-4">
    <Skeleton variant="title" width="70%" />
    <Skeleton variant="text" lines={2} />
    <div className="flex gap-3 pt-4">
      <Skeleton variant="avatar" width="32px" height="32px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  </div>
);
```

---

## Troubleshooting

### Issue: Skeleton flashing too quickly

**Solution**: Use `useMinimumLoadingTime` hook with 500ms minimum

### Issue: Layout shift when content loads

**Solution**: Match skeleton dimensions exactly to final content

### Issue: Animation not smooth

**Solution**: Use GPU-accelerated properties, avoid width/height animations

### Issue: Dark mode colors wrong

**Solution**: Test with `dark:` prefix classes, verify gradient colors

---

## Related Documentation

- [LearningPage Refactor Guide](./LEARNING_UI_REFACTOR_GUIDE.md)
- [Course Details Refactor](./COURSE_DETAILS_UI_REFACTOR.md)
- [Design System](./DESIGN_SYSTEM.md)

---

**Last Updated**: January 31, 2026  
**Version**: 1.0
