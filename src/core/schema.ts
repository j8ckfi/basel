import { z } from 'zod';

export const EntryStatus = z.enum(['open', 'closed']);
export type EntryStatus = z.infer<typeof EntryStatus>;

const DateOrString = z.union([z.date(), z.string()]).transform(val =>
    val instanceof Date ? val.toISOString().split('T')[0] : val
);

export const EntryFrontmatter = z.object({
    question: z.string().min(1),
    tags: z.array(z.string()).default([]),
    updated: DateOrString.optional(),
    source: z.string().url().optional(),
    status: EntryStatus.default('closed'),
    related: z.array(z.string()).default([]),
});
export type EntryFrontmatter = z.infer<typeof EntryFrontmatter>;

export const Entry = z.object({
    id: z.string(),
    path: z.string(),
    question: z.string(),
    tags: z.array(z.string()),
    updated: z.string().optional(),
    status: EntryStatus,
    related: z.array(z.string()),
    content: z.string(),
});
export type Entry = z.infer<typeof Entry>;

export const ManifestEntry = z.object({
    id: z.string(),
    path: z.string(),
    question: z.string(),
    tags: z.array(z.string()),
    updated: z.string().optional(),
    status: EntryStatus,
    related: z.array(z.string()),
});
export type ManifestEntry = z.infer<typeof ManifestEntry>;

export const Manifest = z.object({
    version: z.string(),
    entries: z.array(ManifestEntry),
});
export type Manifest = z.infer<typeof Manifest>;

export const Config = z.object({
    registry: z.string().url().default('https://raw.githubusercontent.com/basel-registry/main'),
});
export type Config = z.infer<typeof Config>;
