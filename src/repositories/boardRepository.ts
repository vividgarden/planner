import * as aws from "aws-sdk";
import dynamoClient from "../infrastructure/dynamoClient";
import { AttributeMap } from "aws-sdk/clients/dynamodb";
import { Board } from '../entities/board';

export class BoardRepository {
  private client: aws.DynamoDB.DocumentClient;
  private tableName: string;

  constructor() {
    this.client = dynamoClient;
    this.tableName = process.env.dynamoJiraBoards;
  }

  public async findAll(): Promise<Array<Board>> {
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

    return allItems.map(item => this.dynamoItemToBoard(item));
  }

  public async create(board: Board): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        id: board.id,
        name: board.name,
        location_key: board.locationKey
      }
    };

    await this.client.put(params).promise();
  }

  private dynamoItemToBoard(item: AttributeMap): Board {
    const b: Board = {
      id: item.id,
      name: item.name,
      locationKey: item.location_key
    };
    return b;
  }
}