# Antigravity Markdown Preview

A VS Code extension that provides a feature-rich Markdown preview with same-tab toggle functionality.

## Features

- **Same-Tab Toggle**: Switch between edit and preview modes within the same tab using a UI toggle or keyboard shortcut (`Alt+M`)
- **Dark Mode**: Preview is styled for dark mode by default
- **Copy Code Button**: One-click code block copying with clipboard fallback
- **Table of Contents (TOC)**: Auto-generated sidebar navigation from headings
- **Interactive Task Lists**: Click to toggle checkboxes directly in preview
- **Smart Image Paste**: Paste images from clipboard, auto-saved to `assets/` folder
- **Extended Markdown Support**:
  - GFM (GitHub Flavored Markdown): tables, strikethrough, task lists, autolinks
  - Math equations (KaTeX)
  - Mermaid diagrams
  - Obsidian-style wiki links (`[[link]]`)
  - Callouts/Alerts (`> [!NOTE]`, `> [!TIP]`, etc.)
  - Emoji shortcodes (`:smile:`)
  - Superscript (`^text^`) and Subscript (`~text~`)
  - Frontmatter parsing
- **Local Image Support**: Relative image paths are resolved correctly

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd mdpreview

# Install dependencies
npm install

# Build
npm run compile
npm run build:webview
```

## Development

```bash
# Watch mode for extension
npm run watch

# Build webview
npm run build:webview

# Run unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch
```

## Usage

1. Open any `.md` file in VS Code
2. The file will open with the Antigravity Markdown editor
3. Use the toggle switch in the top-right corner or press `Alt+M` to switch between Edit and Preview modes

## Project Structure

```
mdpreview/
├── src/
│   ├── extension.ts          # VS Code extension entry point
│   ├── EditorProvider.ts     # Custom editor provider
│   └── webview/              # React application for the webview
│       ├── App.tsx           # Main React component
│       ├── components/
│       │   ├── Editor.tsx    # Monaco Editor wrapper
│       │   └── Preview.tsx   # Markdown preview component
│       └── __tests__/        # Unit tests
├── dist/                     # Compiled extension output
├── dev-docs/                 # Development documentation
│   └── BACKLOG.md           # Deferred features
└── package.json
```

## Roadmap

See [dev-docs/BACKLOG.md](dev-docs/BACKLOG.md) for planned features including:
- PDF/HTML Export
- Presentation Mode (Slides)

## Tech Stack

- **Extension**: TypeScript, esbuild
- **Webview**: React, Vite, TailwindCSS, shadcn/ui
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Markdown**: react-markdown with remark/rehype plugins
- **Testing**: Vitest, Testing Library

## License

MIT
