# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Smart Image Paste**: Support pasting images directly from clipboard into the editor. Images are automatically saved to an `assets/` directory.
- **Custom CSS Support**: Allow users to apply custom CSS files via `antigravity.customCss` setting.
- **UX Enhancements**:
    - Copy Code button with clipboard fallback.
    - TOC (Table of Contents) sidebar.
    - Interactive Task Lists.
- **Security Check**: Restricted custom CSS paths to workspace directories only.

### Changed
- **Refactoring**:
    - Extracted `urlTransform` logic and `CopyButton` component for better maintainability and testing.
    - Improved type safety with shared types and strict AST visitor types.
    - Optimized performance with content debounce in Webview (300ms).
    - Enhanced robustness with error handling for image pasting.
