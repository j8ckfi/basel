#!/usr/bin/env node

import { Command } from 'commander';
import { init } from './cli/commands/init.js';
import { add } from './cli/commands/add.js';
import { query } from './cli/commands/query.js';
import { build } from './cli/commands/build.js';
import { validate } from './cli/commands/validate.js';
import { serve } from './cli/commands/serve.js';
import { pack } from './cli/commands/pack.js';

const program = new Command();

program
    .name('basel')
    .description('Q&A knowledge indexes for AI coding agents')
    .version('0.1.0');

program
    .command('init')
    .description('Initialize .basel/ directory in current project')
    .action(async () => {
        await init(process.cwd());
    });

program
    .command('add [question]')
    .description('Create a new entry')
    .option('--from-file <path>', 'Import existing markdown file')
    .option('-c, --category <name>', 'Category directory', 'project')
    .action(async (question, options) => {
        await add(process.cwd(), question, options);
    });

program
    .command('query <search>')
    .description('Search the index')
    .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
    .option('-l, --limit <n>', 'Maximum results', '5')
    .option('-f, --format <type>', 'Output format (text|json)', 'text')
    .action(async (search, options) => {
        await query(process.cwd(), search, {
            tags: options.tags,
            limit: parseInt(options.limit, 10),
            format: options.format,
        });
    });

program
    .command('build')
    .description('Regenerate manifest and search index')
    .action(async () => {
        await build(process.cwd());
    });

program
    .command('validate')
    .description('Check all entries for schema compliance')
    .action(async () => {
        await validate(process.cwd());
    });

program
    .command('serve')
    .description('Start MCP server')
    .option('-p, --port <n>', 'HTTP port (default: stdio)')
    .action(async (options) => {
        await serve(process.cwd(), { port: options.port ? parseInt(options.port, 10) : undefined });
    });

program
    .command('pack <action> [name]')
    .description('Manage starter packs (list, add)')
    .action(async (action, name) => {
        await pack(process.cwd(), action, name);
    });

program.parse();
