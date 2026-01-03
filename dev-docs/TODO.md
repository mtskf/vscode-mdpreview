# TODO

## Commits to review

- [ ] `9709b21` feat: Add Custom CSS Support
- [ ] `2f228ca` feat: Add Custom CSS Support
- [ ] `4fd7e2b` fix: Improve Custom CSS robustness
- [ ] `173c2d7` security: Restrict Custom CSS to workspace paths


## Known Issues

- [x] Add clipboard write fallback when `navigator.clipboard` is unavailable or denied.
- [x] Review CSP `style-src` for webview to avoid breaking styles that require inline CSS.
- [x] Add `localResourceRoots` entries for custom CSS absolute paths so webview can load them.
- [x] Resolve custom CSS relative paths per workspace folder (use `getWorkspaceFolder(document.uri)`).
- [x] Scope `getConfiguration('antigravity')` to the document URI in multi-root workspaces.
- [x] Warn or skip custom CSS paths that do not exist to avoid silent failures.
- [ ] Clean up Monaco paste listener on unmount to avoid handler leaks if the editor remounts.
- [ ] Guard `editor.getSelection()` in `insertAtCursor` in case the selection is null.


## Refactoring Opportunities

- [ ] Centralize webview message types (union + type guards) to avoid stringly-typed messages across App/EditorProvider.
- [ ] Extract `resolveCustomCssUris` path validation into a small helper for clarity and unit testing.
