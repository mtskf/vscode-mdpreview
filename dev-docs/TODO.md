# TODO

## Priority
- P1: Critical / blocks release
- P2: Important / should fix soon
- P3: Nice to have / cleanup

### Refactoring Opportunities (Open)

#### P2 (Medium Priority)
- [ ] **Extract duplicate Types**: `EditorProvider.ts` and `Preview.tsx` both define or use types that could be shared. (Wait for `shared-types.ts` usage expansion)
- [ ] **Configuration Management**: Extract checking of `markdown-preview.customCss` into a clearer config service or helper.

#### Done (Archive)

- [x] **P3 Extract `urlTransform` logic**: Move the URL transformation logic from `Preview.tsx` to a separate utility file (`src/webview/lib/url-transform.ts`).
- [x] **P3 Extract Copy Button**: Move the copy button logic and UI from `Preview.tsx` to a separate component (`src/webview/components/CopyButton.tsx`).
- [x] **P3 Improve Types in `Preview.tsx`**: Replace `any` in AST visitors with strict types.
- [x] **P3 Robustness `FileReader`**: Add error handling for `FileReader` in `App.tsx`.
- [x] **P3 Performance Debounce**: Implement debounce for `postMessage` content updates in `App.tsx`.
- [x] **P3 Extract `resolveCustomCssUris`**: The logic for finding CSS files is complex. Extract to a helper function. (Done in `EditorProvider.ts`)
- [x] **P3 Clean up `Editor` component**: `useEffect` for cleanup is good. (Done)
- [x] **P3 Unified Message Types**: Create `src/shared-types.ts`. (Done)
- [x] **P3 Fix "Duplicate Types"**: Removed duplicates in `EditorProvider.ts`. (Done)
[x] Resolve custom CSS relative paths & security checks.
