# Basel

Q&A knowledge indexes for AI coding agents.

## Installation

```bash
npm install -g basel
```

## Quick Start

```bash
# Initialize in your project
basel init

# Add a Q&A entry
basel add "How do I configure authentication?"

# Search the index
basel query "auth"

# Start MCP server for AI agents
basel serve
```

## Entry Format

Entries are markdown files with YAML frontmatter:

```yaml
---
question: "How do I configure authentication?"
tags: [security, config]
confidence: high
---

## Context

When setting up auth for the first time...

## Answer

Use the `AuthProvider` class...

## Gotchas

- Session tokens expire after 24h
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `basel init` | Initialize `.basel/` directory |
| `basel add [question]` | Create a new entry |
| `basel query <search>` | Search the index |
| `basel build` | Regenerate manifest |
| `basel validate` | Check entries for errors |
| `basel serve` | Start MCP server |
| `basel pack list` | List starter packs |
| `basel pack add <name>` | Install a starter pack |

## MCP Integration

Add to your `Claude.md`:

```markdown
## Knowledge Index

This project uses Basel. Before implementing unfamiliar patterns:
- Use the `search_project_index` tool if available
- Otherwise run `basel query "your question"`
```

## License

MIT
