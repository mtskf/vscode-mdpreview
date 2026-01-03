# Functional Specifications

## Core Features

### 1. Markdown Editor & Preview
- **Custom Editor**: Uses `.class` based extension activation for `.md` files.
- **Split View**: None. Uses "Same-Tab Toggle".
- **Toggle Mechanism**:
    - Button in top-right corner.
    - Keyboard shortcut (`Alt+M`).
    - Maintains scroll position between views.
- **Editor**: Monaco Editor with minimal configuration.
- **Preview**: React-based rendering using `react-markdown`.

### 2. Live Synchronization
- **Type-to-Preview**: Changes in Editor update the Preview (debounced).
- **Scroll Sync**: Scrolling in Editor syncs Preview position (and vice versa - future). *Current implementation: Editor -> Preview only.*

### 3. Extended Markdown Support
- **GFM**: GitHub Flavored Markdown (Tables, Task Lists, Strikethrough, Autolinks).
- **Common Features**:
    - Math (KaTeX)
    - Mermaid Diagrams
    - Emoji (`:smile:`)
    - Sub/Superscript
    - Frontmatter (rendered as table)
    - Callouts/Alerts (GitHub style `> [!NOTE]`)
    - Wiki Links (`[[Page]]`)

### 4. Smart Image Paste
- **Trigger**: `Ctrl+V` (or `Cmd+V`) in Editor.
- **Action**:
    - Detects image data on clipboard.
    - Saves image to `./assets/image-{timestamp}.png`.
    - Inserts `![Image](assets/image-{timestamp}.png)` at cursor.
- **Constraint**: Document must be saved (not `untitled:`) to determine save path.

### 5. Custom CSS
- **Configuration**: `antigravity.customCss` (Array of strings).
- **Scope**:
    - Workspace-relative paths.
    - Absolute paths *inside* the workspace.
- **Security**: Paths outside the workspace are rejected with a warning.
- **UX**: Warning if file not found.

### 6. UX Enhancements
- **TOC**: Sidebar with auto-generated Table of Contents.
- **Copy Code**: Button on code blocks to copy content.
- **Task Lists**: Interactive checkboxes in Preview mode (updates markdown source).
