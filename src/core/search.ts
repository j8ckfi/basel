import Fuse from 'fuse.js';
import { Entry } from './schema.js';

export interface SearchResult {
    entry: Entry;
    score: number;
}

export interface SearchOptions {
    tags?: string[];
    limit?: number;
}

export function createSearchIndex(entries: Entry[]): Fuse<Entry> {
    return new Fuse(entries, {
        keys: [
            { name: 'question', weight: 2 },
            { name: 'content', weight: 1 },
            { name: 'tags', weight: 1.5 },
        ],
        threshold: 0.4,
        includeScore: true,
        ignoreLocation: true,
    });
}

export function search(
    index: Fuse<Entry>,
    query: string,
    options: SearchOptions = {}
): SearchResult[] {
    const { tags, limit = 5 } = options;

    let results = index.search(query);

    if (tags && tags.length > 0) {
        results = results.filter(r =>
            tags.some(tag => r.item.tags.includes(tag))
        );
    }

    return results
        .slice(0, limit)
        .map(r => ({
            entry: r.item,
            score: r.score ?? 0,
        }));
}

export function formatSearchResult(result: SearchResult): string {
    const { entry, score } = result;
    const status = entry.status === 'open' ? ' ⚠️ OPEN' : '';
    const tags = entry.tags.length > 0 ? ` (${entry.tags.join(', ')})` : '';

    return `## ${entry.question}${status}${tags}

${entry.content}

---
Score: ${(1 - score).toFixed(2)} | ID: ${entry.id}
`;
}
