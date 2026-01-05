<p align="center">
  <img src="basellogo.png" alt="Basel" width="300" />
</p>

<h3 align="center">Multi-agent knowledge base for AI coding assistants</h3>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#why-basel">Why Basel</a> •
  <a href="#use-cases">Use Cases</a> •
  <a href="#for-agents">For Agents</a> •
  <a href="#cli-commands">CLI</a>
</p>

---

## Quick Start

```bash
npm install -g basel
basel init
basel add "How do I configure the database?"
```

That's it. Your project now has a searchable knowledge base that any AI agent can query.

---

## Why Basel?

**AI agents forget everything between sessions.** Every conversation starts from zero—no memory of past bugs, architectural decisions, or the workaround your colleague found last week.

Basel gives agents persistent, searchable project memory in the format they understand best: **Q&A**.

### The Core Problem

| What Goes Wrong | Without Basel | With Basel |
|-----------------|---------------|------------|
| Agent hallucinates API | Guesses wrong, you debug for 20 minutes | Finds documented answer in `.basel/` |
| Tribal knowledge | Never documented, rediscovered each time | Captured as a searchable entry |
| Same bug twice | Agent rediscovers fix from scratch | Queries past solutions instantly |
| New contributor | Asks you or reads stale docs | Agents self-serve from the index |

### Why Q&A Format Works

LLMs learned to reason from StackOverflow, GitHub Issues, and forums. The **question → context → answer → gotchas** structure maps directly to how models think. By writing documentation in this shape, you're writing in the model's native reasoning pattern.

---

## Use Cases

### 🔧 Capture Tribal Knowledge

That obscure staging bug? The auth flow that only Sarah understands? The hack that makes the build pass on Windows?

```yaml
---
question: "Why does auth fail on staging?"
tags: [auth, staging]
status: closed
---

## Context
Token validation behaves differently on staging vs prod due to environment variables.

## Answer  
Set `AUTH_SECRET` to the staging-specific value from 1Password.

## Gotchas
- Token expiry is 1 hour on staging vs 24 hours on prod
- The staging secret rotates monthly
```

### 🤝 Multi-Agent Collaboration

Agent A hits a problem it can't solve. Instead of giving up, it documents the open question:

```bash
basel add "Why does the WebSocket disconnect after 30 seconds?" --open
```

Agent B—in a different session, maybe days later—runs `basel open`, sees the unsolved problem, investigates, and closes it. Agent C later searches and finds the answer.

```
Agent A → hits wall → basel add --open
                            ↓
Agent B → basel open → investigates → solves → status: closed
                            ↓
Agent C → searches → gets the answer
```

### 📚 Library Documentation in LLM-Native Format

Your project uses a new SDK that shipped after the model's training cutoff. Instead of hoping the agent guesses correctly:

```yaml
---
question: "How do I use the new payment SDK?"
tags: [payments, sdk]
status: closed
---

## Answer
\```typescript
import { PaymentClient } from '@acme/payments';

const client = new PaymentClient({ 
  apiKey: process.env.PAYMENT_KEY 
});

await client.charge({ amount: 1000, currency: 'usd' });
\```

## Gotchas
- Amount is in cents, not dollars
- `charge()` is idempotent if you pass the same `idempotencyKey`
```

### 🐛 Debugging Patterns

Capture the debugging patterns that work for your specific codebase:

```yaml
---
question: "How do I debug flaky tests in the payment module?"
tags: [testing, payments, debugging]
status: closed
---

## Answer
1. Check if the test relies on external services—mock them
2. Look for race conditions in async handlers
3. Run with `--runInBand` to isolate timing issues

## Gotchas
- The `PaymentProcessor` class has a 5-second internal timeout that causes false failures
```

---

## For Agents

Add this to your `CLAUDE.md`, `AGENTS.md`, or equivalent:

````markdown
## Project Knowledge Base

This project uses Basel (`.basel/` directory) to store documented solutions and open problems in Q&A format.

### Before Implementing

When working on unfamiliar code or patterns:
1. Use `search_project_index` (via MCP) or `basel query "your question"` (via CLI)
2. Check for existing documented solutions before guessing
3. Run `list_open_questions` or `basel open` to see unsolved problems

### When You Solve Something

If you figure out a non-obvious solution:
```bash
basel add "How do I [thing you just solved]?"
```

Then fill in the Context, Answer, and Gotchas sections.

### When You Hit a Wall

If you can't solve a problem:
```bash
basel add "Why does [thing] happen?" --open
```

This leaves the question for a future agent session to solve.

### When You Solve an Open Question

1. Find the entry in `.basel/`
2. Change `status: open` to `status: closed`
3. Fill in the Answer section

### Available Tools

**Via MCP (recommended):**
- `search_project_index` — Find relevant Q&A entries by keyword
- `list_open_questions` — See all unsolved problems

**Via CLI (fallback):**
```bash
basel query "your search terms"
basel open
```
````

### MCP Configuration

Add to your MCP config (Claude Desktop, Claude Code, or other MCP-compatible tools):

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

---

## Entry Format

Entries are markdown files with YAML frontmatter, stored in `.basel/`:

```yaml
---
question: "Your question here"
tags: [relevant, tags]
status: open       # open = unsolved, closed = answered
updated: 2026-01-04
confidence: high   # high | medium | low
related: [other-entry-id]
---

## Context
Background information, when this situation occurs, why someone would ask this.

## Answer
The solution, with code examples if applicable.

## Gotchas
Edge cases, common mistakes, things that might trip someone up.
```

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `basel init` | Initialize `.basel/` directory in current project |
| `basel add "question"` | Create new entry (interactive) |
| `basel add "question" --open` | Create entry marked as unsolved |
| `basel open` | List all unsolved problems |
| `basel query "search"` | Search the knowledge base |
| `basel build` | Regenerate manifest and search index |
| `basel validate` | Check entries for schema compliance |
| `basel serve` | Start MCP server (stdio) |

---

## Directory Structure

```
.basel/
├── manifest.json       # Auto-generated index
├── config.yaml         # Optional settings
├── project/            # Project-specific knowledge
│   ├── auth-flow.md
│   └── staging-gotchas.md
└── {category}/         # Organize by domain
    └── topic.md
```

---

## VS Code Extension

The `vscode-basel/` directory contains a VS Code extension:

- **`Cmd+Shift+K`** — Search the knowledge base
- **Status bar** — Shows entry count
- **Commands** — Init project, add entries, run queries

---

## License

MIT
