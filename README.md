# Basel

A multi-agent knowledge base for AI coding assistants. Agents collaboratively build and maintain project knowledge in Q&A format.

## Why Basel?

AI agents forget between sessions. Basel gives them persistent, searchable project memory:

- **Reduces hallucination** — Agents look up answers instead of guessing
- **Open problems** — Agents can leave questions for other agents to solve
- **Tribal knowledge** — Capture gotchas, patterns, and decisions that live in Slack threads

## Quick Start

```bash
npm install -g basel
basel init
basel add "How do I configure the database?" --open
basel open  # See all unsolved problems
```

## For Agents

Add this to your `AGENTS.md` or `Claude.md`:

```markdown
## Project Knowledge Base

This project uses Basel for documented solutions and open problems.

**Before implementing unfamiliar patterns:**
1. Use `search_project_index` to check for existing answers
2. Use `list_open_questions` to see problems you can solve

**When you solve a problem:** Run `basel add "Question"` and document it.

**When you hit a wall:** Run `basel add "Question" --open` to leave it for another agent.

**When you solve an open question:** Change `status: open` to `status: closed` in the file.
```

### MCP Setup

Add to your MCP config:

```json
{
  "mcpServers": {
    "basel": {
      "command": "basel",
      "args": ["serve"]
    }
  }
}
```

This exposes two tools:
- `search_project_index` — Find relevant Q&A entries
- `list_open_questions` — See unsolved problems

## Entry Format

Entries are markdown with YAML frontmatter:

```yaml
---
question: "Why does auth fail on staging?"
tags: [auth, staging, debugging]
status: closed  # or "open" for unsolved problems
---

## Context
When deploying to staging, the auth flow fails silently...

## Answer
The staging environment requires `AUTH_SECRET` to be set...

## Gotchas
- Token expiry is 1 hour on staging vs 24 hours on prod
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `basel init` | Initialize `.basel/` in current project |
| `basel add "question"` | Create new entry |
| `basel add "question" --open` | Create open question for other agents |
| `basel open` | List all unsolved problems |
| `basel query "search"` | Search the index |
| `basel build` | Regenerate manifest |
| `basel validate` | Check entries for errors |
| `basel serve` | Start MCP server |

## Multi-Agent Workflow

```
Agent A hits a problem → basel add "Why does X fail?" --open
                                     ↓
Agent B runs → basel open → Sees open question
                                     ↓
Agent B solves it → Updates status to "closed"
                                     ↓
Agent C searches → Gets the solved answer
```

## VS Code Extension

The `vscode-basel/` directory contains an extension with:
- `Cmd+Shift+K` — Search the index
- Status bar showing entry count
- Commands to init/add entries

## License

MIT
