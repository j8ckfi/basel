
import { describe, it, expect } from 'vitest';
import { EntryFrontmatter } from '../../src/core/schema.js';

describe('EntryFrontmatter Schema', () => {
    it('validates a correct closed entry', () => {
        const data = {
            question: 'Valid question?',
            tags: ['tag1', 'tag2'],
            status: 'closed',
            updated: '2024-01-01',
            related: []
        };
        const result = EntryFrontmatter.safeParse(data);
        expect(result.success).toBe(true);
    });

    it('validates a correct open entry', () => {
        const data = {
            question: 'Open question?',
            tags: [],
            status: 'open'
        };
        const result = EntryFrontmatter.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.status).toBe('open');
        }
    });

    it('defaults status to closed if missing', () => {
        const data = {
            question: 'No status?'
        };
        const result = EntryFrontmatter.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.status).toBe('closed');
        }
    });

    it('fails if question is missing', () => {
        const data = {
            tags: ['tag1']
        };
        const result = EntryFrontmatter.safeParse(data);
        expect(result.success).toBe(false);
    });

    it('fails on invalid status', () => {
        const data = {
            question: 'Invalid status',
            status: 'pending' // 'pending' is not in the enum anymore
        };
        const result = EntryFrontmatter.safeParse(data);
        expect(result.success).toBe(false);
    });

    it('handles Date objects for updated field', () => {
        const data = {
            question: 'Date object',
            updated: new Date('2024-01-01T00:00:00.000Z')
        };
        const result = EntryFrontmatter.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.updated).toBe('2024-01-01');
        }
    });
});
