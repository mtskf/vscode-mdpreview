# Lessons Learned

## Security

### Path Traversal Prevention
When handling file paths based on user input or configuration (like Custom CSS), `startsWith` is insufficient for checking if a path is inside a workspace.
- **Bad**: `absolutePath.startsWith(workspacePath)` (Can match `/workspace-backup` against `/workspace`)
- **Good**: `const rel = path.relative(workspace, absolute); return !rel.startsWith('..') && !path.isAbsolute(rel);`

## VS Code Extension API

### Webview Local Resources
To load local resources (images, CSS) in a Webview:
1. They must be included in `localResourceRoots` in `webview.options`.
2. This list is strict. If you add a custom CSS path, its *directory* (or the file itself) must be explicitly added to `localResourceRoots`.
3. Use `webview.asWebviewUri(uri)` to convert the local URI to a `vscode-resource:` (or checks) URI.

### Clipboard API in Webviews
`navigator.clipboard.writeText` may fail in VS Code Webviews depending on context or focus.
- **Fallback**: Always provide a fallback using `document.execCommand('copy')` with a hidden textarea.

## Testing

### Mocking VS Code API
VS Code API (`vscode`) is not available in unit tests running in Node/Vitest. It must be mocked carefully.
- Integration tests involving FS or real VS Code commands are best done via VS Code Extension Tests (Mocha), not Unit Tests (Vitest).
