# VUDO Mobile Analysis Report

## Executive Summary

**Root Cause:** The Three.js WebGL Canvas in `MyceliumBackground.tsx` can fail silently on mobile browsers, blocking the entire React app from rendering. The current mobile detection only reduces node count but still attempts WebGL rendering.

## Comparison of Sites

| Feature | univrs.io (Works) | learn.univrs.io (Works) | vudo.univrs.io (Broken) |
|---------|-------------------|-------------------------|-------------------------|
| Background | 2D Canvas | None (static) | Three.js WebGL |
| Viewport Meta | Yes | Yes | Yes |
| Theme Toggle | Yes | Yes | Yes (already implemented) |
| Mobile Fallback | N/A (2D works) | N/A | **Missing** |
| Error Boundary | N/A | N/A | **Missing** |

## Issue Analysis

### 1. MyceliumBackground.tsx - WebGL on Mobile

**Current code (problematic):**
```tsx
const isMobile = useMemo(() => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;  // Only checks width, not device
}, []);

// Still renders Canvas on mobile, just with fewer nodes
return (
  <Canvas camera={{ position: [0, 0, 12], fov: 60 }} gl={{ antialias: !isMobile }}>
    ...
  </Canvas>
);
```

**Problems:**
1. Mobile WebGL context can fail silently
2. No fallback when WebGL fails
3. `window.innerWidth < 768` doesn't detect mobile devices reliably
4. No error boundary to catch Three.js errors

### 2. Theme Toggle - Already Implemented

The theme toggle is **already fully implemented**:
- `src/contexts/ThemeContext.tsx` - Context with localStorage persistence
- `src/components/ThemeToggle.tsx` - Toggle button with icons
- `src/index.css` - CSS variables for light/dark themes
- `tailwind.config.ts` - Missing `darkMode: 'class'` setting

### 3. Missing Tailwind darkMode Config

```ts
// tailwind.config.ts - needs this addition:
export default {
  darkMode: 'class',  // MISSING
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  ...
}
```

## Recommended Fixes

### Fix 1: Add Static Fallback for Mobile/WebGL Failure

Create `src/components/StaticBackground.tsx`:
- CSS gradient matching the color scheme
- Optional subtle CSS animation
- Zero JavaScript overhead

### Fix 2: Add Mobile Detection + WebGL Support Check

```tsx
const shouldUseWebGL = useMemo(() => {
  if (typeof window === 'undefined') return false;
  
  // Check for mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check WebGL support
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const hasWebGL = !!gl;
  
  return hasWebGL && !isMobile && !prefersReducedMotion;
}, []);
```

### Fix 3: Add Error Boundary

Wrap Canvas in error boundary to catch runtime WebGL errors and show fallback.

### Fix 4: Add darkMode to Tailwind Config

```ts
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  ...
}
```

## Files to Modify

1. `src/components/MyceliumBackground.tsx` - Add mobile detection + fallback
2. `src/components/StaticBackground.tsx` - Create new (CSS-only fallback)
3. `tailwind.config.ts` - Add `darkMode: 'class'`

## Files Already Complete (No Changes Needed)

- `index.html` - Viewport meta tag present
- `src/contexts/ThemeContext.tsx` - Theme context complete
- `src/components/ThemeToggle.tsx` - Toggle component complete
- `src/index.css` - CSS variables complete
- `src/App.tsx` - ThemeProvider already wrapping app

## Test Plan

1. Run `npm run build` - verify no errors
2. Run `npm run preview` - test in Chrome DevTools mobile mode
3. Verify theme toggle works in both themes
4. Verify mobile shows static background (no WebGL errors)
