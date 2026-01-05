---
question: "How does the entry parsing work?"
tags: [core, parsing, frontmatter]
updated: 2026-01-04
status: closed
related: [core-schema-validation]
---

## Context

Understanding how Basel parses markdown files with YAML frontmatter.

## Answer

Entries are parsed in `src/core/entry.ts` using `gray-matter`:

```typescript
import matter from 'gray-matter';

const { data, content: body } = matter(fileContent);
const frontmatter = EntryFrontmatter.parse(data);
```

The frontmatter schema expects:
- `question` (required): The Q&A question
- `tags`: Array of strings for filtering
- `updated`: Date string (auto-coerced from Date objects)
- `status`: Whether the question is open or closed
- `related`: Array of entry IDs for linking

Entry IDs are generated from the path: `{category}-{filename}` (e.g., `cli-adding-new-commands`).

## Gotchas

- `gray-matter` parses dates as JavaScript Date objects, so the schema uses a transform to coerce to strings
- Files starting with `_` are ignored (used for templates)
- The `.basel/` root files get IDs without a category prefix
