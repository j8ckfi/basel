import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { listPacks, installPack } from '../../registry/client.js';

const BASEL_DIR = '.basel';

export async function pack(cwd: string, action: string, packName?: string): Promise<void> {
    const baselDir = path.join(cwd, BASEL_DIR);

    if (action === 'list') {
        await listPacks();
        return;
    }

    if (action === 'add') {
        if (!packName) {
            console.log(chalk.red('Pack name required. Usage: basel pack add <name>'));
            return;
        }

        try {
            await fs.access(baselDir);
        } catch {
            console.log(chalk.red('No Basel index found. Run `basel init` first.'));
            return;
        }

        await installPack(packName, baselDir);
        return;
    }

    console.log(chalk.red(`Unknown pack action: ${action}`));
    console.log(chalk.dim('Available actions: list, add'));
}
