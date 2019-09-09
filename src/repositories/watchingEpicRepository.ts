import * as aws from "aws-sdk";
import dynamoClient from "../infrastructure/dynamoClient";
import { AttributeMap } from "aws-sdk/clients/dynamodb";
import { WatchingEpic } from '../entities/watchingEpic';

export class WatchingEpicRepository {
  private client : aws.DynamoDB.DocumentClient;
  private tableName: string;

  constructor() {
    this.client = dynamoClient;
    this.tableName = process.env.dynamoWatchingEpics!;
  }

  public async findAll(): Promise<Array<WatchingEpic>> {
    let params: any = {
      TableName: this.tableName
    };

    let allItems: Array<AttributeMap> = [];
    for(;;) {
      const o: aws.DynamoDB.QueryOutput = await this.client.scan(params).promise();
      const items = o.Items;

      if (!items || items.length <= 0) {
        break;
      }
      allItems = allItems.concat(items);

      if (o.LastEvaluatedKey) {
        params.ExclusiveStartKey = o.LastEvaluatedKey;
      } else { 
        break;
      }
    }

    return allItems.map(item => this.dynamoItemToWatchingEpic(item));
  }

  public async create(watchingEpic: WatchingEpic): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        id: watchingEpic.id,
        plan_point: watchingEpic.planPoint,
        active: watchingEpic.active
      }
    };

    await this.client.put(params).promise();
  }

  private dynamoItemToWatchingEpic(item: AttributeMap): WatchingEpic {
    const w: WatchingEpic = {
      id: item.id,
      planPoint: item.plan_point,
      active: item.active
    };

    return w;
  }
}