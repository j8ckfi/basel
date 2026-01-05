import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

const BASEL_DIR = '.basel';
const CONFIG_CONTENT = `# Basel Configuration
registry: https://raw.githubusercontent.com/basel-registry/main
`;

const EXAMPLE_ENTRY = `---
question: "Example: How do I use this feature?"
tags: [example]
confidence: high
---

## Context

Describe when this question applies...

## Answer

Provide the solution here.

## Gotchas

- List any caveats or edge cases
`;

export async function init(cwd: string): Promise<void> {
    const baselDir = path.join(cwd, BASEL_DIR);

    try {
        await fs.access(baselDir);
        console.log(chalk.yellow('Basel index already exists in this directory.'));
        return;
    } catch {
        // Directory doesn't exist, continue with init
    }

    await fs.mkdir(baselDir, { recursive: true });
    await fs.mkdir(path.join(baselDir, 'project'), { recursive: true });

    await fs.writeFile(path.join(baselDir, 'config.yaml'), CONFIG_CONTENT);
    await fs.writeFile(path.join(baselDir, 'manifest.json'), JSON.stringify({ version: '1.0', entries: [] }, null, 2));
    await fs.writeFile(path.join(baselDir, 'project', '_example.md'), EXAMPLE_ENTRY);

    console.log(chalk.green('✓ Initialized Basel index at'), chalk.cyan(baselDir));
    console.log(chalk.dim('  Created project/_example.md as a template'));
    console.log(chalk.dim('  Run `basel add "your question"` to create entries'));
}
