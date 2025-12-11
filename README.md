# Coolify MCP Tools

A comprehensive [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for [Coolify](https://coolify.io/) - the open-source, self-hostable Heroku/Netlify alternative.

This MCP server enables AI assistants like Claude to manage your Coolify infrastructure, including servers, projects, applications, databases, services, and more.

## Compatibility

Works with both:

- **Coolify Cloud** - [cloud.coolify.io](https://cloud.coolify.io)
- **Coolify Self-Hosted** - Any self-hosted Coolify instance (v4.x)

## Features

- **98 tools** covering the complete Coolify API
- Full CRUD operations for all Coolify resources
- Database backup management
- GitHub App integrations
- Deployment management and monitoring
- Environment variable management
- Works with Coolify Cloud and self-hosted instances
- Easy one-command installation via npx

## Installation

### Using npx (recommended)

```bash
npx coolify-mcp-tools
```

### Global installation

```bash
npm install -g coolify-mcp-tools
coolify-mcp
```

### From source

```bash
git clone https://github.com/jplansink/coolify-mcp-tools.git
cd coolify-mcp-tools
npm install
npm run build
```

## Configuration

### Environment Variables

| Variable               | Required | Description                                    |
| ---------------------- | -------- | ---------------------------------------------- |
| `COOLIFY_BASE_URL`     | Yes      | Your Coolify instance URL (see examples below) |
| `COOLIFY_ACCESS_TOKEN` | Yes      | API access token from Coolify                  |

**Base URL Examples:**

- Coolify Cloud: `https://app.coolify.io`
- Self-hosted: `https://coolify.yourdomain.com` (your Coolify URL)

### Getting Your Coolify Access Token

1. Log into your Coolify instance (Cloud or self-hosted)
2. Go to **Settings** > **API**
3. Enable the API if not already enabled
4. Click **Create New Token**
5. Give it a name (e.g., "MCP Server")
6. Copy the generated token

### Claude Desktop Configuration

Add this to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["coolify-mcp-tools"],
      "env": {
        "COOLIFY_BASE_URL": "https://your-coolify-instance.com",
        "COOLIFY_ACCESS_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

### Claude Code (CLI) Configuration

Add this to your Claude Code settings file:

**macOS/Linux**: `~/.claude/settings.json`
**Windows**: `%USERPROFILE%\.claude\settings.json`

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["coolify-mcp-tools"],
      "env": {
        "COOLIFY_BASE_URL": "https://your-coolify-instance.com",
        "COOLIFY_ACCESS_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

## Available Tools

### Servers (8 tools)

- `list_servers` - List all Coolify servers
- `get_server` - Get server details
- `create_server` - Create a new server
- `update_server` - Update server configuration
- `delete_server` - Delete a server
- `get_server_resources` - Get resources running on a server
- `get_server_domains` - Get domains configured on a server
- `validate_server` - Validate server connection

### Projects (9 tools)

- `list_projects` - List all projects
- `get_project` - Get project details
- `create_project` - Create a new project
- `update_project` - Update project
- `delete_project` - Delete a project
- `get_project_environment` - Get environment details
- `list_project_environments` - List all environments
- `create_project_environment` - Create new environment
- `delete_project_environment` - Delete an environment

### Applications (21 tools)

- `list_applications` - List all applications
- `get_application` - Get application details
- `create_public_application` - Create from public git repo
- `create_private_ghapp_application` - Create from private GitHub App repo
- `create_private_deploykey_application` - Create from private repo with deploy key
- `create_dockerfile_application` - Create from Dockerfile
- `create_dockerimage_application` - Create from Docker image
- `create_dockercompose_application` - Create from Docker Compose
- `update_application` - Update application
- `delete_application` - Delete application
- `start_application` - Start application
- `stop_application` - Stop application
- `restart_application` - Restart application
- `deploy_application` - Deploy application
- `get_application_logs` - Get application logs
- `execute_application_command` - Execute command in container
- `list_application_envs` - List environment variables
- `create_application_env` - Create environment variable
- `update_application_env` - Update environment variable
- `bulk_update_application_envs` - Bulk update environment variables
- `delete_application_env` - Delete environment variable

### Databases (21 tools)

- `list_databases` - List all databases
- `get_database` - Get database details
- `update_database` - Update database
- `delete_database` - Delete database
- `create_postgres_database` - Create PostgreSQL database
- `create_mysql_database` - Create MySQL database
- `create_mariadb_database` - Create MariaDB database
- `create_mongodb_database` - Create MongoDB database
- `create_redis_database` - Create Redis database
- `create_keydb_database` - Create KeyDB database
- `create_clickhouse_database` - Create Clickhouse database
- `create_dragonfly_database` - Create Dragonfly database
- `start_database` - Start database
- `stop_database` - Stop database
- `restart_database` - Restart database
- `list_database_backups` - List backup configurations
- `create_database_backup` - Create backup configuration
- `update_database_backup` - Update backup configuration
- `delete_database_backup` - Delete backup configuration
- `list_backup_executions` - List backup executions
- `delete_backup_execution` - Delete backup execution

### Services (16 tools)

- `list_services` - List all one-click services
- `get_service` - Get service details
- `create_service` - Create a one-click service (WordPress, n8n, etc.)
- `update_service` - Update service
- `delete_service` - Delete service
- `start_service` - Start service
- `stop_service` - Stop service
- `restart_service` - Restart service
- `list_service_envs` - List environment variables
- `create_service_env` - Create environment variable
- `update_service_env` - Update environment variable
- `bulk_update_service_envs` - Bulk update environment variables
- `delete_service_env` - Delete environment variable

### GitHub Apps (6 tools)

- `list_github_apps` - List GitHub App integrations
- `create_github_app` - Create GitHub App integration
- `update_github_app` - Update GitHub App
- `delete_github_app` - Delete GitHub App
- `list_github_app_repositories` - List accessible repositories
- `list_github_app_branches` - List repository branches

### Private Keys (5 tools)

- `list_private_keys` - List all private keys
- `get_private_key` - Get private key details
- `create_private_key` - Create a new private key
- `update_private_key` - Update private key
- `delete_private_key` - Delete private key

### Teams (5 tools)

- `list_teams` - List all teams
- `get_team` - Get team details
- `get_team_members` - Get team members
- `get_current_team` - Get current authenticated team
- `get_current_team_members` - Get current team members

### Deployments (5 tools)

- `list_deployments` - List running deployments
- `get_deployment` - Get deployment details
- `get_deployments_by_application` - Get deployments for an application
- `cancel_deployment` - Cancel a deployment
- `deploy` - Deploy by tag or UUID

### Utility (5 tools)

- `list_resources` - List all resources
- `get_version` - Get Coolify version
- `healthcheck` - Check API health
- `enable_api` - Enable Coolify API
- `disable_api` - Disable Coolify API

## Supported One-Click Services

The `create_service` tool supports 80+ one-click services including:

- **CMS**: WordPress, Ghost, Directus, Strapi
- **Automation**: n8n, Activepieces
- **Analytics**: Umami, Posthog, Metabase
- **Collaboration**: Nextcloud, Penpot, Mattermost
- **Development**: Gitea, Code Server, Docker Registry
- **Monitoring**: Uptime Kuma, Grafana, Glances
- **And many more...**

## Usage Examples

Once configured, you can ask Claude to:

- "List all my Coolify servers"
- "Create a new PostgreSQL database in my production project"
- "Deploy my application and show me the logs"
- "Set up a new WordPress site with MySQL"
- "Show me all running deployments"
- "Create a backup schedule for my database"

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Format code
npm run format
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [Coolify](https://coolify.io/) - The self-hosting platform
- [Coolify API Docs](https://coolify.io/docs/api-reference) - Official API documentation
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- [Claude Desktop](https://claude.ai/download) - AI assistant with MCP support
