---
question: "How do I add a new MCP tool to the server?"
tags: [mcp, server, development]
updated: 2026-01-04
confidence: high
---

## Context

When you want to expose a new tool via MCP beyond `search_project_index`.

## Answer

Edit `src/mcp/server.ts`:

1. Add the tool definition in `ListToolsRequestSchema` handler:

```typescript
{
  name: 'your_tool_name',
  description: 'What it does',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string', description: 'Param description' }
    },
    required: ['param']
  }
}
```

2. Handle calls in `CallToolRequestSchema`:

```typescript
if (request.params.name === 'your_tool_name') {
  const args = request.params.arguments as { param: string };
  // Do something
  return { content: [{ type: 'text', text: 'Result' }] };
}
```

## Gotchas

- Tool names should be snake_case
- Always validate the tool name in the handler
- The `inputSchema` must be valid JSON Schema
