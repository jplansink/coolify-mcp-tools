export interface CoolifyConfig {
  baseUrl: string;
  accessToken: string;
}

export interface ServerInfo {
  uuid: string;
  name: string;
  description?: string;
  ip?: string;
  port?: number;
  user?: string;
  private_key_uuid?: string;
  is_build_server?: boolean;
  proxy_type?: 'traefik' | 'caddy' | 'none';
  status: 'running' | 'stopped' | 'error';
  version: string;
  resources: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export interface ResourceStatus {
  id: number;
  uuid: string;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export type ServerResources = ResourceStatus[];

export interface ErrorResponse {
  error: string;
  status: number;
  message: string;
}

export interface ServerDomain {
  ip: string;
  domains: string[];
}

export interface ValidationResponse {
  message: string;
}

export interface Environment {
  id: number;
  uuid: string;
  name: string;
  project_uuid: string;
  variables?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  environments?: Environment[];
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

export interface Deployment {
  id: number;
  uuid: string;
  application_uuid: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ============ APPLICATION TYPES ============

export type BuildPack = 'nixpacks' | 'static' | 'dockerfile' | 'dockercompose';

export interface Application {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  fqdn?: string;
  git_repository?: string;
  git_branch?: string;
  git_commit_sha?: string;
  git_full_url?: string;
  docker_registry_image_name?: string;
  docker_registry_image_tag?: string;
  build_pack: BuildPack;
  static_image?: string;
  install_command?: string;
  build_command?: string;
  start_command?: string;
  ports_exposes?: string;
  ports_mappings?: string;
  base_directory?: string;
  publish_directory?: string;
  health_check_enabled?: boolean;
  health_check_path?: string;
  health_check_port?: string;
  health_check_host?: string;
  health_check_method?: string;
  health_check_return_code?: number;
  health_check_scheme?: string;
  health_check_response_text?: string;
  health_check_interval?: number;
  health_check_timeout?: number;
  health_check_retries?: number;
  health_check_start_period?: number;
  limits_memory?: string;
  limits_memory_swap?: string;
  limits_memory_swappiness?: number;
  limits_memory_reservation?: string;
  limits_cpus?: string;
  limits_cpuset?: string;
  limits_cpu_shares?: number;
  status?: string;
  destination_type?: string;
  destination_id?: number;
  source_id?: number;
  environment_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePublicApplicationRequest {
  project_uuid: string;
  server_uuid: string;
  environment_name?: string;
  environment_uuid?: string;
  git_repository: string;
  git_branch: string;
  build_pack: BuildPack;
  ports_exposes: string;
  destination_uuid?: string;
  name?: string;
  description?: string;
  domains?: string;
  git_commit_sha?: string;
  docker_registry_image_name?: string;
  docker_registry_image_tag?: string;
  is_static?: boolean;
  static_image?: string;
  install_command?: string;
  build_command?: string;
  start_command?: string;
  ports_mappings?: string;
  base_directory?: string;
  publish_directory?: string;
  health_check_enabled?: boolean;
  health_check_path?: string;
  health_check_port?: string;
  health_check_host?: string;
  health_check_method?: string;
  health_check_return_code?: number;
  health_check_scheme?: string;
  health_check_response_text?: string;
  health_check_interval?: number;
  health_check_timeout?: number;
  health_check_retries?: number;
  health_check_start_period?: number;
  limits_memory?: string;
  limits_memory_swap?: string;
  limits_memory_swappiness?: number;
  limits_memory_reservation?: string;
  limits_cpus?: string;
  limits_cpuset?: string;
  limits_cpu_shares?: number;
  custom_labels?: string;
  custom_docker_run_options?: string;
  post_deployment_command?: string;
  post_deployment_command_container?: string;
  pre_deployment_command?: string;
  pre_deployment_command_container?: string;
  redirect?: 'www' | 'non-www' | 'both';
  instant_deploy?: boolean;
  dockerfile?: string;
  docker_compose_location?: string;
  docker_compose_raw?: string;
  docker_compose_custom_start_command?: string;
  docker_compose_custom_build_command?: string;
  docker_compose_domains?: string[];
  watch_paths?: string;
  use_build_server?: boolean;
}

export interface CreatePrivateGHAppApplicationRequest extends CreatePublicApplicationRequest {
  github_app_uuid: string;
}

export interface CreatePrivateDeployKeyApplicationRequest extends CreatePublicApplicationRequest {
  private_key_uuid: string;
}

export interface CreateDockerfileApplicationRequest {
  project_uuid: string;
  server_uuid: string;
  environment_name?: string;
  environment_uuid?: string;
  dockerfile: string;
  build_pack?: BuildPack;
  ports_exposes?: string;
  destination_uuid?: string;
  name?: string;
  description?: string;
  domains?: string;
  docker_registry_image_name?: string;
  docker_registry_image_tag?: string;
  ports_mappings?: string;
  base_directory?: string;
  health_check_enabled?: boolean;
  health_check_path?: string;
  health_check_port?: string;
  health_check_host?: string;
  health_check_method?: string;
  health_check_return_code?: number;
  health_check_scheme?: string;
  health_check_response_text?: string;
  health_check_interval?: number;
  health_check_timeout?: number;
  health_check_retries?: number;
  health_check_start_period?: number;
  limits_memory?: string;
  limits_memory_swap?: string;
  limits_memory_swappiness?: number;
  limits_memory_reservation?: string;
  limits_cpus?: string;
  limits_cpuset?: string;
  limits_cpu_shares?: number;
  custom_labels?: string;
  custom_docker_run_options?: string;
  post_deployment_command?: string;
  post_deployment_command_container?: string;
  pre_deployment_command?: string;
  pre_deployment_command_container?: string;
  redirect?: 'www' | 'non-www' | 'both';
  instant_deploy?: boolean;
  use_build_server?: boolean;
}

export interface CreateDockerImageApplicationRequest {
  project_uuid: string;
  server_uuid: string;
  environment_name?: string;
  environment_uuid?: string;
  docker_registry_image_name: string;
  ports_exposes: string;
  docker_registry_image_tag?: string;
  destination_uuid?: string;
  name?: string;
  description?: string;
  domains?: string;
  ports_mappings?: string;
  health_check_enabled?: boolean;
  health_check_path?: string;
  health_check_port?: string;
  health_check_host?: string;
  health_check_method?: string;
  health_check_return_code?: number;
  health_check_scheme?: string;
  health_check_response_text?: string;
  health_check_interval?: number;
  health_check_timeout?: number;
  health_check_retries?: number;
  health_check_start_period?: number;
  limits_memory?: string;
  limits_memory_swap?: string;
  limits_memory_swappiness?: number;
  limits_memory_reservation?: string;
  limits_cpus?: string;
  limits_cpuset?: string;
  limits_cpu_shares?: number;
  custom_labels?: string;
  custom_docker_run_options?: string;
  post_deployment_command?: string;
  post_deployment_command_container?: string;
  pre_deployment_command?: string;
  pre_deployment_command_container?: string;
  redirect?: 'www' | 'non-www' | 'both';
  instant_deploy?: boolean;
  use_build_server?: boolean;
}

export interface CreateDockerComposeApplicationRequest {
  project_uuid: string;
  server_uuid: string;
  environment_name?: string;
  environment_uuid?: string;
  docker_compose_raw: string;
  destination_uuid?: string;
  name?: string;
  description?: string;
  instant_deploy?: boolean;
  use_build_server?: boolean;
}

export interface UpdateApplicationRequest {
  name?: string;
  description?: string;
  fqdn?: string;
  git_repository?: string;
  git_branch?: string;
  git_commit_sha?: string;
  docker_registry_image_name?: string;
  docker_registry_image_tag?: string;
  build_pack?: BuildPack;
  static_image?: string;
  install_command?: string;
  build_command?: string;
  start_command?: string;
  ports_exposes?: string;
  ports_mappings?: string;
  base_directory?: string;
  publish_directory?: string;
  health_check_enabled?: boolean;
  health_check_path?: string;
  health_check_port?: string;
  health_check_host?: string;
  health_check_method?: string;
  health_check_return_code?: number;
  health_check_scheme?: string;
  health_check_response_text?: string;
  health_check_interval?: number;
  health_check_timeout?: number;
  health_check_retries?: number;
  health_check_start_period?: number;
  limits_memory?: string;
  limits_memory_swap?: string;
  limits_memory_swappiness?: number;
  limits_memory_reservation?: string;
  limits_cpus?: string;
  limits_cpuset?: string;
  limits_cpu_shares?: number;
  custom_labels?: string;
  custom_docker_run_options?: string;
  post_deployment_command?: string;
  post_deployment_command_container?: string;
  pre_deployment_command?: string;
  pre_deployment_command_container?: string;
  redirect?: 'www' | 'non-www' | 'both';
  dockerfile?: string;
  docker_compose_location?: string;
  docker_compose_raw?: string;
  docker_compose_custom_start_command?: string;
  docker_compose_custom_build_command?: string;
  docker_compose_domains?: string[];
  watch_paths?: string;
  use_build_server?: boolean;
  instant_deploy?: boolean;
}

export interface DeleteApplicationOptions {
  delete_configurations?: boolean;
  delete_volumes?: boolean;
  docker_cleanup?: boolean;
  delete_connected_networks?: boolean;
}

// ============ ENVIRONMENT VARIABLE TYPES ============

export interface EnvironmentVariable {
  id: number;
  uuid: string;
  key: string;
  value: string;
  is_preview?: boolean;
  is_build_time?: boolean;
  is_literal?: boolean;
  is_multiline?: boolean;
  is_shown_once?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEnvRequest {
  key: string;
  value: string;
  is_preview?: boolean;
  is_build_time?: boolean;
  is_literal?: boolean;
  is_multiline?: boolean;
  is_shown_once?: boolean;
}

export interface UpdateEnvRequest {
  key: string;
  value: string;
  is_preview?: boolean;
  is_build_time?: boolean;
  is_literal?: boolean;
  is_multiline?: boolean;
  is_shown_once?: boolean;
}

export interface BulkUpdateEnvRequest {
  data: UpdateEnvRequest[];
}

// ============ DATABASE TYPES ============

export interface DatabaseBase {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  type:
    | 'postgresql'
    | 'mysql'
    | 'mariadb'
    | 'mongodb'
    | 'redis'
    | 'keydb'
    | 'clickhouse'
    | 'dragonfly';
  status: 'running' | 'stopped' | 'error';
  created_at: string;
  updated_at: string;
  is_public: boolean;
  public_port?: number;
  image: string;
  limits?: {
    memory?: string;
    memory_swap?: string;
    memory_swappiness?: number;
    memory_reservation?: string;
    cpus?: string;
    cpuset?: string;
    cpu_shares?: number;
  };
}

export interface PostgresDatabase extends DatabaseBase {
  type: 'postgresql';
  postgres_user: string;
  postgres_password: string;
  postgres_db: string;
  postgres_initdb_args?: string;
  postgres_host_auth_method?: string;
  postgres_conf?: string;
}

export interface MySQLDatabase extends DatabaseBase {
  type: 'mysql';
  mysql_root_password: string;
  mysql_user?: string;
  mysql_password?: string;
  mysql_database?: string;
}

export interface MariaDBDatabase extends DatabaseBase {
  type: 'mariadb';
  mariadb_root_password: string;
  mariadb_user?: string;
  mariadb_password?: string;
  mariadb_database?: string;
  mariadb_conf?: string;
}

export interface MongoDBDatabase extends DatabaseBase {
  type: 'mongodb';
  mongo_initdb_root_username: string;
  mongo_initdb_root_password: string;
  mongo_initdb_database?: string;
  mongo_conf?: string;
}

export interface RedisDatabase extends DatabaseBase {
  type: 'redis';
  redis_password?: string;
  redis_conf?: string;
}

export interface KeyDBDatabase extends DatabaseBase {
  type: 'keydb';
  keydb_password?: string;
  keydb_conf?: string;
}

export interface ClickhouseDatabase extends DatabaseBase {
  type: 'clickhouse';
  clickhouse_admin_user: string;
  clickhouse_admin_password: string;
}

export interface DragonflyDatabase extends DatabaseBase {
  type: 'dragonfly';
  dragonfly_password: string;
}

export type Database =
  | PostgresDatabase
  | MySQLDatabase
  | MariaDBDatabase
  | MongoDBDatabase
  | RedisDatabase
  | KeyDBDatabase
  | ClickhouseDatabase
  | DragonflyDatabase;

export interface DatabaseUpdateRequest {
  name?: string;
  description?: string;
  image?: string;
  is_public?: boolean;
  public_port?: number;
  limits_memory?: string;
  limits_memory_swap?: string;
  limits_memory_swappiness?: number;
  limits_memory_reservation?: string;
  limits_cpus?: string;
  limits_cpuset?: string;
  limits_cpu_shares?: number;
  postgres_user?: string;
  postgres_password?: string;
  postgres_db?: string;
  postgres_initdb_args?: string;
  postgres_host_auth_method?: string;
  postgres_conf?: string;
  clickhouse_admin_user?: string;
  clickhouse_admin_password?: string;
  dragonfly_password?: string;
  redis_password?: string;
  redis_conf?: string;
  keydb_password?: string;
  keydb_conf?: string;
  mariadb_conf?: string;
  mariadb_root_password?: string;
  mariadb_user?: string;
  mariadb_password?: string;
  mariadb_database?: string;
  mongo_conf?: string;
  mongo_initdb_root_username?: string;
  mongo_initdb_root_password?: string;
  mongo_initdb_database?: string;
  mysql_root_password?: string;
  mysql_password?: string;
  mysql_user?: string;
  mysql_database?: string;
}

export interface CreateDatabaseRequest {
  project_uuid: string;
  server_uuid: string;
  environment_name?: string;
  environment_uuid?: string;
  destination_uuid?: string;
  name?: string;
  description?: string;
  image?: string;
  is_public?: boolean;
  public_port?: number;
  limits_memory?: string;
  limits_memory_swap?: string;
  limits_memory_swappiness?: number;
  limits_memory_reservation?: string;
  limits_cpus?: string;
  limits_cpuset?: string;
  limits_cpu_shares?: number;
  instant_deploy?: boolean;
}

export interface CreatePostgresRequest extends CreateDatabaseRequest {
  postgres_user?: string;
  postgres_password?: string;
  postgres_db?: string;
  postgres_initdb_args?: string;
  postgres_host_auth_method?: string;
  postgres_conf?: string;
}

export interface CreateMySQLRequest extends CreateDatabaseRequest {
  mysql_root_password?: string;
  mysql_user?: string;
  mysql_password?: string;
  mysql_database?: string;
}

export interface CreateMariaDBRequest extends CreateDatabaseRequest {
  mariadb_root_password?: string;
  mariadb_user?: string;
  mariadb_password?: string;
  mariadb_database?: string;
  mariadb_conf?: string;
}

export interface CreateMongoDBRequest extends CreateDatabaseRequest {
  mongo_initdb_root_username?: string;
  mongo_initdb_root_password?: string;
  mongo_initdb_database?: string;
  mongo_conf?: string;
}

export interface CreateRedisRequest extends CreateDatabaseRequest {
  redis_password?: string;
  redis_conf?: string;
}

export interface CreateKeyDBRequest extends CreateDatabaseRequest {
  keydb_password?: string;
  keydb_conf?: string;
}

export interface CreateClickhouseRequest extends CreateDatabaseRequest {
  clickhouse_admin_user?: string;
  clickhouse_admin_password?: string;
}

export interface CreateDragonflyRequest extends CreateDatabaseRequest {
  dragonfly_password?: string;
}

// ============ SERVICE TYPES ============

export type ServiceType =
  | 'activepieces'
  | 'appsmith'
  | 'appwrite'
  | 'authentik'
  | 'babybuddy'
  | 'budge'
  | 'changedetection'
  | 'chatwoot'
  | 'classicpress-with-mariadb'
  | 'classicpress-with-mysql'
  | 'classicpress-without-database'
  | 'cloudflared'
  | 'code-server'
  | 'dashboard'
  | 'directus'
  | 'directus-with-postgresql'
  | 'docker-registry'
  | 'docuseal'
  | 'docuseal-with-postgres'
  | 'dokuwiki'
  | 'duplicati'
  | 'emby'
  | 'embystat'
  | 'fider'
  | 'filebrowser'
  | 'firefly'
  | 'formbricks'
  | 'ghost'
  | 'gitea'
  | 'gitea-with-mariadb'
  | 'gitea-with-mysql'
  | 'gitea-with-postgresql'
  | 'glance'
  | 'glances'
  | 'glitchtip'
  | 'grafana'
  | 'grafana-with-postgresql'
  | 'grocy'
  | 'heimdall'
  | 'homepage'
  | 'jellyfin'
  | 'kuzzle'
  | 'listmonk'
  | 'logto'
  | 'mediawiki'
  | 'meilisearch'
  | 'metabase'
  | 'metube'
  | 'minio'
  | 'moodle'
  | 'n8n'
  | 'n8n-with-postgresql'
  | 'next-image-transformation'
  | 'nextcloud'
  | 'nocodb'
  | 'odoo'
  | 'openblocks'
  | 'pairdrop'
  | 'penpot'
  | 'phpmyadmin'
  | 'pocketbase'
  | 'posthog'
  | 'reactive-resume'
  | 'rocketchat'
  | 'shlink'
  | 'slash'
  | 'snapdrop'
  | 'statusnook'
  | 'stirling-pdf'
  | 'supabase'
  | 'syncthing'
  | 'tolgee'
  | 'trigger'
  | 'trigger-with-external-database'
  | 'twenty'
  | 'umami'
  | 'unleash-with-postgresql'
  | 'unleash-without-database'
  | 'uptime-kuma'
  | 'vaultwarden'
  | 'vikunja'
  | 'weblate'
  | 'whoogle'
  | 'wordpress-with-mariadb'
  | 'wordpress-with-mysql'
  | 'wordpress-without-database';

export interface Service {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  type: ServiceType;
  status: 'running' | 'stopped' | 'error';
  created_at: string;
  updated_at: string;
  project_uuid: string;
  environment_name: string;
  environment_uuid: string;
  server_uuid: string;
  destination_uuid?: string;
  domains?: string[];
}

export interface CreateServiceRequest {
  type: ServiceType;
  name?: string;
  description?: string;
  project_uuid: string;
  environment_name?: string;
  environment_uuid?: string;
  server_uuid: string;
  destination_uuid?: string;
  instant_deploy?: boolean;
}

export interface DeleteServiceOptions {
  deleteConfigurations?: boolean;
  deleteVolumes?: boolean;
  dockerCleanup?: boolean;
  deleteConnectedNetworks?: boolean;
}

// ============ SERVER TYPES ============

export interface CreateServerRequest {
  name?: string;
  description?: string;
  ip: string;
  port?: number;
  user?: string;
  private_key_uuid: string;
  is_build_server?: boolean;
  instant_validate?: boolean;
  proxy_type?: 'traefik' | 'caddy' | 'none';
}

export interface UpdateServerRequest {
  name?: string;
  description?: string;
  ip?: string;
  port?: number;
  user?: string;
  private_key_uuid?: string;
  is_build_server?: boolean;
  instant_validate?: boolean;
  proxy_type?: 'traefik' | 'caddy' | 'none';
}

// ============ PRIVATE KEY TYPES ============

export interface PrivateKey {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  private_key: string;
  is_git_related?: boolean;
  team_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePrivateKeyRequest {
  name?: string;
  description?: string;
  private_key: string;
}

export interface UpdatePrivateKeyRequest {
  name?: string;
  description?: string;
  private_key: string;
}

// ============ TEAM TYPES ============

export interface Team {
  id: number;
  name: string;
  description?: string;
  personal_team?: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// ============ DEPLOYMENT TYPES ============

export interface ApplicationDeploymentQueue {
  id: number;
  uuid: string;
  application_id: number;
  deployment_uuid: string;
  pull_request_id?: number;
  force_rebuild?: boolean;
  commit?: string;
  status: string;
  is_webhook?: boolean;
  is_api?: boolean;
  created_at: string;
  updated_at: string;
  logs?: string;
}

export interface DeployResponse {
  deployments: Array<{
    message: string;
    resource_uuid: string;
    deployment_uuid: string;
  }>;
}

export interface StartApplicationResponse {
  message: string;
  deployment_uuid?: string;
}

export interface ExecuteCommandResponse {
  message: string;
  response?: string;
}

// ============ APPLICATION LOGS TYPES ============

export interface ApplicationLogs {
  logs: string[];
}

// ============ DATABASE BACKUP TYPES ============

export interface DatabaseBackup {
  id: number;
  uuid: string;
  database_id: number;
  database_type: string;
  status: string;
  filename?: string;
  size?: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduledDatabaseBackup {
  id: number;
  uuid: string;
  database_id: number;
  enabled: boolean;
  frequency: string;
  save_s3: boolean;
  s3_storage_id?: number;
  databases_to_backup?: string;
  created_at: string;
  updated_at: string;
  executions?: BackupExecution[];
}

export interface BackupExecution {
  id: number;
  uuid: string;
  scheduled_database_backup_id: number;
  status: string;
  message?: string;
  filename?: string;
  size?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledBackupRequest {
  frequency: string;
  enabled?: boolean;
  save_s3?: boolean;
  s3_storage_id?: number;
  databases_to_backup?: string;
}

export interface UpdateScheduledBackupRequest {
  frequency?: string;
  enabled?: boolean;
  save_s3?: boolean;
  s3_storage_id?: number;
  databases_to_backup?: string;
}

// ============ GITHUB APP TYPES ============

export interface GitHubApp {
  id: number;
  uuid: string;
  name: string;
  organization?: string;
  app_id: number;
  installation_id: number;
  client_id: string;
  client_secret?: string;
  webhook_secret?: string;
  private_key?: string;
  is_system_wide: boolean;
  html_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGitHubAppRequest {
  name: string;
  organization?: string;
  app_id: number;
  installation_id: number;
  client_id: string;
  client_secret: string;
  webhook_secret: string;
  private_key: string;
  is_system_wide?: boolean;
}

export interface UpdateGitHubAppRequest {
  name?: string;
  organization?: string;
  app_id?: number;
  installation_id?: number;
  client_id?: string;
  client_secret?: string;
  webhook_secret?: string;
  private_key?: string;
  is_system_wide?: boolean;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

// ============ PROJECT ENVIRONMENT TYPES ============

export interface CreateEnvironmentRequest {
  name: string;
}

// ============ SERVICE UPDATE TYPES ============

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  domains?: string;
  instant_deploy?: boolean;
}
