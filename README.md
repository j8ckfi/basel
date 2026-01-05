<p align="center">
  <img src="basellogo.png" alt="Basel" width="300" />
</p>

# basel

your codebase (probably) isn't perfect.  
your agents don't need it to be — they need to understand it.

---

```bash
npm install -g basel-kb && basel init
```

---

> README is for humans. AGENTS.md is for rules. Basel is for knowledge.

## Use Cases

### 1. Codebase Architecture
"How does auth actually flow through this system?"

```yaml
---
question: "How is auth handled in the gateway?"
tags: [auth, architecture]
status: closed
---

## Answer
Auth is offloaded to the `verification-service` sidecar.
The main API never sees raw JWTs, only the `X-User-ID` header injected by the sidecar.
Do not attempt to parse tokens in `src/routes`.
```

### 2. Library Specifics
SDKs, APIs, and dependencies that shipped after training cutoff or aren't well-documented.

```yaml
---
question: "How do I use the v2 payment SDK?"
tags: [payments, sdk]
status: closed
---

## Answer
The v2 SDK requires `BigInt` for amounts.
```typescript
// Correct
await client.transfer({ amount: 1000n, currency: 'USD' });
```
```

### 3. Project Patterns
"We do X this way because Y."

```yaml
---
question: "Why do we use raw SQL in analytics?"
tags: [database, analytics]
status: closed
---

## Answer
The ORM overhead causes OOM errors on the analytics worker nodes.
For files in `src/analytics/`, always use `knex.raw()` instead of the query builder.
```

### 4. Tribal Knowledge
The stuff that lives in Slack threads.

```yaml
---
question: "Why does the build fail on Windows?"
tags: [build, windows]
status: closed
---

## Answer
The build script relies on `rm -rf`. 
On Windows, you must run the build inside WSL or use the `rimraf` wrapper.
```

---

## For Agents

Add this to your `CLAUDE.md` or `AGENTS.md`:

````markdown
## Project Knowledge Base

This project uses Basel (`.basel/`) for architectural decisions and tribal knowledge.

**Before Implementing:**
1. Search the index: `basel query "how do I..."` or `search_project_index` (MCP).
2. Check for open questions: `basel open` or `list_open_questions` (MCP).

**Workflow:**
- **Solved something tricky?** → `basel add "How to..."`
- **Hit a wall?** → `basel add "Why does..." --open`
````

## CLI

| Command | Description |
|---------|-------------|
| `basel init` | Initialize `.basel/` |
| `basel add "..."` | Create a new entry |
| `basel add "..." --open` | Create an unsolved entry |
| `basel open` | List status: open entries |
| `basel query "..."` | Search the knowledge base |
| `basel serve` | Start MCP server |

---

## License

MIT
