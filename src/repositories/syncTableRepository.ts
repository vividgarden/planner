import * as aws from "aws-sdk";
import dynamoClient from "../infrastructure/dynamoClient";

export class SyncTableRepository {
  private client: aws.DynamoDB.DocumentClient;
  private tableName: string;

  constructor() {
    this.client = dynamoClient;
    this.tableName = process.env.dynamoSyncTables!;
  }

  public async find(id: string): Promise<Date | null> {
    const params = {
      TableName: this.tableName,
      Key: {
        id: id,
      }
    };

    const r = await this.client.get(params).promise();
    const item = r.Item;

    if (!item) {
      return null;
    }
    return new Date(item.updatedAt);
  }

  public async create(id: string, updatedAt: Date): Promise<void> {
    const unixTime = updatedAt.getTime();

    const params = {
      TableName: this.tableName,
      Item: {
        id: id,
        updatedAt: unixTime
      }
    };

    await this.client.put(params).promise();
  }
}