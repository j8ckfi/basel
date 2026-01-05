# Basel VS Code Extension

Search your Basel Q&A knowledge index directly from VS Code.

## Features

- **Search** (`Cmd+Shift+K`): Quick pick to search and open entries
- **Status bar**: Shows entry count, click to search
- **Init**: Create `.basel/` directory in workspace
- **Add**: Create new entry from command palette
- **Auto-reload**: Index refreshes when files change

## Installation

```bash
cd vscode-basel
npm install
npm run compile
```

Then press F5 in VS Code to launch Extension Development Host.

## Usage

1. Open a workspace with a `.basel/` directory
2. Press `Cmd+Shift+K` to search
3. Select an entry to open it

## Commands

| Command | Keybinding |
|---------|------------|
| Basel: Search Knowledge Index | `Cmd+Shift+K` |
| Basel: Initialize Index | — |
| Basel: Add Entry | — |
