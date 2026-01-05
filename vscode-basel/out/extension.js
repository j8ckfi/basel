"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const fuse_js_1 = __importDefault(require("fuse.js"));
const gray_matter_1 = __importDefault(require("gray-matter"));
let entries = [];
let searchIndex = null;
let statusBarItem;
async function activate(context) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
        await loadIndex(workspaceFolder.uri.fsPath);
    }
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'basel.search';
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(vscode.commands.registerCommand('basel.search', handleSearch), vscode.commands.registerCommand('basel.init', handleInit), vscode.commands.registerCommand('basel.add', handleAdd), statusBarItem);
    const watcher = vscode.workspace.createFileSystemWatcher('**/.basel/**/*.md');
    watcher.onDidChange(() => reloadIndex());
    watcher.onDidCreate(() => reloadIndex());
    watcher.onDidDelete(() => reloadIndex());
    context.subscriptions.push(watcher);
}
async function loadIndex(workspacePath) {
    const baselDir = path.join(workspacePath, '.basel');
    try {
        await fs.access(baselDir);
        const entryPaths = await findEntries(baselDir);
        entries = await Promise.all(entryPaths.map(p => parseEntry(p)));
        searchIndex = new fuse_js_1.default(entries, {
            keys: [
                { name: 'question', weight: 2 },
                { name: 'content', weight: 1 },
                { name: 'tags', weight: 1.5 },
            ],
            threshold: 0.4,
            includeScore: true,
        });
    }
    catch {
        entries = [];
        searchIndex = null;
    }
    updateStatusBar();
}
async function reloadIndex() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
        await loadIndex(workspaceFolder.uri.fsPath);
    }
}
function updateStatusBar() {
    if (entries.length > 0) {
        statusBarItem.text = `$(book) Basel: ${entries.length}`;
        statusBarItem.tooltip = `${entries.length} Q&A entries indexed`;
    }
    else {
        statusBarItem.text = '$(book) Basel';
        statusBarItem.tooltip = 'No index found. Click to search or run Basel: Initialize';
    }
}
async function findEntries(dir) {
    const results = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && !item.name.startsWith('.')) {
            results.push(...await findEntries(fullPath));
        }
        else if (item.isFile() && item.name.endsWith('.md') && !item.name.startsWith('_')) {
            results.push(fullPath);
        }
    }
    return results;
}
async function parseEntry(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data, content: body } = (0, gray_matter_1.default)(content);
    const basename = path.basename(filePath, '.md');
    const dir = path.basename(path.dirname(filePath));
    const id = dir === '.basel' ? basename : `${dir}-${basename}`;
    return {
        id,
        path: filePath,
        question: data.question || basename,
        tags: data.tags || [],
        content: body.trim(),
    };
}
async function handleSearch() {
    if (!searchIndex || entries.length === 0) {
        const action = await vscode.window.showWarningMessage('No Basel index found in this workspace.', 'Initialize Index');
        if (action === 'Initialize Index') {
            await handleInit();
        }
        return;
    }
    const query = await vscode.window.showInputBox({
        prompt: 'Search Basel knowledge index',
        placeHolder: 'Enter search query...',
    });
    if (!query)
        return;
    const results = searchIndex.search(query).slice(0, 10);
    if (results.length === 0) {
        vscode.window.showInformationMessage('No matching entries found.');
        return;
    }
    const items = results.map(r => ({
        label: r.item.question,
        description: r.item.tags.join(', '),
        detail: r.item.content.slice(0, 100).replace(/\n/g, ' ') + '...',
        entry: r.item,
    }));
    const selected = await vscode.window.showQuickPick(items, {
        matchOnDescription: true,
        matchOnDetail: true,
    });
    if (selected) {
        const doc = await vscode.workspace.openTextDocument(selected.entry.path);
        await vscode.window.showTextDocument(doc);
    }
}
async function handleInit() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open.');
        return;
    }
    const baselDir = path.join(workspaceFolder.uri.fsPath, '.basel');
    const projectDir = path.join(baselDir, 'project');
    try {
        await fs.mkdir(projectDir, { recursive: true });
        await fs.writeFile(path.join(baselDir, 'manifest.json'), JSON.stringify({ version: '1.0', entries: [] }, null, 2));
        await fs.writeFile(path.join(projectDir, '_example.md'), `---
question: "Example: How do I use this feature?"
tags: [example]
status: closed
---

## Context

Describe when this question applies...

## Answer

Provide the solution here.

## Gotchas

- List any caveats
`);
        vscode.window.showInformationMessage('Basel index initialized.');
        await reloadIndex();
    }
    catch (e) {
        vscode.window.showErrorMessage(`Failed to initialize: ${e}`);
    }
}
async function handleAdd() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open.');
        return;
    }
    const question = await vscode.window.showInputBox({
        prompt: 'Enter the question',
        placeHolder: 'How do I configure X?',
    });
    if (!question)
        return;
    const slug = question
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);
    const today = new Date().toISOString().split('T')[0];
    const content = `---
question: "${question}"
tags: []
updated: ${today}
status: closed
---

## Context

[Describe when this question applies]

## Answer

[Provide the solution]

## Gotchas

- [List any caveats]
`;
    const filePath = path.join(workspaceFolder.uri.fsPath, '.basel', 'project', `${slug}.md`);
    try {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc);
    }
    catch (e) {
        vscode.window.showErrorMessage(`Failed to create entry: ${e}`);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map