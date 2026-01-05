import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { findEntries, parseEntry } from '../../core/entry.js';
import { buildManifest, writeManifest } from '../../core/manifest.js';

const BASEL_DIR = '.basel';

export async function build(cwd: string): Promise<void> {
    const baselDir = path.join(cwd, BASEL_DIR);

    try {
        await fs.access(baselDir);
    } catch {
        console.log(chalk.red('No Basel index found. Run `basel init` first.'));
        return;
    }

    const entryPaths = await findEntries(baselDir);
    const validPaths = entryPaths.filter(p => !path.basename(p).startsWith('_'));

    console.log(chalk.dim(`Found ${validPaths.length} entries...`));

    const entries = await Promise.all(validPaths.map(p => parseEntry(p)));
    const manifest = await buildManifest(baselDir, entries);
    await writeManifest(baselDir, manifest);

    console.log(chalk.green('✓ Built manifest with'), chalk.cyan(entries.length), 'entries');
}
