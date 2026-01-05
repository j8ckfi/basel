---
question: "How does the search algorithm work?"
tags: [core, search, fuse]
updated: 2026-01-04
status: closed
---

## Context

Understanding how Basel searches and ranks Q&A entries.

## Answer

Search uses Fuse.js for fuzzy matching in `src/core/search.ts`:

```typescript
const index = new Fuse(entries, {
  keys: [
    { name: 'question', weight: 2 },   // Questions weighted highest
    { name: 'content', weight: 1 },    // Body content
    { name: 'tags', weight: 1.5 },     // Tags for filtering
  ],
  threshold: 0.4,        // Lower = stricter matching
  includeScore: true,    // For ranking
  ignoreLocation: true,  // Match anywhere in string
});
```

Results are ranked by:
1. Match quality (lower Fuse score = better match)
2. Where the match occurred (question > tags > content)

Tag filtering is applied post-search to narrow results.

## Gotchas

- Fuse.js scores are 0-1 where 0 is perfect match
- The `ignoreLocation: true` is important for long content
- Empty queries return no results (not all entries)
