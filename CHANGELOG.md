# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-11

### Added

- Initial public release with 98 tools covering the complete Coolify API
- **Server Management**: List, create, update, delete servers; get resources and domains; validate connections
- **Project Management**: Full CRUD for projects and environments
- **Application Management**: Support for public repos, private GitHub Apps, deploy keys, Dockerfile, Docker images, and Docker Compose
- **Application Lifecycle**: Start, stop, restart, deploy applications; execute commands in containers
- **Application Logs**: Retrieve application logs
- **Environment Variables**: Full management for applications and services with bulk update support
- **Database Management**: Create and manage PostgreSQL, MySQL, MariaDB, MongoDB, Redis, KeyDB, Clickhouse, and Dragonfly databases
- **Database Lifecycle**: Start, stop, restart databases
- **Database Backups**: Create, update, delete backup configurations; manage backup executions
- **One-Click Services**: Deploy 80+ services including WordPress, n8n, Nextcloud, Grafana, and more
- **Service Management**: Full lifecycle control and environment variable management
- **GitHub App Integration**: Manage GitHub Apps, list repositories and branches
- **Private Key Management**: Create, update, delete SSH keys for deployments
- **Team Management**: List teams and members
- **Deployment Management**: List, monitor, and cancel deployments; deploy by tag or UUID
- **API Control**: Enable/disable API, health checks, version info

### Technical

- Built with TypeScript and the official MCP SDK
- Comprehensive type definitions for all Coolify API responses
- Zod schema validation for all tool inputs
- Debug logging support via the `debug` package
