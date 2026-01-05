import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { findEntries, parseEntry } from '../../core/entry.js';

const BASEL_DIR = '.basel';

export async function open(cwd: string): Promise<void> {
    const baselDir = path.join(cwd, BASEL_DIR);

    try {
        await fs.access(baselDir);
    } catch {
        console.log(chalk.red('No Basel index found. Run `basel init` first.'));
        return;
    }

    const entryPaths = await findEntries(baselDir);
    const validPaths = entryPaths.filter(p => !path.basename(p).startsWith('_'));
    const entries = await Promise.all(validPaths.map(p => parseEntry(p)));

    const openEntries = entries.filter(e => e.status === 'open');

    if (openEntries.length === 0) {
        console.log(chalk.green('No open questions. All problems are solved!'));
        return;
    }

    console.log(chalk.cyan(`${openEntries.length} open question(s):\n`));

    for (const entry of openEntries) {
        const tags = entry.tags.length > 0 ? chalk.dim(` [${entry.tags.join(', ')}]`) : '';
        console.log(`  ${chalk.yellow('○')} ${entry.question}${tags}`);
        console.log(chalk.dim(`    ${entry.path}`));
        console.log();
    }

    console.log(chalk.dim('Mark questions as closed by setting `status: closed` in the frontmatter.'));
}
