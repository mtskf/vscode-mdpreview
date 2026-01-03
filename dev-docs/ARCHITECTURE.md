# Architecture

## Overview
Antigravity Markdown Preview is a VS Code extension that provides a Custom Editor for Markdown files.

## Components

### Extension Host (`src/extension.ts`, `src/EditorProvider.ts`)
- **Role**: Manages the Webview lifecycle, file system operations, and VS Code integration.
- **Responsibilities**:
    - Registering the Custom Editor Provider.
    - Reading/Writing the document file.
    - Handling `paste-image` events (Saving images to disk).
    - Resolving Custom CSS configurations.
    - Path security checks.

### Webview (`src/webview/`)
- **Role**: Renders the Markdown content and handles UI interactions.
- **Tech Stack**: React, Vite, TailwindCSS.
- **Communication**:
    - Receives `update` messages with Markdown text.
    - Sends `update` messages when user types (debounced).
    - Sends `paste-image` messages with Base64 data.
    - Receives `insert-image` messages to insert text.

## Data Flow

1. **Opening a File**: Extension Host reads file -> Sends `update` message -> Webview renders.
2. **Editing**: Webview Monaco Editor changes -> Sends `update` message -> Extension Host writes to Virtual Document (VS Code handles saving to disk).
3. **Pasting Image**:
    - Webview `paste` event -> Converts to Base64 -> Sends `paste-image`.
    - Extension Host -> Validates -> Saves to `assets/` -> Sends `insert-image` with Markdown link.
    - Webview -> Inserts Markdown link into Editor.
