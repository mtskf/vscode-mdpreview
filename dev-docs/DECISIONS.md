# Architectural Decision Records (ADR)

## ADR-001: Webview-Based Custom Editor
- **Date**: 2023-12-XX
- **Decision**: Use VS Code's `CustomTextEditorProvider` instead of a standard Text Editor with a side-panel Webview.
- **Reasoning**: Allows complete control over the editing experience and enables "Same-Tab Toggle" which was a core requirement to avoid window management clutter.

## ADR-002: React & Vite for Webview
- **Date**: 2023-12-XX
- **Decision**: Build the Webview UI using React and bundle with Vite.
- **Reasoning**: Complex UI requirements (TOC, Interactive Preview, Monaco wrapping) benefit from React's component model. Vite provides fast HMR during development and optimized builds.

## ADR-003: Monaco Editor in Webview
- **Date**: 2023-12-XX
- **Decision**: Embed `monaco-editor` inside the Webview instead of using VS Code's native text buffer for editing.
- **Reasoning**: Required for "Same-Tab Toggle". We swap the DOM visibility between Monaco and the Preview renderer. Native VS Code editor cannot be easily hidden/shown within the same custom editor tab in this manner.

## ADR-004: Image Paste Handling
- **Date**: 2024-01-XX
- **Decision**: Intercept paste in Webview -> Send Base64 to Extension Host -> Save to Disk -> Insert Markdown.
- **Reasoning**:
    - Webview cannot write to disk directly (sandbox).
    - VS Code's native paste handlers don't work easily inside the Webview's Monaco instance without proper configuration.
    - Storing images in `./assets` keeps the project clean.

## ADR-005: Custom CSS Security
- **Date**: 2024-01-XX
- **Decision**: Strict workspace containment for Custom CSS paths.
- **Reasoning**: Allowing arbitrary absolute paths poses a security risk (loading malicious local files or unauthorized file access). Using `path.relative` ensures strict containment within the workspace root.
