---
question: "How do I test the VS Code extension locally?"
tags: [vscode, extension, development, testing]
updated: 2026-01-04
status: closed
---

## Context

Testing the Basel VS Code extension during development.

## Answer

1. Build the extension:
```bash
cd vscode-basel
npm install
npm run compile
```

2. Open VS Code in the extension directory:
```bash
code .
```

3. Press `F5` to launch Extension Development Host

4. In the new window, open a folder with a `.basel/` directory

5. Test:
   - `Cmd+Shift+K` to search
   - Status bar shows entry count
   - Command palette for `Basel: Initialize` and `Basel: Add Entry`

## Gotchas

- The extension uses CommonJS (`"module": "commonjs"`) unlike the main CLI which uses ESM
- Changes require recompiling and reloading the Extension Development Host
- The file watcher auto-refreshes the index when `.basel/*.md` files change
