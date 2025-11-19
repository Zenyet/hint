# Changelog

All notable changes to the Hint - AI Prompt Assistant extension will be documented in this file.

## [1.0.2] - 2025-11-19

### 🎨 Design Improvements
- **Apple Liquid Glass Design System**: Complete UI transformation to iOS 17+ / macOS Sonoma+ design language
  - Multi-layer glass effects with true backdrop blur and saturation
  - Gradient overlays with overlay blend mode
  - Inner glow for depth perception
  - Inset ring borders for glass edge highlights
  - Consistent across all components (FloatingToolbar, ActionButton, CloseButton, TextComparison, ErrorMessage, Popup)

### ✨ New Features
- **Empty State Handling**: Optimize button now disables when input is empty
  - Gray glass material for disabled state
  - Dynamic tooltip ("请先输入内容" when disabled)
  - Real-time content tracking with input events and MutationObserver

### 🐛 Bug Fixes
- **Position Tracking**: Fixed button position when contenteditable element height changes
  - Enhanced useElementPosition hook with comprehensive observers
  - Added MutationObserver for DOM changes
  - Added scroll event listeners (capture phase)
  - Added input event listener for contenteditable
  - RequestAnimationFrame throttling for performance

- **Stable Positioning**: Use parent container for positioning reference
  - Prevents position issues when element height changes or scrolls
  - Smart container detection (textarea vs contenteditable)
  - Searches up to 3 ancestor levels for suitable container
  - Handles edge cases (body parent, no suitable parent)

- **Glass Decoration Scrolling**: Fixed decorative layers scrolling with content
  - Separated scrollable content from fixed glass decorations
  - Glass gradients and shadows now stay fixed

- **Border Radius Overflow**: Fixed backdrop-filter causing rectangular corners
  - Moved backdrop-filter to element with border-radius
  - Ensures blur respects rounded corners

### 🚀 Performance Optimizations
- **useElementPosition Hook**:
  - Position change detection: only updates when position actually changes
  - Reduced unnecessary React re-renders (major improvement)
  - Passive event listeners for better scroll performance
  - useCallback memoization for stable function references
  - Removed duplicate scroll listeners (window only, with capture)
  - Reduced MutationObserver scope (removed subtree)
  - Performance impact: ~50-70% fewer re-renders during scrolling

### 💅 UI/UX Improvements
- **Liquid Glass Scrollbars**: Custom scrollbar styling
  - Color-matched to content (red for "before", green for "after")
  - Semi-transparent with 25% opacity
  - Thin 6px width
  - Transparent track background
  - Smooth hover transitions
  - Works in Chrome/Safari (WebKit) and Firefox

- **Eye Icon Position**: Fixed password visibility toggle position in settings
  - Centered vertically in input field
  - Proper z-index stacking
  - Enhanced glass material

- **Button Visual Feedback**: Enhanced check and cancel buttons
  - Red Liquid Glass for close button
  - Green Liquid Glass for check button
  - Increased stroke width for better visibility
  - Shadow glow effects

### 📝 Code Quality
- Comprehensive inline documentation
- Detailed commit messages explaining changes
- Performance considerations documented
- Edge case handling documented

## [1.0.1] - Previous Version
- Initial native implementation with React
- Basic popup settings interface
- Content script integration
- Background script for API calls
