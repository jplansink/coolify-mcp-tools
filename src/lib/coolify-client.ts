import {
  CoolifyConfig,
  ErrorResponse,
  ServerInfo,
  ServerResources,
  ServerDomain,
  ValidationResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  Environment,
  Deployment,
  Database,
  DatabaseUpdateRequest,
  Service,
  CreateServiceRequest,
  DeleteServiceOptions,
  UpdateServiceRequest,
  // Application types
  Application,
  CreatePublicApplicationRequest,
  CreatePrivateGHAppApplicationRequest,
  CreatePrivateDeployKeyApplicationRequest,
  CreateDockerfileApplicationRequest,
  CreateDockerImageApplicationRequest,
  CreateDockerComposeApplicationRequest,
  UpdateApplicationRequest,
  DeleteApplicationOptions,
  ApplicationLogs,
  // Environment variable types
  EnvironmentVariable,
  CreateEnvRequest,
  UpdateEnvRequest,
  BulkUpdateEnvRequest,
  // Server types
  CreateServerRequest,
  UpdateServerRequest,
  // Private key types
  PrivateKey,
  CreatePrivateKeyRequest,
  UpdatePrivateKeyRequest,
  // Team types
  Team,
  User,
  // Deployment types
  ApplicationDeploymentQueue,
  DeployResponse,
  StartApplicationResponse,
  ExecuteCommandResponse,
  // Database create types
  CreatePostgresRequest,
  CreateMySQLRequest,
  CreateMariaDBRequest,
  CreateMongoDBRequest,
  CreateRedisRequest,
  CreateKeyDBRequest,
  CreateClickhouseRequest,
  CreateDragonflyRequest,
  // Database backup types
  ScheduledDatabaseBackup,
  BackupExecution,
  CreateScheduledBackupRequest,
  UpdateScheduledBackupRequest,
  // GitHub App types
  GitHubApp,
  CreateGitHubAppRequest,
  UpdateGitHubAppRequest,
  GitHubRepository,
  GitHubBranch,
  // Project environment types
  CreateEnvironmentRequest,
} from '../types/coolify.js';

export class CoolifyClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(config: CoolifyConfig) {
    if (!config.baseUrl) {
      throw new Error('Coolify base URL is required');
    }
    if (!config.accessToken) {
      throw new Error('Coolify access token is required');
    }
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.accessToken = config.accessToken;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.baseUrl}/api/v1${path}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as ErrorResponse;
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          `Failed to connect to Coolify server at ${this.baseUrl}. Please check if the server is running and the URL is correct.`,
        );
      }
      throw error;
    }
  }

  async validateConnection(): Promise<void> {
    try {
      await this.listServers();
    } catch (error) {
      throw new Error(
        `Failed to connect to Coolify server: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // ============ SERVER METHODS ============

  async listServers(): Promise<ServerInfo[]> {
    return this.request<ServerInfo[]>('/servers');
  }

  async getServer(uuid: string): Promise<ServerInfo> {
    return this.request<ServerInfo>(`/servers/${uuid}`);
  }

  async createServer(data: CreateServerRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/servers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateServer(uuid: string, data: UpdateServerRequest): Promise<ServerInfo> {
    return this.request<ServerInfo>(`/servers/${uuid}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteServer(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/servers/${uuid}`, {
      method: 'DELETE',
    });
  }

  async getServerResources(uuid: string): Promise<ServerResources> {
    return this.request<ServerResources>(`/servers/${uuid}/resources`);
  }

  async getServerDomains(uuid: string): Promise<ServerDomain[]> {
    return this.request<ServerDomain[]>(`/servers/${uuid}/domains`);
  }

  async validateServer(uuid: string): Promise<ValidationResponse> {
    return this.request<ValidationResponse>(`/servers/${uuid}/validate`);
  }

  // ============ PROJECT METHODS ============

  async listProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async getProject(uuid: string): Promise<Project> {
    return this.request<Project>(`/projects/${uuid}`);
  }

  async createProject(project: CreateProjectRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(uuid: string, project: UpdateProjectRequest): Promise<Project> {
    return this.request<Project>(`/projects/${uuid}`, {
      method: 'PATCH',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${uuid}`, {
      method: 'DELETE',
    });
  }

  async getProjectEnvironment(
    projectUuid: string,
    environmentNameOrUuid: string,
  ): Promise<Environment> {
    return this.request<Environment>(`/projects/${projectUuid}/${environmentNameOrUuid}`);
  }

  async listProjectEnvironments(projectUuid: string): Promise<Environment[]> {
    return this.request<Environment[]>(`/projects/${projectUuid}/environments`);
  }

  async createProjectEnvironment(
    projectUuid: string,
    data: CreateEnvironmentRequest,
  ): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>(`/projects/${projectUuid}/environments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteProjectEnvironment(
    projectUuid: string,
    environmentNameOrUuid: string,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/projects/${projectUuid}/environments/${environmentNameOrUuid}`,
      {
        method: 'DELETE',
      },
    );
  }

  // ============ APPLICATION METHODS ============

  async listApplications(): Promise<Application[]> {
    return this.request<Application[]>('/applications');
  }

  async getApplication(uuid: string): Promise<Application> {
    return this.request<Application>(`/applications/${uuid}`);
  }

  async createPublicApplication(data: CreatePublicApplicationRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/applications/public', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPrivateGHAppApplication(
    data: CreatePrivateGHAppApplicationRequest,
  ): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/applications/private-github-app', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPrivateDeployKeyApplication(
    data: CreatePrivateDeployKeyApplicationRequest,
  ): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/applications/private-deploy-key', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createDockerfileApplication(
    data: CreateDockerfileApplicationRequest,
  ): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/applications/dockerfile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createDockerImageApplication(
    data: CreateDockerImageApplicationRequest,
  ): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/applications/dockerimage', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createDockerComposeApplication(
    data: CreateDockerComposeApplicationRequest,
  ): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/applications/dockercompose', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateApplication(uuid: string, data: UpdateApplicationRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>(`/applications/${uuid}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteApplication(
    uuid: string,
    options?: DeleteApplicationOptions,
  ): Promise<{ message: string }> {
    const queryParams = new URLSearchParams();
    if (options) {
      if (options.delete_configurations !== undefined) {
        queryParams.set('delete_configurations', options.delete_configurations.toString());
      }
      if (options.delete_volumes !== undefined) {
        queryParams.set('delete_volumes', options.delete_volumes.toString());
      }
      if (options.docker_cleanup !== undefined) {
        queryParams.set('docker_cleanup', options.docker_cleanup.toString());
      }
      if (options.delete_connected_networks !== undefined) {
        queryParams.set('delete_connected_networks', options.delete_connected_networks.toString());
      }
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/applications/${uuid}?${queryString}` : `/applications/${uuid}`;

    return this.request<{ message: string }>(url, {
      method: 'DELETE',
    });
  }

  async startApplication(
    uuid: string,
    options?: { force?: boolean; instant_deploy?: boolean },
  ): Promise<StartApplicationResponse> {
    const queryParams = new URLSearchParams();
    if (options?.force) {
      queryParams.set('force', 'true');
    }
    if (options?.instant_deploy) {
      queryParams.set('instant_deploy', 'true');
    }
    const queryString = queryParams.toString();
    const url = queryString
      ? `/applications/${uuid}/start?${queryString}`
      : `/applications/${uuid}/start`;
    return this.request<StartApplicationResponse>(url);
  }

  async stopApplication(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/applications/${uuid}/stop`);
  }

  async restartApplication(uuid: string): Promise<StartApplicationResponse> {
    return this.request<StartApplicationResponse>(`/applications/${uuid}/restart`);
  }

  async executeApplicationCommand(uuid: string, command: string): Promise<ExecuteCommandResponse> {
    return this.request<ExecuteCommandResponse>(`/applications/${uuid}/execute`, {
      method: 'POST',
      body: JSON.stringify({ command }),
    });
  }

  async deployApplication(uuid: string): Promise<Deployment> {
    const response = await this.request<Deployment>(`/applications/${uuid}/deploy`, {
      method: 'POST',
    });
    return response;
  }

  async getApplicationLogs(uuid: string): Promise<ApplicationLogs> {
    return this.request<ApplicationLogs>(`/applications/${uuid}/logs`);
  }

  // ============ APPLICATION ENVIRONMENT VARIABLE METHODS ============

  async listApplicationEnvs(uuid: string): Promise<EnvironmentVariable[]> {
    return this.request<EnvironmentVariable[]>(`/applications/${uuid}/envs`);
  }

  async createApplicationEnv(uuid: string, data: CreateEnvRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>(`/applications/${uuid}/envs`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateApplicationEnv(uuid: string, data: UpdateEnvRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/applications/${uuid}/envs`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async bulkUpdateApplicationEnvs(
    uuid: string,
    data: BulkUpdateEnvRequest,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/applications/${uuid}/envs/bulk`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteApplicationEnv(uuid: string, envUuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/applications/${uuid}/envs/${envUuid}`, {
      method: 'DELETE',
    });
  }

  // ============ DATABASE METHODS ============

  async listDatabases(): Promise<Database[]> {
    return this.request<Database[]>('/databases');
  }

  async getDatabase(uuid: string): Promise<Database> {
    return this.request<Database>(`/databases/${uuid}`);
  }

  async updateDatabase(uuid: string, data: DatabaseUpdateRequest): Promise<Database> {
    return this.request<Database>(`/databases/${uuid}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDatabase(
    uuid: string,
    options?: {
      deleteConfigurations?: boolean;
      deleteVolumes?: boolean;
      dockerCleanup?: boolean;
      deleteConnectedNetworks?: boolean;
    },
  ): Promise<{ message: string }> {
    const queryParams = new URLSearchParams();
    if (options) {
      if (options.deleteConfigurations !== undefined) {
        queryParams.set('delete_configurations', options.deleteConfigurations.toString());
      }
      if (options.deleteVolumes !== undefined) {
        queryParams.set('delete_volumes', options.deleteVolumes.toString());
      }
      if (options.dockerCleanup !== undefined) {
        queryParams.set('docker_cleanup', options.dockerCleanup.toString());
      }
      if (options.deleteConnectedNetworks !== undefined) {
        queryParams.set('delete_connected_networks', options.deleteConnectedNetworks.toString());
      }
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/databases/${uuid}?${queryString}` : `/databases/${uuid}`;

    return this.request<{ message: string }>(url, {
      method: 'DELETE',
    });
  }

  // Database creation methods
  async createPostgresDatabase(data: CreatePostgresRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/postgresql', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createMySQLDatabase(data: CreateMySQLRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/mysql', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createMariaDBDatabase(data: CreateMariaDBRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/mariadb', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createMongoDBDatabase(data: CreateMongoDBRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/mongodb', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createRedisDatabase(data: CreateRedisRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/redis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createKeyDBDatabase(data: CreateKeyDBRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/keydb', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createClickhouseDatabase(data: CreateClickhouseRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/clickhouse', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createDragonflyDatabase(data: CreateDragonflyRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/dragonfly', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Database lifecycle methods
  async startDatabase(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/databases/${uuid}/start`);
  }

  async stopDatabase(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/databases/${uuid}/stop`);
  }

  async restartDatabase(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/databases/${uuid}/restart`);
  }

  // Database backup methods
  async listDatabaseBackups(uuid: string): Promise<ScheduledDatabaseBackup[]> {
    return this.request<ScheduledDatabaseBackup[]>(`/databases/${uuid}/backups`);
  }

  async createDatabaseBackup(
    uuid: string,
    data: CreateScheduledBackupRequest,
  ): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>(`/databases/${uuid}/backups`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDatabaseBackup(
    uuid: string,
    backupUuid: string,
    data: UpdateScheduledBackupRequest,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/databases/${uuid}/backups/${backupUuid}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDatabaseBackup(uuid: string, backupUuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/databases/${uuid}/backups/${backupUuid}`, {
      method: 'DELETE',
    });
  }

  async listBackupExecutions(uuid: string, backupUuid: string): Promise<BackupExecution[]> {
    return this.request<BackupExecution[]>(`/databases/${uuid}/backups/${backupUuid}/executions`);
  }

  async deleteBackupExecution(
    uuid: string,
    backupUuid: string,
    executionUuid: string,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/databases/${uuid}/backups/${backupUuid}/executions/${executionUuid}`,
      {
        method: 'DELETE',
      },
    );
  }

  // ============ SERVICE METHODS ============

  async listServices(): Promise<Service[]> {
    return this.request<Service[]>('/services');
  }

  async getService(uuid: string): Promise<Service> {
    return this.request<Service>(`/services/${uuid}`);
  }

  async createService(data: CreateServiceRequest): Promise<{ uuid: string; domains: string[] }> {
    return this.request<{ uuid: string; domains: string[] }>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(uuid: string, data: UpdateServiceRequest): Promise<Service> {
    return this.request<Service>(`/services/${uuid}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteService(uuid: string, options?: DeleteServiceOptions): Promise<{ message: string }> {
    const queryParams = new URLSearchParams();
    if (options) {
      if (options.deleteConfigurations !== undefined) {
        queryParams.set('delete_configurations', options.deleteConfigurations.toString());
      }
      if (options.deleteVolumes !== undefined) {
        queryParams.set('delete_volumes', options.deleteVolumes.toString());
      }
      if (options.dockerCleanup !== undefined) {
        queryParams.set('docker_cleanup', options.dockerCleanup.toString());
      }
      if (options.deleteConnectedNetworks !== undefined) {
        queryParams.set('delete_connected_networks', options.deleteConnectedNetworks.toString());
      }
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/services/${uuid}?${queryString}` : `/services/${uuid}`;

    return this.request<{ message: string }>(url, {
      method: 'DELETE',
    });
  }

  async startService(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/services/${uuid}/start`);
  }

  async stopService(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/services/${uuid}/stop`);
  }

  async restartService(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/services/${uuid}/restart`);
  }

  // ============ SERVICE ENVIRONMENT VARIABLE METHODS ============

  async listServiceEnvs(uuid: string): Promise<EnvironmentVariable[]> {
    return this.request<EnvironmentVariable[]>(`/services/${uuid}/envs`);
  }

  async createServiceEnv(uuid: string, data: CreateEnvRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>(`/services/${uuid}/envs`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateServiceEnv(uuid: string, data: UpdateEnvRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/services/${uuid}/envs`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async bulkUpdateServiceEnvs(
    uuid: string,
    data: BulkUpdateEnvRequest,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/services/${uuid}/envs/bulk`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteServiceEnv(uuid: string, envUuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/services/${uuid}/envs/${envUuid}`, {
      method: 'DELETE',
    });
  }

  // ============ PRIVATE KEY METHODS ============

  async listPrivateKeys(): Promise<PrivateKey[]> {
    return this.request<PrivateKey[]>('/security/keys');
  }

  async getPrivateKey(uuid: string): Promise<PrivateKey> {
    return this.request<PrivateKey>(`/security/keys/${uuid}`);
  }

  async createPrivateKey(data: CreatePrivateKeyRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/security/keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePrivateKey(data: UpdatePrivateKeyRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/security/keys', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePrivateKey(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/security/keys/${uuid}`, {
      method: 'DELETE',
    });
  }

  // ============ GITHUB APP METHODS ============

  async listGitHubApps(): Promise<GitHubApp[]> {
    return this.request<GitHubApp[]>('/github-apps');
  }

  async createGitHubApp(data: CreateGitHubAppRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/github-apps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGitHubApp(id: number, data: UpdateGitHubAppRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/github-apps/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteGitHubApp(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/github-apps/${id}`, {
      method: 'DELETE',
    });
  }

  async listGitHubAppRepositories(id: number): Promise<GitHubRepository[]> {
    return this.request<GitHubRepository[]>(`/github-apps/${id}/repositories`);
  }

  async listGitHubAppBranches(id: number, owner: string, repo: string): Promise<GitHubBranch[]> {
    return this.request<GitHubBranch[]>(
      `/github-apps/${id}/repositories/${owner}/${repo}/branches`,
    );
  }

  // ============ TEAM METHODS ============

  async listTeams(): Promise<Team[]> {
    return this.request<Team[]>('/teams');
  }

  async getTeam(id: number): Promise<Team> {
    return this.request<Team>(`/teams/${id}`);
  }

  async getTeamMembers(id: number): Promise<User[]> {
    return this.request<User[]>(`/teams/${id}/members`);
  }

  async getCurrentTeam(): Promise<Team> {
    return this.request<Team>('/teams/current');
  }

  async getCurrentTeamMembers(): Promise<User[]> {
    return this.request<User[]>('/teams/current/members');
  }

  // ============ DEPLOYMENT METHODS ============

  async listDeployments(): Promise<ApplicationDeploymentQueue[]> {
    return this.request<ApplicationDeploymentQueue[]>('/deployments');
  }

  async getDeployment(uuid: string): Promise<ApplicationDeploymentQueue> {
    return this.request<ApplicationDeploymentQueue>(`/deployments/${uuid}`);
  }

  async getDeploymentsByApplication(appUuid: string): Promise<ApplicationDeploymentQueue[]> {
    return this.request<ApplicationDeploymentQueue[]>(`/deployments/applications/${appUuid}`);
  }

  async cancelDeployment(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/deployments/${uuid}/cancel`, {
      method: 'POST',
    });
  }

  async deploy(options: { tag?: string; uuid?: string; force?: boolean }): Promise<DeployResponse> {
    const queryParams = new URLSearchParams();
    if (options.tag) {
      queryParams.set('tag', options.tag);
    }
    if (options.uuid) {
      queryParams.set('uuid', options.uuid);
    }
    if (options.force) {
      queryParams.set('force', 'true');
    }
    const queryString = queryParams.toString();
    const url = queryString ? `/deploy?${queryString}` : '/deploy';
    return this.request<DeployResponse>(url);
  }

  // ============ UTILITY METHODS ============

  async getVersion(): Promise<string> {
    return this.request<string>('/version');
  }

  async healthcheck(): Promise<string> {
    return this.request<string>('/health');
  }

  async listResources(): Promise<unknown[]> {
    return this.request<unknown[]>('/resources');
  }

  async enableApi(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/enable');
  }

  async disableApi(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/disable');
  }
}
