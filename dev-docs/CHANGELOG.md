# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **HTML Export**: Export preview content as self-contained HTML file via command palette.
- **Smart Image Paste**: Support pasting images directly from clipboard into the editor. Images are automatically saved to an `assets/` directory.
- **Custom CSS Support**: Allow users to apply custom CSS files via `antigravity.customCss` setting.
- **UX Enhancements**:
    - Copy Code button with clipboard fallback.
    - TOC (Table of Contents) sidebar.
    - Interactive Task Lists.
- **Security Check**: Restricted custom CSS paths to workspace directories only.

### Changed
- **Refactoring (P2/M)**:
    - **Configuration Management**: Extracted custom CSS logic into `ConfigManager` service.
    - **Strict Types**: Split `WebviewMessage` into `WebviewToExtensionMessage` and `ExtensionToWebviewMessage` for type-safe communication.
    - **Security**: Strengthened `customCss` path validation to prevent workspace traversal (`../`).
    - **Debounce**: Implemented `useDebounce` hook for checking differences to reduce redundant updates.
    - Extracted `urlTransform` logic and `CopyButton` component.
    - STRICT AST visitor types for `Preview.tsx`.
    - Added `FileReader` error handling.
