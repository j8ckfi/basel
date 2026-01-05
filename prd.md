# basel
## Product Requirements Document

**Version:** 1.0  
**Status:** Draft  
**Author:** Jack  
**Date:** January 2026

---

## Overview

basel is an open-source specification and toolchain for creating project-local Q&A knowledge indexes optimized for consumption by AI coding agents. It provides a standardized format for documenting tribal knowledge in the shape that language models understand best: question → context → answer → gotchas.

basel complements existing agent instruction files (AGENTS.md, Claude.md) by providing retrievable, searchable knowledge rather than always-loaded constraints.

---

## Problem Statement

AI coding agents struggle with:

1. **Hallucination on new/niche libraries.** Models confidently generate incorrect API signatures for packages released after training cutoff or with limited training data presence.

2. **Missing tribal knowledge.** "Why does auth fail on staging?" lives in a Slack thread from 2023. The agent will never find it.

3. **Context window waste.** Stuffing everything into AGENTS.md bloats context and dilutes attention on what matters for the current task.

4. **Format mismatch.** READMEs and docs are written for humans. LLMs learned reasoning patterns from Q&A format (StackOverflow, GitHub Issues). Documentation doesn't match the shape of "how to figure something out."

---

## Solution

A standardized format for project knowledge that:

- Matches the Q&A structure LLMs learned from
- Lives in the repo, version-controlled alongside code
- Is retrievable on-demand rather than always-loaded
- Works across any AI coding tool via MCP or CLI fallback

---

## Target User

**Primary:** Solo developers using AI coding tools (Claude Code, Cursor, aider, Copilot) who want to reduce hallucination and preserve project knowledge in an agent-accessible format.

**Secondary:** Small teams with tribal knowledge problems; open source maintainers onboarding AI-assisted contributors.

**Distribution channels:** Claude Code Discord, AI coding tool communities, Hacker News, relevant subreddits (r/ClaudeAI, r/cursor, r/LocalLLaMA).

---

## V1 Scope

### In Scope

- **Format specification** — Markdown + YAML frontmatter schema for Q&A entries
- **CLI tool** — `basel init`, `basel add`, `basel query`, `basel build`, `basel serve`
- **MCP server** — Exposes `search_project_index` tool for compatible agents
- **Local text search** — Simple keyword/fuzzy matching against index
- **Language-specific starter packs** — Pre-built indexes for common questions in major languages (Swift, Python, TypeScript, Rust, Go)
- **Central registry** — Hosted collection of starter packs and community-contributed indexes

### Out of Scope (Future)

- Auto-generation from StackOverflow/GitHub Issues
- Embedding-based semantic search (maybe V1.1)
- IDE extensions (rely on MCP/CLI for V1)
- Hosted/cloud sync
- Team collaboration features

---

## Technical Specification

### Directory Structure

```
.basel/
├── manifest.json          # Index metadata, search index
├── swift/
│   ├── liquid-glass-usage.md
│   └── swiftui-state-antipatterns.md
├── project/
│   ├── why-we-use-custom-decoder.md
│   ├── auth-flow-explained.md
│   └── staging-env-gotchas.md
└── config.yaml            # Optional settings
```

### Entry Format

```yaml
---
question: "How do I use the liquid glass effect in SwiftUI?"
tags: [swift, swiftui, ios-26, ui]
updated: 2025-06-15
source: https://developer.apple.com/documentation/swiftui/glasseffect  # optional
confidence: high  # high | medium | low
related: [swiftui-state-antipatterns]  # optional, links to other entries by ID
---

## Context

When you want to apply the new iOS 26 glass effect to a view...

## Answer

Use the `.glassEffect()` modifier on any SwiftUI view:

```swift
Text("Hello")
    .glassEffect()
```

## Gotchas

- Only works on iOS 26+. Use `#available` checks.
- Performance impact on older devices — avoid on scrolling lists.
- Doesn't compose well with `.blur()` — choose one.
```

### Manifest Schema

```json
{
  "version": "1.0",
  "entries": [
    {
      "id": "swift-liquid-glass-usage",
      "path": "swift/liquid-glass-usage.md",
      "question": "How do I use the liquid glass effect in SwiftUI?",
      "tags": ["swift", "swiftui", "ios-26", "ui"],
      "updated": "2025-06-15",
      "confidence": "high",
      "related": ["swiftui-state-antipatterns"]
    }
  ],
  "search_index": { /* generated inverted index for fast lookup */ }
}
```

### CLI Commands

| Command | Description |
|---------|-------------|
| `basel init` | Initialize `.basel/` directory in current project |
| `basel add "question text"` | Interactive prompt to create new entry |
| `basel add --from-file path.md` | Import existing markdown as entry |
| `basel query "search terms"` | Search index, output matching entries |
| `basel build` | Regenerate manifest and search index |
| `basel serve` | Start MCP server on stdio |
| `basel serve --port 3000` | Start MCP server on HTTP |
| `basel pack add swift` | Install Swift starter pack from registry |
| `basel pack list` | List available starter packs |
| `basel validate` | Check all entries for schema compliance |

### MCP Interface

```json
{
  "name": "basel",
  "version": "1.0.0",
  "tools": [
    {
      "name": "search_project_index",
      "description": "Search the project's basel knowledge index for relevant Q&A entries",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Search query (keywords, question, or topic)"
          },
          "tags": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Optional tag filters"
          },
          "limit": {
            "type": "integer",
            "default": 5,
            "description": "Maximum results to return"
          }
        },
        "required": ["query"]
      }
    }
  ]
}
```

### Fallback for Non-MCP Tools

Any tool can shell out to the CLI:

```bash
basel query "liquid glass" --format json
```

Returns structured JSON that can be parsed and injected into context.

---

## Starter Packs

Curated, pre-built indexes for common language/framework questions. Maintained in central registry, installable via `basel pack add <name>`.

### V1 Packs

| Pack | Description | Est. Entries |
|------|-------------|--------------|
| `swift` | iOS/macOS development, SwiftUI, UIKit | 150-200 |
| `python` | Core language, common pitfalls, stdlib | 150-200 |
| `typescript` | TS-specific issues, type system gotchas | 100-150 |
| `react` | Hooks, state management, common patterns | 100-150 |
| `rust` | Ownership, lifetimes, common compiler errors | 100-150 |
| `go` | Concurrency, error handling, idioms | 80-100 |

### Registry Structure

Hosted as a GitHub repository with the following structure:

```
basel-registry/
├── packs/
│   ├── swift/
│   │   ├── pack.json       # metadata, version, dependencies
│   │   └── entries/        # the actual Q&A files
│   ├── python/
│   └── ...
└── registry.json           # index of all available packs
```

Community contributions via PR. Maintainer review for quality control.

---

## Distribution

- **npm:** `npm install -g basel`
- **Homebrew:** `brew install basel`
- **Source:** GitHub releases

Implementation in **TypeScript** for npm ecosystem alignment and faster iteration. Single-binary distribution can be achieved later via pkg or bun compile.

---

## Relationship to Existing Standards

| File | Purpose | Loaded | Shape |
|------|---------|--------|-------|
| `AGENTS.md` / `Claude.md` | Behavioral constraints, project rules | Always in context | Imperative instructions |
| `README.md` | Human onboarding | Rarely by agents | Narrative prose |
| `.basel/` | Retrievable knowledge | On-demand via tool call | Q&A format |

Recommended addition to `Claude.md`:

```markdown
## Knowledge Index

This project uses basel for documented solutions. Before implementing unfamiliar patterns, search the index:

- Use the `search_project_index` tool if available
- Otherwise run `basel query "your question"` in terminal
```

---

## Success Metrics

1. **Adoption:** 500+ GitHub repos with `.basel/` directories within 6 months
2. **Registry usage:** 1000+ starter pack installs/month
3. **Community:** 10+ community-contributed packs in registry
4. **Integration:** Mentioned in at least one major AI coding tool's documentation

---

## Design Decisions

The following decisions resolve the original open questions:

### 1. Embedding Search
**Decision:** No embeddings in V1. Ship with keyword/fuzzy matching. Add `--embeddings` flag in V1.1 if user feedback demands it. Rationale: Keeps V1 simple, no external dependencies, faster to ship.

### 2. Entry Linking
**Decision:** Yes, entries can reference other entries via `related: [entry-id]` field in frontmatter. The manifest will include the related IDs. Search results will return related entries as suggestions. Rationale: Low implementation cost, high value for knowledge graphs.

### 3. Versioning Entries
**Decision:** Rely on git. No in-format version tracking. The `updated` field is sufficient for staleness detection. Rationale: Don't reinvent version control.

### 4. Confidence Scoring
**Decision:** Yes, include `confidence: high | medium | low` field. Agents can weight responses accordingly. Default to `high` if omitted. Rationale: Minimal overhead, useful signal for agents.

### 5. Implementation Language
**Decision:** TypeScript. Rationale: NPM ecosystem alignment, MCP SDK is TypeScript-first, faster iteration, team familiarity. Single-binary distribution can come later via bun compile or pkg.

---

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Alpha** | 2-3 weeks | Format spec finalized, CLI core commands, basic text search |
| **Beta** | 2-3 weeks | MCP server, 2-3 starter packs, registry infrastructure |
| **V1 Launch** | 1 week | Documentation, npm/brew distribution, announcement |

---

## Appendix: Why Q&A Format Works

LLMs don't "understand" formatting — they learn statistical patterns. The Q&A structure (problem → context → solution → caveats) appears millions of times in training data from StackOverflow, GitHub Issues, and forums. This creates strong learned associations:

- Text after "Question:" or "##" correlates with problem statements
- Text after "Answer:" correlates with solutions
- "Gotchas" / "Note:" correlates with edge cases and warnings

By writing documentation in this shape, we're essentially writing in the model's native reasoning pattern.

---

*End of document.*