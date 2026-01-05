---
question: "How do I add a new CLI command to Basel?"
tags: [cli, development, commands]
updated: 2026-01-04
status: closed
---

## Context

When you need to extend Basel with a new command like `basel export` or `basel stats`.

## Answer

1. Create a new file in `src/cli/commands/`:

```typescript
import chalk from 'chalk';

export async function yourCommand(cwd: string, options: YourOptions): Promise<void> {
  // Implementation
  console.log(chalk.green('✓ Done'));
}
```

2. Register it in `src/index.ts`:

```typescript
import { yourCommand } from './cli/commands/yourCommand.js';

program
  .command('yourcommand')
  .description('What it does')
  .action(async () => {
    await yourCommand(process.cwd());
  });
```

3. Rebuild: `npm run build`

## Gotchas

- Use `chalk` for colored output
- Always handle the case where `.basel/` doesn't exist
- Use `process.cwd()` to get the working directory
