import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import matter from 'gray-matter';
import { EntryFrontmatter } from '../../core/schema.js';
import { findEntries } from '../../core/entry.js';

const BASEL_DIR = '.basel';

interface ValidationError {
    file: string;
    errors: string[];
}

export async function validate(cwd: string): Promise<void> {
    const baselDir = path.join(cwd, BASEL_DIR);

    try {
        await fs.access(baselDir);
    } catch {
        console.log(chalk.red('No Basel index found. Run `basel init` first.'));
        return;
    }

    const entryPaths = await findEntries(baselDir);
    const validPaths = entryPaths.filter(p => !path.basename(p).startsWith('_'));

    console.log(chalk.dim(`Validating ${validPaths.length} entries...`));

    const errors: ValidationError[] = [];

    for (const entryPath of validPaths) {
        const fileErrors: string[] = [];

        try {
            const content = await fs.readFile(entryPath, 'utf-8');
            const { data, content: body } = matter(content);

            const result = EntryFrontmatter.safeParse(data);
            if (!result.success) {
                for (const issue of result.error.issues) {
                    fileErrors.push(`${issue.path.join('.')}: ${issue.message}`);
                }
            }

            if (!body.includes('## Answer')) {
                fileErrors.push('Missing ## Answer section');
            }
        } catch (e) {
            fileErrors.push(`Parse error: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }

        if (fileErrors.length > 0) {
            errors.push({ file: path.relative(baselDir, entryPath), errors: fileErrors });
        }
    }

    if (errors.length === 0) {
        console.log(chalk.green('✓ All entries are valid'));
        return;
    }

    console.log(chalk.red(`Found ${errors.length} invalid entries:\n`));
    for (const { file, errors: fileErrors } of errors) {
        console.log(chalk.yellow(file));
        for (const err of fileErrors) {
            console.log(chalk.dim(`  - ${err}`));
        }
        console.log();
    }

    process.exit(1);
}
