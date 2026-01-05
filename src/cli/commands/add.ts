import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

const BASEL_DIR = '.basel';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);
}

function generateEntryContent(question: string, tags: string[], isOpen: boolean): string {
    const today = new Date().toISOString().split('T')[0];
    const statusLine = isOpen ? 'status: open' : '';
    const statusYaml = statusLine ? `\n${statusLine}` : '';
    return `---
question: "${question}"
tags: [${tags.join(', ')}]
updated: ${today}${statusYaml}
---

## Context

${isOpen ? '[Describe the problem - another agent may solve this]' : '[Describe when this question applies]'}

## Answer

${isOpen ? '[OPEN - waiting for solution]' : '[Provide the solution]'}

## Gotchas

- [List any caveats]
`;
}

export interface AddOptions {
    fromFile?: string;
    category?: string;
    open?: boolean;
}

export async function add(cwd: string, questionText: string | undefined, options: AddOptions): Promise<void> {
    const baselDir = path.join(cwd, BASEL_DIR);

    try {
        await fs.access(baselDir);
    } catch {
        console.log(chalk.red('No Basel index found. Run `basel init` first.'));
        return;
    }

    if (options.fromFile) {
        const content = await fs.readFile(options.fromFile, 'utf-8');
        const filename = path.basename(options.fromFile);
        const category = options.category || 'project';
        const destDir = path.join(baselDir, category);
        await fs.mkdir(destDir, { recursive: true });
        const destPath = path.join(destDir, filename);
        await fs.writeFile(destPath, content);
        console.log(chalk.green('✓ Imported'), chalk.cyan(filename), 'to', chalk.cyan(category));
        return;
    }

    let question = questionText;
    let tags: string[] = [];
    let category = options.category || 'project';
    let isOpen = options.open || false;

    if (!question) {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'question',
                message: 'Question:',
                validate: (input: string) => input.length > 0 || 'Question is required',
            },
            {
                type: 'input',
                name: 'tags',
                message: 'Tags (comma-separated):',
            },
            {
                type: 'input',
                name: 'category',
                message: 'Category:',
                default: 'project',
            },
            {
                type: 'confirm',
                name: 'open',
                message: 'Mark as open question?',
                default: false,
            },
        ]);
        question = answers.question;
        tags = answers.tags ? answers.tags.split(',').map((t: string) => t.trim()) : [];
        category = answers.category;
        isOpen = answers.open;
    }

    const slug = slugify(question!);
    const destDir = path.join(baselDir, category);
    await fs.mkdir(destDir, { recursive: true });
    const destPath = path.join(destDir, `${slug}.md`);

    const content = generateEntryContent(question!, tags, isOpen);
    await fs.writeFile(destPath, content);

    console.log(chalk.green('✓ Created'), chalk.cyan(destPath));
    if (isOpen) {
        console.log(chalk.yellow('  Marked as OPEN - other agents can solve this'));
    } else {
        console.log(chalk.dim('  Edit the file to add context, answer, and gotchas'));
    }
}
