# Backlog

## Recently Implemented
- ✅ Copy Code Button
- ✅ Table of Contents (TOC)
- ✅ Interactive Task Lists
- ✅ Smart Image Paste
- ✅ Clipboard fallback
- ✅ CSP style-src fix
- ✅ Custom CSS Support
- ✅ Refactoring: ConfigManager, Types, Debounce, Security Checks (P2 completed)

## Features Deferred from Initial Release

### Export Capabilities
- ✅ **HTML Export**: Export the preview content as a self-contained HTML file.
- **PDF Export**: Export the preview content as a PDF.
    - *Implementation Note*: Likely requires `puppeteer` or utilizing VS Code's webview print capabilities.

### Presentation Mode
- **Slide Mode**: Render the Markdown document as a presentation.
    - *Syntax*: Use `---` as a slide separator.
    - *Implementation Note*: Consider libraries like `marp` or a simple custom swipe view.

### Other Ideas
- **Status Bar Stats**: Word count, reading time.
- **Zen Mode**: Focus mode for distraction-free writing.
