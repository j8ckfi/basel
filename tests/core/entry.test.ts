
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEntryId, parseEntry, formatEntry } from '../../src/core/entry.js';
import fs from 'fs/promises';

vi.mock('fs/promises');

describe('Entry', () => {
    describe('generateEntryId', () => {
        it('generates ID from filename for .basel root', () => {
            const id = generateEntryId('.basel/manifest.json');
            expect(id).toBe('manifest.json');
        });

        it('generates ID from directory and filename for categories', () => {
            const id = generateEntryId('.basel/cli/command.md');
            expect(id).toBe('cli-command');
        });
    });

    describe('parseEntry', () => {
        beforeEach(() => {
            vi.resetAllMocks();
        });

        it('parses a valid entry file', async () => {
            const fileContent = `---
question: Test question
tags: [test]
status: closed
---

Test content
`;
            vi.mocked(fs.readFile).mockResolvedValue(fileContent);

            const entry = await parseEntry('.basel/test/entry.md');

            expect(entry.id).toBe('test-entry');
            expect(entry.question).toBe('Test question');
            expect(entry.tags).toEqual(['test']);
            expect(entry.status).toBe('closed');
            expect(entry.content).toBe('Test content');
        });

        it('throws on invalid frontmatter', async () => {
            const fileContent = `---
question: 
tags: [test]
---

Test content
`;
            vi.mocked(fs.readFile).mockResolvedValue(fileContent);

            await expect(parseEntry('.basel/test/bad.md')).rejects.toThrow();
        });
    });

    describe('formatEntry', () => {
        it('formats entry back to markdown', () => {
            const entry = {
                id: 'test',
                path: 'test.md',
                question: 'Question',
                tags: ['tag'],
                status: 'open',
                related: [],
                content: 'Content'
            };

            // @ts-ignore - testing with partial objects or just checking specific output
            const output = formatEntry(entry);

            expect(output).toContain('question: Question');
            expect(output).toContain('tags:\n  - tag');
            expect(output).toContain('status: open');
            expect(output).toContain('Content');
        });
    });
});
