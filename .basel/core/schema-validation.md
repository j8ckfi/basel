---
question: "How do I modify the Zod schemas for entry validation?"
tags: [core, schema, validation, zod]
updated: 2026-01-04
confidence: high
related: [core-entry-parsing]
---

## Context

When you need to add new fields to entries or change validation rules.

## Answer

Schemas are defined in `src/core/schema.ts`:

```typescript
export const EntryFrontmatter = z.object({
  question: z.string().min(1),
  tags: z.array(z.string()).default([]),
  updated: DateOrString.optional(),
  source: z.string().url().optional(),
  confidence: ConfidenceLevel.default('high'),
  related: z.array(z.string()).default([]),
});
```

To add a new field:
1. Add it to `EntryFrontmatter`
2. Update `Entry` schema if it should be in parsed output
3. Update `ManifestEntry` if it should be in the manifest

Remember to rebuild after changes.

## Gotchas

- Use `.default()` for optional fields with sensible defaults
- `DateOrString` handles gray-matter's automatic date parsing
- Changes to manifest schema require running `basel build` to regenerate
