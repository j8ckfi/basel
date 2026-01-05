import chalk from 'chalk';
import { startMcpServer } from '../../mcp/server.js';

export interface ServeOptions {
    port?: number;
}

export async function serve(cwd: string, options: ServeOptions): Promise<void> {
    if (options.port) {
        console.log(chalk.yellow('HTTP transport not yet implemented. Using stdio.'));
    }

    console.error(chalk.dim('Starting Basel MCP server on stdio...'));
    await startMcpServer(cwd);
}
