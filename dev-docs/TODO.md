# TODO

## Priority
- P1: Critical / blocks release
- P2: Important / should fix soon
- P3: Nice to have / cleanup

## Known Issues (Open)

- [ ] P1 Debounced `update` can post an empty document before the first extension `update`, risking data loss.
- [ ] P3 Debounced `update` posts after remote `update` messages, causing redundant IPC traffic.

## Refactoring Opportunities (Open)

#### P2 (Medium Priority)
- [ ] **Extract duplicate Types**: Expand `shared-types.ts` usage to cover remaining cross-boundary types.
- [ ] **Configuration Management**: Extract checking of `antigravity.customCss` into a clearer config service or helper.
