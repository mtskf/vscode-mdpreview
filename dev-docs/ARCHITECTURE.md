# Architecture

## Overview
Antigravity Markdown Preview is a VS Code extension that provides a Custom Editor for Markdown files.

## Components

### Extension Host (`src/extension.ts`, `src/EditorProvider.ts`, `src/services/config-manager.ts`)
- **Role**: Manages the Webview lifecycle, file system operations, and VS Code integration.
- **Responsibilities**:
    - Registering the Custom Editor Provider.
    - Reading/Writing the document file.
    - Handling `paste-image` events (Saving images to disk).
    - **ConfigManager**: Resolving and validating Custom CSS configurations (Security checks).

### Webview (`src/webview/`)
- **Role**: Renders the Markdown content and handles UI interactions.
- **Tech Stack**: React, Vite, TailwindCSS.
- **Communication**:
    - Receives `update` messages with Markdown text.
    - Sends `update` messages when user types (debounced).
    - Sends `paste-image` messages with Base64 data.
    - Receives `insert-image` messages to insert text.

## Data Flow

1. **Opening a File**: Extension Host reads file -> Sends `ExtensionToWebviewMessage` (update) -> Webview renders.
2. **Editing**: Webview Monaco Editor changes -> Debounce -> Sends `WebviewToExtensionMessage` (update) -> Extension Host writes to Virtual Document.
3. **Pasting Image**:
    - Webview `paste` event -> Converts to Base64 -> Sends `WebviewToExtensionMessage` (paste-image).
    - Extension Host -> Validates -> Saves to `assets/` -> Sends `ExtensionToWebviewMessage` (insert-image) with Markdown link.
    - Webview -> Inserts Markdown link into Editor.
4. **Custom CSS**: `ConfigManager` resolves paths securely -> passed to Webview.
