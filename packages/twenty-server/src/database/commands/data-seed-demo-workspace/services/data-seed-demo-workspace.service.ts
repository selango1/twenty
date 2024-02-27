import { Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { WorkspaceManagerService } from 'src/workspace/workspace-manager/workspace-manager.service';
import {
  deleteCoreSchema,
  seedCoreSchema,
} from 'src/database/typeorm-seeds/core/demo';

@Injectable()
export class DataSeedDemoWorkspaceService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly workspaceManagerService: WorkspaceManagerService,
  ) {}

  async seedDemo(): Promise<void> {
    try {
      const dataSource = new DataSource({
        url: this.environmentService.getPGDatabaseUrl(),
        type: 'postgres',
        logging: true,
        schema: 'public',
      });

      await dataSource.initialize();
      const demoWorkspaceIds = this.environmentService.getDemoWorkspaceIds();

      if (demoWorkspaceIds.length === 0) {
        throw new Error(
          'Could not get DEMO_WORKSPACE_IDS. Please specify in .env',
        );
      }
      for (const workspaceId of demoWorkspaceIds) {
        await deleteCoreSchema(dataSource, workspaceId);
        await this.workspaceManagerService.delete(workspaceId);

        await seedCoreSchema(dataSource, workspaceId);
        await this.workspaceManagerService.initDemo(workspaceId);
      }
    } catch (error) {
      console.error(error);

      return;
    }
  }
}
