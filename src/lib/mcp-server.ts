import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { CoolifyClient } from './coolify-client.js';
import debug from 'debug';
import { z } from 'zod';

const log = debug('coolify:mcp');

function sanitizeOutput(data: unknown): unknown {
  if (typeof data === 'string') {
    return data.replace(/\0/g, '').slice(0, 4096);
  }
  if (Array.isArray(data)) return data.map(sanitizeOutput);
  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([k, v]) => [k, sanitizeOutput(v)]),
    );
  }
  return data;
}

function validateCommand(command: string): void {
  if (/[;&|`$><\\]/.test(command)) {
    throw new Error('Command contains unsupported characters');
  }
}

// Service types list removed from schema to reduce token usage in MCP tool definitions.
// The valid service types are documented in Coolify's API and should be referenced there.
// Previously included: activepieces, appsmith, appwrite, authentik, n8n, wordpress-with-mysql, etc.

// Build pack types: nixpacks, static, dockerfile, dockercompose
// Proxy types: traefik, caddy, none
// Redirect types: www, non-www, both

// Common schemas
const deleteOptionsSchema = {
  deleteConfigurations: z.boolean().optional(),
  deleteVolumes: z.boolean().optional(),
  dockerCleanup: z.boolean().optional(),
  deleteConnectedNetworks: z.boolean().optional(),
};

const envVarSchema = {
  key: z.string().describe('The key of the environment variable'),
  value: z.string().describe('The value of the environment variable'),
  is_preview: z.boolean().optional().describe('Use in preview deployments'),
  is_build_time: z.boolean().optional().describe('Use at build time'),
  is_literal: z.boolean().optional().describe('Literal value (nothing escaped)'),
  is_multiline: z.boolean().optional().describe('Multiline value'),
  is_shown_once: z.boolean().optional().describe('Show value on UI'),
};

export class CoolifyMcpServer extends McpServer {
  private client: CoolifyClient;

  constructor(config: { baseUrl: string; accessToken: string }) {
    super({
      name: 'coolify-mcp-tools',
      version: '1.1.0',
    });

    log('Initializing server with config: %o', config);
    this.client = new CoolifyClient(config);
  }

  async initialize(): Promise<void> {
    await this.server.registerCapabilities({ tools: {} });

    // ============ SERVER TOOLS ============

    this.tool('list_servers', 'List all Coolify servers', {}, async () => {
      const servers = await this.client.listServers();
      return { content: [{ type: 'text', text: JSON.stringify(servers) }] };
    });

    this.tool(
      'get_server',
      'Get details about a specific Coolify server',
      {
        uuid: z.string().describe('UUID of the server'),
      },
      async (args) => {
        const server = await this.client.getServer(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(server) }] };
      },
    );

    this.tool(
      'create_server',
      'Create a new Coolify server',
      {
        ip: z.string().describe('Server IP address'),
        private_key_uuid: z.string().describe('UUID of the private key for SSH'),
        name: z.string().optional().describe('Server name'),
        description: z.string().optional(),
        port: z.number().optional().describe('SSH port (default 22)'),
        user: z.string().optional().describe('SSH user (default root)'),
        is_build_server: z.boolean().optional(),
        instant_validate: z.boolean().optional(),
        proxy_type: z.string().describe('Proxy type: traefik, caddy, or none').optional(),
      },
      async (args) => {
        const result = await this.client.createServer(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'update_server',
      'Update a Coolify server',
      {
        uuid: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        ip: z.string().optional(),
        port: z.number().optional(),
        user: z.string().optional(),
        private_key_uuid: z.string().optional(),
        is_build_server: z.boolean().optional(),
        proxy_type: z.string().describe('Proxy type: traefik, caddy, or none').optional(),
      },
      async (args) => {
        const { uuid, ...data } = args;
        const result = await this.client.updateServer(uuid, data);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'delete_server',
      'Delete a Coolify server',
      {
        uuid: z.string(),
        confirm: z.literal(true).describe('Must be set to true to confirm this destructive operation'),
      },
      async (args) => {
        const result = await this.client.deleteServer(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(result)) }] };
      },
    );

    this.tool(
      'get_server_resources',
      'Get resources running on a server',
      {
        uuid: z.string(),
      },
      async (args) => {
        const resources = await this.client.getServerResources(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(resources) }] };
      },
    );

    this.tool(
      'get_server_domains',
      'Get domains for a server',
      {
        uuid: z.string(),
      },
      async (args) => {
        const domains = await this.client.getServerDomains(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(domains) }] };
      },
    );

    this.tool(
      'validate_server',
      'Validate a server connection',
      {
        uuid: z.string(),
      },
      async (args) => {
        const validation = await this.client.validateServer(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(validation) }] };
      },
    );

    // ============ PROJECT TOOLS ============

    this.tool('list_projects', 'List all Coolify projects', {}, async () => {
      const projects = await this.client.listProjects();
      return { content: [{ type: 'text', text: JSON.stringify(projects) }] };
    });

    this.tool(
      'get_project',
      'Get project details',
      {
        uuid: z.string(),
      },
      async (args) => {
        const project = await this.client.getProject(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(project) }] };
      },
    );

    this.tool(
      'create_project',
      'Create a new project',
      {
        name: z.string(),
        description: z.string().optional(),
      },
      async (args) => {
        const result = await this.client.createProject(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'update_project',
      'Update a project',
      {
        uuid: z.string(),
        name: z.string(),
        description: z.string().optional(),
      },
      async (args) => {
        const { uuid, ...data } = args;
        const result = await this.client.updateProject(uuid, data);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'delete_project',
      'Delete a project',
      {
        uuid: z.string(),
        confirm: z.literal(true).describe('Must be set to true to confirm this destructive operation'),
      },
      async (args) => {
        const result = await this.client.deleteProject(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(result)) }] };
      },
    );

    this.tool(
      'get_project_environment',
      'Get project environment details',
      {
        project_uuid: z.string(),
        environment_name_or_uuid: z.string(),
      },
      async (args) => {
        const env = await this.client.getProjectEnvironment(
          args.project_uuid,
          args.environment_name_or_uuid,
        );
        return { content: [{ type: 'text', text: JSON.stringify(env) }] };
      },
    );

    this.tool(
      'list_project_environments',
      'List all environments for a project',
      {
        project_uuid: z.string(),
      },
      async (args) => {
        const envs = await this.client.listProjectEnvironments(args.project_uuid);
        return { content: [{ type: 'text', text: JSON.stringify(envs) }] };
      },
    );

    this.tool(
      'create_project_environment',
      'Create a new environment for a project',
      {
        project_uuid: z.string(),
        name: z.string().describe('Environment name'),
      },
      async (args) => {
        const result = await this.client.createProjectEnvironment(args.project_uuid, {
          name: args.name,
        });
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'delete_project_environment',
      'Delete a project environment',
      {
        project_uuid: z.string(),
        environment_name_or_uuid: z.string(),
        confirm: z.literal(true).describe('Must be set to true to confirm this destructive operation'),
      },
      async (args) => {
        const result = await this.client.deleteProjectEnvironment(
          args.project_uuid,
          args.environment_name_or_uuid,
        );
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(result)) }] };
      },
    );

    // ============ APPLICATION TOOLS ============

    this.tool('list_applications', 'List all applications', {}, async () => {
      const apps = await this.client.listApplications();
      return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(apps)) }] };
    });

    this.tool(
      'get_application',
      'Get application details',
      {
        uuid: z.string(),
      },
      async (args) => {
        const app = await this.client.getApplication(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(app)) }] };
      },
    );

    this.tool(
      'create_public_application',
      'Create application from public git repository',
      {
        project_uuid: z.string(),
        server_uuid: z.string(),
        git_repository: z.string().describe('Public git repository URL'),
        git_branch: z.string(),
        build_pack: z.string().describe('Build pack type: nixpacks, static, dockerfile, or dockercompose'),
        ports_exposes: z.string().describe('Ports to expose (e.g., "3000")'),
        environment_name: z.string().optional(),
        environment_uuid: z.string().optional(),
        destination_uuid: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        domains: z.string().optional(),
        instant_deploy: z.boolean().optional(),
      },
      async (args) => {
        const result = await this.client.createPublicApplication(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'create_private_ghapp_application',
      'Create application from private GitHub App repository',
      {
        project_uuid: z.string(),
        server_uuid: z.string(),
        github_app_uuid: z.string(),
        git_repository: z.string(),
        git_branch: z.string(),
        build_pack: z.string().describe('Build pack type: nixpacks, static, dockerfile, or dockercompose'),
        ports_exposes: z.string(),
        environment_name: z.string().optional(),
        environment_uuid: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        instant_deploy: z.boolean().optional(),
      },
      async (args) => {
        const result = await this.client.createPrivateGHAppApplication(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'create_private_deploykey_application',
      'Create application from private repository using deploy key',
      {
        project_uuid: z.string(),
        server_uuid: z.string(),
        private_key_uuid: z.string(),
        git_repository: z.string(),
        git_branch: z.string(),
        build_pack: z.string().describe('Build pack type: nixpacks, static, dockerfile, or dockercompose'),
        ports_exposes: z.string(),
        environment_name: z.string().optional(),
        environment_uuid: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        instant_deploy: z.boolean().optional(),
      },
      async (args) => {
        const result = await this.client.createPrivateDeployKeyApplication(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'create_dockerfile_application',
      'Create application from Dockerfile',
      {
        project_uuid: z.string(),
        server_uuid: z.string(),
        dockerfile: z.string().describe('Dockerfile content'),
        environment_name: z.string().optional(),
        environment_uuid: z.string().optional(),
        ports_exposes: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        domains: z.string().optional(),
        instant_deploy: z.boolean().optional(),
      },
      async (args) => {
        const result = await this.client.createDockerfileApplication(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'create_dockerimage_application',
      'Create application from Docker image',
      {
        project_uuid: z.string(),
        server_uuid: z.string(),
        docker_registry_image_name: z.string().describe('Docker image name (e.g., nginx:latest)'),
        ports_exposes: z.string(),
        environment_name: z.string().optional(),
        environment_uuid: z.string().optional(),
        docker_registry_image_tag: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        domains: z.string().optional(),
        instant_deploy: z.boolean().optional(),
      },
      async (args) => {
        const result = await this.client.createDockerImageApplication(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'create_dockercompose_application',
      'Create application from Docker Compose',
      {
        project_uuid: z.string(),
        server_uuid: z.string(),
        docker_compose_raw: z.string().describe('Docker Compose YAML content'),
        environment_name: z.string().optional(),
        environment_uuid: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        instant_deploy: z.boolean().optional(),
      },
      async (args) => {
        const result = await this.client.createDockerComposeApplication(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'update_application',
      'Update an application',
      {
        uuid: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        domains: z.string().optional(),
        git_repository: z.string().optional(),
        git_branch: z.string().optional(),
        build_pack: z.string().describe('Build pack type: nixpacks, static, dockerfile, or dockercompose').optional(),
        install_command: z.string().optional(),
        build_command: z.string().optional(),
        start_command: z.string().optional(),
        ports_exposes: z.string().optional(),
        base_directory: z.string().optional(),
        publish_directory: z.string().optional(),
        dockerfile: z.string().optional(),
        docker_compose_raw: z.string().optional(),
        instant_deploy: z.boolean().optional(),
      },
      async (args) => {
        const { uuid, domains, ...rest } = args;
        const data = { ...rest, fqdn: domains };
        const result = await this.client.updateApplication(uuid, data);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'delete_application',
      'Delete an application',
      {
        uuid: z.string(),
        confirm: z.literal(true).describe('Must be set to true to confirm this destructive operation'),
        delete_configurations: z.boolean().optional(),
        delete_volumes: z.boolean().optional(),
        docker_cleanup: z.boolean().optional(),
        delete_connected_networks: z.boolean().optional(),
      },
      async (args) => {
        const { uuid, confirm: _confirm, ...options } = args;
        const result = await this.client.deleteApplication(uuid, options);
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(result)) }] };
      },
    );

    this.tool(
      'start_application',
      'Start an application',
      {
        uuid: z.string(),
        force: z.boolean().optional().describe('Force rebuild'),
        instant_deploy: z.boolean().optional().describe('Skip queuing'),
      },
      async (args) => {
        const { uuid, ...options } = args;
        const result = await this.client.startApplication(uuid, options);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'stop_application',
      'Stop an application',
      {
        uuid: z.string(),
      },
      async (args) => {
        const result = await this.client.stopApplication(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'restart_application',
      'Restart an application',
      {
        uuid: z.string(),
      },
      async (args) => {
        const result = await this.client.restartApplication(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'deploy_application',
      'Deploy an application',
      {
        uuid: z.string(),
      },
      async (args) => {
        const result = await this.client.deployApplication(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'get_application_logs',
      'Get application logs',
      {
        uuid: z.string().describe('Application UUID'),
      },
      async (args) => {
        const logs = await this.client.getApplicationLogs(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(logs)) }] };
      },
    );

    this.tool(
      'execute_application_command',
      'Execute a command in application container',
      {
        uuid: z.string(),
        command: z.string().describe('Command to execute'),
      },
      async (args) => {
        validateCommand(args.command);
        const result = await this.client.executeApplicationCommand(args.uuid, args.command);
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(result)) }] };
      },
    );

    // ============ APPLICATION ENVIRONMENT VARIABLE TOOLS ============

    this.tool(
      'list_application_envs',
      'List application environment variables',
      {
        uuid: z.string().describe('Application UUID'),
      },
      async (args) => {
        const envs = await this.client.listApplicationEnvs(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(envs)) }] };
      },
    );

    this.tool(
      'create_application_env',
      'Create application environment variable',
      {
        uuid: z.string().describe('Application UUID'),
        ...envVarSchema,
      },
      async (args) => {
        const { uuid, ...data } = args;
        const result = await this.client.createApplicationEnv(uuid, data);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'update_application_env',
      'Update application environment variable',
      {
        uuid: z.string().describe('Application UUID'),
        ...envVarSchema,
      },
      async (args) => {
        const { uuid, ...data } = args;
        const result = await this.client.updateApplicationEnv(uuid, data);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'bulk_update_application_envs',
      'Bulk update application environment variables',
      {
        uuid: z.string().describe('Application UUID'),
        data: z.array(z.object(envVarSchema)).describe('Array of environment variables'),
      },
      async (args) => {
        const result = await this.client.bulkUpdateApplicationEnvs(args.uuid, { data: args.data });
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'delete_application_env',
      'Delete application environment variable',
      {
        uuid: z.string().describe('Application UUID'),
        env_uuid: z.string().describe('Environment variable UUID'),
      },
      async (args) => {
        const result = await this.client.deleteApplicationEnv(args.uuid, args.env_uuid);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ============ DATABASE TOOLS ============

    this.tool('list_databases', 'List all databases', {}, async () => {
      const databases = await this.client.listDatabases();
      return { content: [{ type: 'text', text: JSON.stringify(databases) }] };
    });

    this.tool(
      'get_database',
      'Get database details',
      {
        uuid: z.string(),
      },
      async (args) => {
        const database = await this.client.getDatabase(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(database) }] };
      },
    );

    this.tool(
      'update_database',
      'Update a database',
      {
        uuid: z.string(),
        data: z.record(z.unknown()).describe('Database update fields'),
      },
      async (args) => {
        const result = await this.client.updateDatabase(args.uuid, args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'delete_database',
      'Delete a database',
      {
        uuid: z.string(),
        confirm: z.literal(true).describe('Must be set to true to confirm this destructive operation'),
        options: z.object(deleteOptionsSchema).optional(),
      },
      async (args) => {
        const result = await this.client.deleteDatabase(args.uuid, args.options);
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(result)) }] };
      },
    );

    // Database creation tools
    const dbBaseSchema = {
      project_uuid: z.string(),
      server_uuid: z.string(),
      environment_name: z.string().optional(),
      environment_uuid: z.string().optional(),
      destination_uuid: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      is_public: z.boolean().optional(),
      public_port: z.number().optional(),
      instant_deploy: z.boolean().optional(),
    };

    this.tool(
      'create_postgres_database',
      'Create a PostgreSQL database',
      {
        ...dbBaseSchema,
        postgres_user: z.string().optional(),
        postgres_password: z.string().optional(),
        postgres_db: z.string().optional(),
      },
      async (args) => {
        const result = await this.client.createPostgresDatabase(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'create_mysql_database',
      'Create a MySQL database',
      {
        ...dbBaseSchema,
        mysql_root_password: z.string().optional(),
        mysql_user: z.string().optional(),
        mysql_password: z.string().optional(),
        mysql_database: z.string().optional(),
      },
      async (args) => {
        const result = await this.client.createMySQLDatabase(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'create_mariadb_database',
      'Create a MariaDB database',
      {
        ...dbBaseSchema,
        mariadb_root_password: z.string().optional(),
        mariadb_user: z.string().optional(),
        mariadb_password: z.string().optional(),
        mariadb_database: z.string().optional(),
      },
      async (args) => {
        const result = await this.client.createMariaDBDatabase(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'create_mongodb_database',
      'Create a MongoDB database',
      {
        ...dbBaseSchema,
        mongo_initdb_root_username: z.string().optional(),
        mongo_initdb_root_password: z.string().optional(),
        mongo_initdb_database: z.string().optional(),
      },
      async (args) => {
        const result = await this.client.createMongoDBDatabase(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'create_redis_database',
      'Create a Redis database',
      {
        ...dbBaseSchema,
        redis_password: z.string().optional(),
      },
      async (args) => {
        const result = await this.client.createRedisDatabase(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'create_keydb_database',
      'Create a KeyDB database',
      {
        ...dbBaseSchema,
        keydb_password: z.string().optional(),
      },
      async (args) => {
        const result = await this.client.createKeyDBDatabase(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'create_clickhouse_database',
      'Create a Clickhouse database',
      {
        ...dbBaseSchema,
        clickhouse_admin_user: z.string().optional(),
        clickhouse_admin_password: z.string().optional(),
      },
      async (args) => {
        const result = await this.client.createClickhouseDatabase(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'create_dragonfly_database',
      'Create a Dragonfly database',
      {
        ...dbBaseSchema,
        dragonfly_password: z.string().optional(),
      },
      async (args) => {
        const result = await this.client.createDragonflyDatabase(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // Database lifecycle tools
    this.tool(
      'start_database',
      'Start a database',
      {
        uuid: z.string().describe('Database UUID'),
      },
      async (args) => {
        const result = await this.client.startDatabase(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'stop_database',
      'Stop a database',
      {
        uuid: z.string().describe('Database UUID'),
      },
      async (args) => {
        const result = await this.client.stopDatabase(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'restart_database',
      'Restart a database',
      {
        uuid: z.string().describe('Database UUID'),
      },
      async (args) => {
        const result = await this.client.restartDatabase(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // Database backup tools
    this.tool(
      'list_database_backups',
      'List scheduled backups for a database',
      {
        uuid: z.string().describe('Database UUID'),
      },
      async (args) => {
        const backups = await this.client.listDatabaseBackups(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(backups) }] };
      },
    );

    this.tool(
      'create_database_backup',
      'Create a scheduled backup configuration for a database',
      {
        uuid: z.string().describe('Database UUID'),
        frequency: z.string().describe('Backup frequency (cron expression)'),
        enabled: z.boolean().optional().describe('Enable the backup schedule'),
        save_s3: z.boolean().optional().describe('Save backup to S3'),
        s3_storage_id: z.number().optional().describe('S3 storage ID'),
        databases_to_backup: z.string().optional().describe('Specific databases to backup'),
      },
      async (args) => {
        const { uuid, ...data } = args;
        const result = await this.client.createDatabaseBackup(uuid, data);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'update_database_backup',
      'Update a scheduled backup configuration',
      {
        uuid: z.string().describe('Database UUID'),
        backup_uuid: z.string().describe('Backup configuration UUID'),
        frequency: z.string().optional().describe('Backup frequency (cron expression)'),
        enabled: z.boolean().optional().describe('Enable the backup schedule'),
        save_s3: z.boolean().optional().describe('Save backup to S3'),
        s3_storage_id: z.number().optional().describe('S3 storage ID'),
        databases_to_backup: z.string().optional().describe('Specific databases to backup'),
      },
      async (args) => {
        const { uuid, backup_uuid, ...data } = args;
        const result = await this.client.updateDatabaseBackup(uuid, backup_uuid, data);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'delete_database_backup',
      'Delete a scheduled backup configuration',
      {
        uuid: z.string().describe('Database UUID'),
        backup_uuid: z.string().describe('Backup configuration UUID'),
      },
      async (args) => {
        const result = await this.client.deleteDatabaseBackup(args.uuid, args.backup_uuid);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'list_backup_executions',
      'List backup executions for a scheduled backup',
      {
        uuid: z.string().describe('Database UUID'),
        backup_uuid: z.string().describe('Backup configuration UUID'),
      },
      async (args) => {
        const executions = await this.client.listBackupExecutions(args.uuid, args.backup_uuid);
        return { content: [{ type: 'text', text: JSON.stringify(executions) }] };
      },
    );

    this.tool(
      'delete_backup_execution',
      'Delete a specific backup execution',
      {
        uuid: z.string().describe('Database UUID'),
        backup_uuid: z.string().describe('Backup configuration UUID'),
        execution_uuid: z.string().describe('Backup execution UUID'),
      },
      async (args) => {
        const result = await this.client.deleteBackupExecution(
          args.uuid,
          args.backup_uuid,
          args.execution_uuid,
        );
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ============ SERVICE TOOLS ============

    this.tool('list_services', 'List all one-click services', {}, async () => {
      const services = await this.client.listServices();
      return { content: [{ type: 'text', text: JSON.stringify(services) }] };
    });

    this.tool(
      'get_service',
      'Get service details',
      {
        uuid: z.string(),
      },
      async (args) => {
        const service = await this.client.getService(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(service) }] };
      },
    );

    this.tool(
      'create_service',
      'Create a one-click service (e.g., penpot, n8n, wordpress)',
      {
        type: z
          .string()
          .describe('Service type - must be a valid Coolify service type (e.g., penpot, n8n, wordpress-with-mysql, activepieces, appwrite, etc.). See Coolify documentation for full list.'),
        project_uuid: z.string(),
        server_uuid: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        environment_name: z.string().optional(),
        environment_uuid: z.string().optional(),
        destination_uuid: z.string().optional(),
        instant_deploy: z.boolean().optional(),
      },
      async (args) => {
        const result = await this.client.createService(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'update_service',
      'Update a service',
      {
        uuid: z.string().describe('Service UUID'),
        name: z.string().optional(),
        description: z.string().optional(),
        domains: z.string().optional().describe('Service domains'),
        instant_deploy: z.boolean().optional(),
      },
      async (args) => {
        const { uuid, ...data } = args;
        const result = await this.client.updateService(uuid, data);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'delete_service',
      'Delete a service',
      {
        uuid: z.string(),
        confirm: z.literal(true).describe('Must be set to true to confirm this destructive operation'),
        options: z.object(deleteOptionsSchema).optional(),
      },
      async (args) => {
        const result = await this.client.deleteService(args.uuid, args.options);
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(result)) }] };
      },
    );

    this.tool(
      'start_service',
      'Start a service',
      {
        uuid: z.string(),
      },
      async (args) => {
        const result = await this.client.startService(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'stop_service',
      'Stop a service',
      {
        uuid: z.string(),
      },
      async (args) => {
        const result = await this.client.stopService(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'restart_service',
      'Restart a service',
      {
        uuid: z.string(),
      },
      async (args) => {
        const result = await this.client.restartService(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ============ SERVICE ENVIRONMENT VARIABLE TOOLS ============

    this.tool(
      'list_service_envs',
      'List service environment variables',
      {
        uuid: z.string().describe('Service UUID'),
      },
      async (args) => {
        const envs = await this.client.listServiceEnvs(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(envs)) }] };
      },
    );

    this.tool(
      'create_service_env',
      'Create service environment variable',
      {
        uuid: z.string().describe('Service UUID'),
        ...envVarSchema,
      },
      async (args) => {
        const { uuid, ...data } = args;
        const result = await this.client.createServiceEnv(uuid, data);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'update_service_env',
      'Update service environment variable',
      {
        uuid: z.string().describe('Service UUID'),
        ...envVarSchema,
      },
      async (args) => {
        const { uuid, ...data } = args;
        const result = await this.client.updateServiceEnv(uuid, data);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'bulk_update_service_envs',
      'Bulk update service environment variables',
      {
        uuid: z.string().describe('Service UUID'),
        data: z.array(z.object(envVarSchema)).describe('Array of environment variables'),
      },
      async (args) => {
        const result = await this.client.bulkUpdateServiceEnvs(args.uuid, { data: args.data });
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'delete_service_env',
      'Delete service environment variable',
      {
        uuid: z.string().describe('Service UUID'),
        env_uuid: z.string().describe('Environment variable UUID'),
      },
      async (args) => {
        const result = await this.client.deleteServiceEnv(args.uuid, args.env_uuid);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ============ PRIVATE KEY TOOLS ============

    this.tool('list_private_keys', 'List all private keys', {}, async () => {
      const keys = await this.client.listPrivateKeys();
      return { content: [{ type: 'text', text: JSON.stringify(keys) }] };
    });

    this.tool(
      'get_private_key',
      'Get private key details',
      {
        uuid: z.string(),
      },
      async (args) => {
        const key = await this.client.getPrivateKey(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(key) }] };
      },
    );

    this.tool(
      'create_private_key',
      'Create a new private key',
      {
        private_key: z.string().describe('The private key content'),
        name: z.string().optional(),
        description: z.string().optional(),
      },
      async (args) => {
        const result = await this.client.createPrivateKey(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'delete_private_key',
      'Delete a private key',
      {
        uuid: z.string(),
        confirm: z.literal(true).describe('Must be set to true to confirm this destructive operation'),
      },
      async (args) => {
        const result = await this.client.deletePrivateKey(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(result)) }] };
      },
    );

    this.tool(
      'update_private_key',
      'Update a private key',
      {
        name: z.string().optional(),
        description: z.string().optional(),
        private_key: z.string().describe('The private key content'),
      },
      async (args) => {
        const result = await this.client.updatePrivateKey(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ============ GITHUB APP TOOLS ============

    this.tool('list_github_apps', 'List all GitHub Apps', {}, async () => {
      const apps = await this.client.listGitHubApps();
      return { content: [{ type: 'text', text: JSON.stringify(apps) }] };
    });

    this.tool(
      'create_github_app',
      'Create a new GitHub App integration',
      {
        name: z.string().describe('GitHub App name'),
        organization: z.string().optional().describe('GitHub organization'),
        app_id: z.number().describe('GitHub App ID'),
        installation_id: z.number().describe('GitHub App installation ID'),
        client_id: z.string().describe('GitHub App client ID'),
        client_secret: z.string().describe('GitHub App client secret'),
        webhook_secret: z.string().describe('GitHub App webhook secret'),
        private_key: z.string().describe('GitHub App private key'),
        is_system_wide: z.boolean().optional().describe('Make available system-wide'),
      },
      async (args) => {
        const result = await this.client.createGitHubApp(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'update_github_app',
      'Update a GitHub App integration',
      {
        id: z.number().describe('GitHub App ID in Coolify'),
        name: z.string().optional(),
        organization: z.string().optional(),
        app_id: z.number().optional(),
        installation_id: z.number().optional(),
        client_id: z.string().optional(),
        client_secret: z.string().optional(),
        webhook_secret: z.string().optional(),
        private_key: z.string().optional(),
        is_system_wide: z.boolean().optional(),
      },
      async (args) => {
        const { id, ...data } = args;
        const result = await this.client.updateGitHubApp(id, data);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'delete_github_app',
      'Delete a GitHub App integration',
      {
        id: z.number().describe('GitHub App ID in Coolify'),
        confirm: z.literal(true).describe('Must be set to true to confirm this destructive operation'),
      },
      async (args) => {
        const result = await this.client.deleteGitHubApp(args.id);
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(result)) }] };
      },
    );

    this.tool(
      'list_github_app_repositories',
      'List repositories accessible by a GitHub App',
      {
        id: z.number().describe('GitHub App ID in Coolify'),
      },
      async (args) => {
        const repos = await this.client.listGitHubAppRepositories(args.id);
        return { content: [{ type: 'text', text: JSON.stringify(repos, null, 2) }] };
      },
    );

    this.tool(
      'list_github_app_branches',
      'List branches for a repository accessible by a GitHub App',
      {
        id: z.number().describe('GitHub App ID in Coolify'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
      },
      async (args) => {
        const branches = await this.client.listGitHubAppBranches(args.id, args.owner, args.repo);
        return { content: [{ type: 'text', text: JSON.stringify(branches, null, 2) }] };
      },
    );

    // ============ TEAM TOOLS ============

    this.tool('list_teams', 'List all teams', {}, async () => {
      const teams = await this.client.listTeams();
      return { content: [{ type: 'text', text: JSON.stringify(teams, null, 2) }] };
    });

    this.tool(
      'get_team',
      'Get team details',
      {
        id: z.number().describe('Team ID'),
      },
      async (args) => {
        const team = await this.client.getTeam(args.id);
        return { content: [{ type: 'text', text: JSON.stringify(team, null, 2) }] };
      },
    );

    this.tool(
      'get_team_members',
      'Get team members',
      {
        id: z.number().describe('Team ID'),
      },
      async (args) => {
        const members = await this.client.getTeamMembers(args.id);
        return { content: [{ type: 'text', text: JSON.stringify(members, null, 2) }] };
      },
    );

    this.tool('get_current_team', 'Get currently authenticated team', {}, async () => {
      const team = await this.client.getCurrentTeam();
      return { content: [{ type: 'text', text: JSON.stringify(team, null, 2) }] };
    });

    this.tool(
      'get_current_team_members',
      'Get members of currently authenticated team',
      {},
      async () => {
        const members = await this.client.getCurrentTeamMembers();
        return { content: [{ type: 'text', text: JSON.stringify(members, null, 2) }] };
      },
    );

    // ============ DEPLOYMENT TOOLS ============

    this.tool('list_deployments', 'List currently running deployments', {}, async () => {
      const deployments = await this.client.listDeployments();
      return { content: [{ type: 'text', text: JSON.stringify(deployments, null, 2) }] };
    });

    this.tool(
      'get_deployment',
      'Get deployment details',
      {
        uuid: z.string(),
      },
      async (args) => {
        const deployment = await this.client.getDeployment(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(deployment, null, 2) }] };
      },
    );

    this.tool(
      'get_deployments_by_application',
      'Get all deployments for a specific application',
      {
        uuid: z.string().describe('Application UUID'),
      },
      async (args) => {
        const deployments = await this.client.getDeploymentsByApplication(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(deployments, null, 2) }] };
      },
    );

    this.tool(
      'cancel_deployment',
      'Cancel a running deployment',
      {
        uuid: z.string().describe('Deployment UUID'),
      },
      async (args) => {
        const result = await this.client.cancelDeployment(args.uuid);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    this.tool(
      'deploy',
      'Deploy by tag or UUID (can deploy multiple resources)',
      {
        tag: z.string().optional().describe('Tag name(s), comma separated'),
        uuid: z.string().optional().describe('Resource UUID(s), comma separated'),
        force: z.boolean().optional().describe('Force rebuild without cache'),
      },
      async (args) => {
        const result = await this.client.deploy(args);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ============ UTILITY TOOLS ============

    this.tool('list_resources', 'List all resources', {}, async () => {
      const resources = await this.client.listResources();
      return { content: [{ type: 'text', text: JSON.stringify(resources) }] };
    });

    this.tool('get_version', 'Get Coolify version', {}, async () => {
      const version = await this.client.getVersion();
      return { content: [{ type: 'text', text: JSON.stringify({ version }, null, 2) }] };
    });

    this.tool('healthcheck', 'Check Coolify API health', {}, async () => {
      const health = await this.client.healthcheck();
      return { content: [{ type: 'text', text: JSON.stringify({ status: health }, null, 2) }] };
    });

    this.tool('enable_api', 'Enable the Coolify API', {}, async () => {
      const result = await this.client.enableApi();
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    });

    this.tool(
      'disable_api',
      'Disable the Coolify API',
      {
        confirm: z.literal(true).describe('Must be set to true to confirm this destructive operation'),
      },
      async () => {
        const result = await this.client.disableApi();
        return { content: [{ type: 'text', text: JSON.stringify(sanitizeOutput(result)) }] };
      },
    );
  }

  async connect(transport: Transport): Promise<void> {
    log('Starting server...');
    log('Validating connection...');
    await this.client.validateConnection();
    await this.initialize();
    await super.connect(transport);
    log('Server started successfully');
  }
}
