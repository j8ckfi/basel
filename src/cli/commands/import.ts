import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import chalk from 'chalk';

const BASEL_DIR = '.basel';

async function copyEntries(sourceDir: string, destDir: string): Promise<{ added: number; skipped: number }> {
    let added = 0;
    let skipped = 0;

    const items = await fs.readdir(sourceDir, { withFileTypes: true });

    for (const item of items) {
        const sourcePath = path.join(sourceDir, item.name);
        const destPath = path.join(destDir, item.name);

        if (item.isDirectory() && !item.name.startsWith('.')) {
            await fs.mkdir(destPath, { recursive: true });
            const result = await copyEntries(sourcePath, destPath);
            added += result.added;
            skipped += result.skipped;
        } else if (item.isFile() && item.name.endsWith('.md') && !item.name.startsWith('_')) {
            try {
                await fs.access(destPath);
                skipped++;
            } catch {
                await fs.copyFile(sourcePath, destPath);
                added++;
            }
        }
    }

    return { added, skipped };
}

export async function importFromRepo(cwd: string, repoUrl: string): Promise<void> {
    const baselDir = path.join(cwd, BASEL_DIR);

    try {
        await fs.access(baselDir);
    } catch {
        console.log(chalk.red('No Basel index found. Run `basel init` first.'));
        return;
    }

    const tempDir = path.join(os.tmpdir(), `basel-import-${Date.now()}`);

    try {
        console.log(chalk.dim(`Cloning ${repoUrl}...`));
        execSync(`git clone --depth 1 ${repoUrl} ${tempDir}`, { stdio: 'pipe' });

        const sourceBasel = path.join(tempDir, BASEL_DIR);
        try {
            await fs.access(sourceBasel);
        } catch {
            console.log(chalk.red('Repository does not contain a .basel/ directory.'));
            return;
        }

        console.log(chalk.dim('Importing entries...'));
        const { added, skipped } = await copyEntries(sourceBasel, baselDir);

        console.log(chalk.green(`✓ Imported ${added} entries`));
        if (skipped > 0) {
            console.log(chalk.dim(`  Skipped ${skipped} existing entries`));
        }
        console.log(chalk.dim('  Run `basel build` to update the index'));

    } catch (e) {
        console.log(chalk.red(`Failed to import: ${e instanceof Error ? e.message : 'Unknown error'}`));
    } finally {
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
    }
}
