---
question: "How should we handle HTTP transport for MCP?"
tags: [mcp, http, transport]
updated: 2026-01-05
status: closed
---

## Context

The current MCP server only supports stdio transport. For web-based integrations or remote connections, HTTP transport is needed.

## Answer

Use the `@modelcontextprotocol/sdk` HTTP server transport:

```typescript
import { HttpServerTransport } from '@modelcontextprotocol/sdk/server/http.js';

const transport = new HttpServerTransport({ port: 3000 });
await server.connect(transport);
```

For the CLI, add a `--port` flag to `basel serve`:

```typescript
if (options.port) {
    const transport = new HttpServerTransport({ port: options.port });
    await server.connect(transport);
} else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
```

## Gotchas

- HTTP transport requires authentication when exposed publicly
- CORS headers needed for browser-based clients
- SSE (Server-Sent Events) is the recommended pattern for MCP over HTTP
