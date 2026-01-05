import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { EntryFrontmatter, Entry } from './schema.js';

export function generateEntryId(filePath: string): string {
    const basename = path.basename(filePath, '.md');
    const dir = path.basename(path.dirname(filePath));
    if (dir === '.basel') {
        return basename;
    }
    return `${dir}-${basename}`;
}

export async function parseEntry(filePath: string): Promise<Entry> {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data, content: body } = matter(content);

    const frontmatter = EntryFrontmatter.parse(data);
    const id = generateEntryId(filePath);

    return {
        id,
        path: filePath,
        question: frontmatter.question,
        tags: frontmatter.tags,
        updated: frontmatter.updated,
        confidence: frontmatter.confidence,
        related: frontmatter.related,
        content: body.trim(),
    };
}

export async function findEntries(baselDir: string): Promise<string[]> {
    const entries: string[] = [];

    async function scan(dir: string) {
        const items = await fs.readdir(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory() && !item.name.startsWith('.')) {
                await scan(fullPath);
            } else if (item.isFile() && item.name.endsWith('.md')) {
                entries.push(fullPath);
            }
        }
    }

    await scan(baselDir);
    return entries;
}

export function formatEntry(entry: Entry): string {
    const frontmatter: Record<string, unknown> = {
        question: entry.question,
        tags: entry.tags,
    };

    if (entry.updated) frontmatter.updated = entry.updated;
    if (entry.confidence !== 'high') frontmatter.confidence = entry.confidence;
    if (entry.related.length > 0) frontmatter.related = entry.related;

    return matter.stringify(entry.content, frontmatter);
}
