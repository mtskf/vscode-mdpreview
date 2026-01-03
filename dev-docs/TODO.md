# TODO

## Priority

- P1: Critical / blocks release
- P2: Important / should fix soon
- P3: Nice to have / cleanup

## Review Queue

- [ ] P1 `173c2d7` security: Restrict Custom CSS to workspace paths
- [ ] P1 `4fd7e2b` fix: Improve Custom CSS robustness
- [ ] P2 `9709b21` feat: Add Custom CSS Support
- [ ] P3 `2f228ca` feat: Add Custom CSS Support

## Known Issues (Open)

- [x] P2 Clean up Monaco paste listener on unmount to avoid handler leaks if the editor remounts.
- [x] P3 Guard `editor.getSelection()` in `insertAtCursor` in case the selection is null.

## Refactoring Opportunities (Open)

- [ ] P3 Centralize webview message types (union + type guards) to avoid stringly-typed messages across App/EditorProvider.
- [ ] P3 Extract `resolveCustomCssUris` path validation into a small helper for clarity and unit testing.

## Done (Archive)

- [x] Add clipboard write fallback when `navigator.clipboard` is unavailable or denied.
- [x] Review CSP `style-src` for webview to avoid breaking styles that require inline CSS.
- [x] Add `localResourceRoots` entries for custom CSS absolute paths so webview can load them.
- [x] Resolve custom CSS relative paths per workspace folder (use `getWorkspaceFolder(document.uri)`).
- [x] Scope `getConfiguration('antigravity')` to the document URI in multi-root workspaces.
- [x] Warn or skip custom CSS paths that do not exist to avoid silent failures.
