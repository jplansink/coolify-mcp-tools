# Contributing to Coolify MCP Tools

Thank you for your interest in contributing to Coolify MCP Tools! This document provides guidelines and information for contributors.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/jplansink/coolify-mcp-tools/issues)
2. If not, create a new issue with:
   - A clear, descriptive title
   - Steps to reproduce the bug
   - Expected behavior
   - Actual behavior
   - Your environment (Node.js version, OS, Coolify version)

### Suggesting Features

1. Check existing issues and discussions for similar suggestions
2. Create a new issue with:
   - A clear description of the feature
   - Use cases and benefits
   - Any implementation ideas you have

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Format code: `npm run format`
7. Commit with a clear message
8. Push to your fork
9. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/coolify-mcp-tools.git
cd coolify-mcp-tools

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

## Code Style

- We use TypeScript with strict mode
- Code is formatted with Prettier
- Linting is done with ESLint
- Run `npm run format` before committing

## Testing

- Write tests for new features
- Ensure existing tests pass
- Use Jest for testing

## Adding New Tools

When adding new Coolify API endpoints:

1. Add types to `src/types/coolify.ts`
2. Add client method to `src/lib/coolify-client.ts`
3. Add MCP tool to `src/lib/mcp-server.ts`
4. Update the README tool list
5. Add to CHANGELOG

## Commit Messages

Use clear, descriptive commit messages:

- `feat: add database backup tools`
- `fix: handle API timeout errors`
- `docs: update installation instructions`
- `refactor: simplify server validation logic`

## Questions?

Feel free to open an issue for any questions about contributing.
