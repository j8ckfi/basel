import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { findEntries, parseEntry } from '../../core/entry.js';
import { createSearchIndex, search, formatSearchResult } from '../../core/search.js';

const BASEL_DIR = '.basel';

export interface QueryOptions {
    tags?: string;
    limit?: number;
    format?: 'text' | 'json';
}

export async function query(cwd: string, queryText: string, options: QueryOptions): Promise<void> {
    const baselDir = path.join(cwd, BASEL_DIR);

    try {
        await fs.access(baselDir);
    } catch {
        console.log(chalk.red('No Basel index found. Run `basel init` first.'));
        return;
    }

    const entryPaths = await findEntries(baselDir);
    if (entryPaths.length === 0) {
        console.log(chalk.yellow('No entries found in the index.'));
        return;
    }

    const entries = [];
    for (const p of entryPaths.filter(ep => !path.basename(ep).startsWith('_'))) {
        try {
            entries.push(await parseEntry(p));
        } catch (e) {
            console.log(chalk.yellow(`Warning: Skipping malformed entry: ${p}`));
            console.log(chalk.dim(`  ${e instanceof Error ? e.message : 'Parse error'}`));
        }
    }

    const index = createSearchIndex(entries);
    const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : undefined;
    const results = search(index, queryText, { tags, limit: options.limit });

    if (results.length === 0) {
        console.log(chalk.yellow('No matching entries found.'));
        return;
    }

    if (options.format === 'json') {
        console.log(JSON.stringify(results.map(r => ({
            id: r.entry.id,
            question: r.entry.question,
            tags: r.entry.tags,
            status: r.entry.status,
            content: r.entry.content,
            score: 1 - r.score,
        })), null, 2));
        return;
    }

    console.log(chalk.cyan(`Found ${results.length} result(s):\n`));
    for (const result of results) {
        console.log(formatSearchResult(result));
    }
}
