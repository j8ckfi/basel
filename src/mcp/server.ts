import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { findEntries, parseEntry } from '../core/entry.js';
import { createSearchIndex, search } from '../core/search.js';
import { Entry } from '../core/schema.js';

const BASEL_DIR = '.basel';

export async function startMcpServer(cwd: string): Promise<void> {
    const server = new Server(
        { name: 'basel', version: '1.0.0' },
        { capabilities: { tools: {} } }
    );

    let entries: Entry[] = [];
    let searchIndex: ReturnType<typeof createSearchIndex> | null = null;

    async function loadIndex() {
        const baselDir = path.join(cwd, BASEL_DIR);
        try {
            await fs.access(baselDir);
            const entryPaths = await findEntries(baselDir);
            const validPaths = entryPaths.filter(p => !path.basename(p).startsWith('_'));
            entries = await Promise.all(validPaths.map(p => parseEntry(p)));
            searchIndex = createSearchIndex(entries);
        } catch {
            entries = [];
            searchIndex = null;
        }
    }

    await loadIndex();

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [
            {
                name: 'search_project_index',
                description: "Search the project's Basel knowledge index for relevant Q&A entries. Use this before implementing unfamiliar patterns or when you need project-specific guidance.",
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query (keywords, question, or topic)',
                        },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Optional tag filters',
                        },
                        limit: {
                            type: 'integer',
                            default: 5,
                            description: 'Maximum results to return',
                        },
                    },
                    required: ['query'],
                },
            },
        ],
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name !== 'search_project_index') {
            return { content: [{ type: 'text', text: `Unknown tool: ${request.params.name}` }] };
        }

        if (!searchIndex) {
            await loadIndex();
            if (!searchIndex) {
                return { content: [{ type: 'text', text: 'No Basel index found in this project. Run `basel init` to create one.' }] };
            }
        }

        const args = request.params.arguments as { query: string; tags?: string[]; limit?: number };
        const results = search(searchIndex, args.query, {
            tags: args.tags,
            limit: args.limit,
        });

        if (results.length === 0) {
            return { content: [{ type: 'text', text: 'No matching entries found.' }] };
        }

        const formatted = results.map(r => {
            const tags = r.entry.tags.length > 0 ? ` [${r.entry.tags.join(', ')}]` : '';
            return `## ${r.entry.question}${tags}\n\n${r.entry.content}`;
        }).join('\n\n---\n\n');

        return { content: [{ type: 'text', text: formatted }] };
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
}
