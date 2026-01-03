# TODO

## Priority

- P1: Critical / blocks release
- P2: Important / should fix soon
- P3: Nice to have / cleanup

## Known Issues (Open)

- [ ] P3 Add `FileReader.onerror` handling for paste-image to surface failures.
- [ ] P3 Avoid filename collisions when pasting multiple images quickly (timestamp-only name).
- [ ] P3 Throttle or de-duplicate missing custom CSS warnings to reduce noise.

## Refactoring Opportunities (Open)

- [ ] P3 Add an exhaustive `switch` helper for `WebviewMessage` handling (assertNever).

## Done (Archive)

- [x] P2 Clean up Monaco paste listener on unmount to avoid handler leaks if the editor remounts.
- [x] P3 Guard `editor.getSelection()` in `insertAtCursor` in case the selection is null.
- [x] P3 Centralize webview message types (union + type guards) to avoid stringly-typed messages across App/EditorProvider.
- [x] P3 Extract `resolveCustomCssUris` path validation into a small helper for clarity and unit testing.
