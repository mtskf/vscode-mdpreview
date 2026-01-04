# TODO

## Priority
- 🚨: Critical / blocks release
- 🟡: Important / should fix soon
- 🟢: Nice to have / cleanup
- 🚫: Blocked

## Feature Backlog
- [x] 🟡 **HTML Export**: Export preview content as a self-contained HTML file.
  - *Needs manual verification*
- [ ] 🟡 Final end-to-end testing for all implemented features.
- [ ] 🟢 **PDF Export**: Export preview content as PDF (requires puppeteer or print API).
- [ ] 🟢 **Slide Mode**: Render markdown as presentation using `---` separators.
- [ ] 🟢 **Status Bar Stats**: Word count, reading time.
- [ ] 🟢 **Zen Mode**: Focus mode for distraction-free writing.
- [ ] 🚫 **Folding Sync (Editor ↔ Preview)**: Sync collapsed sections between editor and preview.
  - *Blocked*: VS Code API does not expose editor folding state.

---

## Completed

### Refactoring
- [x] 🟡 Prevent `customCss` relative paths like `../` from escaping the workspace.
- [x] **Extract duplicate Types**: Expand `shared-types.ts` usage.
- [x] **Configuration Management**: Extract `antigravity.customCss` into config service.
