
import { describe, it, expect } from 'vitest';
import { createSearchIndex, search } from '../../src/core/search.js';
import { Entry } from '../../src/core/schema.js';

describe('Search', () => {
    const mockEntries: Entry[] = [
        {
            id: '1',
            path: 'path/1.md',
            question: 'How do I add a command?',
            tags: ['cli', 'command'],
            status: 'closed',
            related: [],
            content: 'Use the CLI builder.'
        },
        {
            id: '2',
            path: 'path/2.md',
            question: 'How do I configure the server?',
            tags: ['server', 'config'],
            status: 'closed',
            related: [],
            content: 'Edit config.yaml.'
        },
        {
            id: '3',
            path: 'path/3.md',
            question: 'Why is the build failing?',
            tags: ['build', 'error'],
            status: 'open',
            related: [],
            content: 'Check the logs.'
        }
    ];

    const index = createSearchIndex(mockEntries);

    it('finds exact matches', () => {
        const results = search(index, 'command');
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].entry.id).toBe('1');
    });

    it('finds fuzzy matches', () => {
        const results = search(index, 'cofigure'); // Typo
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].entry.id).toBe('2');
    });

    it('filters by tags', () => {
        const results = search(index, 'command', { tags: ['cli'] });
        expect(results.length).toBe(1);
        expect(results[0].entry.id).toBe('1');
    });

    it('returns empty results for non-matching tag', () => {
        const results = search(index, 'command', { tags: ['server'] });
        expect(results.length).toBe(0);
    });

    it('respects limit option', () => {
        // "How" matches 1 and 2
        const results = search(index, 'How', { limit: 1 });
        expect(results.length).toBe(1);
    });
});
