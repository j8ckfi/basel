# Contributing to Basel

## Quick Start

```bash
git clone https://github.com/j8ckfi/basel.git
cd basel
npm install
npm run build
```

## Development

```bash
npm run dev      # Watch mode
npm test         # Run tests
npm run lint     # Check linting
```

## Project Structure

```
src/
├── cli/         # Command implementations
├── core/        # Entry parsing, manifest, search
├── mcp/         # MCP server
└── index.ts     # CLI entry point
```

## Making Changes

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/thing`)
3. Make your changes
4. Run `npm test` and `npm run lint`
5. Commit with a clear message
6. Open a PR

## Entry Packs

Want to contribute a starter pack? Add entries to `packs/{language}/` following the entry format in the README.

## Questions?

Open an issue or check `.basel/` for documented answers.
