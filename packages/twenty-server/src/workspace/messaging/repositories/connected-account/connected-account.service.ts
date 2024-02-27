import { Injectable, NotFoundException } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { ConnectedAccountObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/connected-account.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

@Injectable()
export class ConnectedAccountService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getAll(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<ConnectedAccountObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."connectedAccount" WHERE "provider" = 'google'`,
      [],
      workspaceId,
      transactionManager,
    );
  }

  public async getByIds(
    connectedAccountIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<ConnectedAccountObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."connectedAccount" WHERE "id" = ANY($1)`,
      [connectedAccountIds],
      workspaceId,
      transactionManager,
    );
  }

  public async getByIdOrFail(
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<ConnectedAccountObjectMetadata>> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const connectedAccounts =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."connectedAccount" WHERE "id" = $1 LIMIT 1`,
        [connectedAccountId],
        workspaceId,
        transactionManager,
      );

    if (!connectedAccounts || connectedAccounts.length === 0) {
      throw new NotFoundException('No connected account found');
    }

    return connectedAccounts[0];
  }

  public async updateLastSyncHistoryId(
    historyId: string,
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."connectedAccount" SET "lastSyncHistoryId" = $1 WHERE "id" = $2`,
      [historyId, connectedAccountId],
      workspaceId,
      transactionManager,
    );
  }

  public async updateLastSyncHistoryIdIfHigher(
    historyId: string,
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."connectedAccount" SET "lastSyncHistoryId" = $1
      WHERE "id" = $2
      AND ("lastSyncHistoryId" < $1 OR "lastSyncHistoryId" = '')`,
      [historyId, connectedAccountId],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteHistoryId(
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."connectedAccount" SET "lastSyncHistoryId" = '' WHERE "id" = $1`,
      [connectedAccountId],
      workspaceId,
      transactionManager,
    );
  }

  public async updateAccessToken(
    accessToken: string,
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."connectedAccount" SET "accessToken" = $1 WHERE "id" = $2`,
      [accessToken, connectedAccountId],
      workspaceId,
      transactionManager,
    );
  }
}
