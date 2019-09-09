import * as aws from "aws-sdk";
import dynamoClient from "../infrastructure/dynamoClient";
import { AttributeMap } from "aws-sdk/clients/dynamodb";
import { Sprint } from '../entities/sprint';

export class SprintRepository {
  private client: aws.DynamoDB.DocumentClient;
  private tableName: string;

  constructor() {
    this.client = dynamoClient;
    this.tableName = process.env.dynamoJiraSprints;
  }

  public async findAll(): Promise<Array<Sprint>> {
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
    return allItems.map(item => this.dynamoItemToSprint(item));
  }

  public async create(sprint: Sprint): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        id: sprint.id,
        name: sprint.name,
        state: sprint.state,
        start_date: sprint.startDate ? sprint.startDate.getTime() : null,
        end_date: sprint.endDate ? sprint.endDate.getTime() : null,
        complete_date: sprint.completeDate ? sprint.completeDate.getTime() : null,
        origin_board_id: sprint.originBoardId
      }
    };

    await this.client.put(params).promise();
  }

  private dynamoItemToSprint(item: AttributeMap): Sprint {
    const sprint: Sprint = {
      id: item.id,
      name: item.name,
      state: item.state,
      startDate: item.start_date && new Date(item.start_date),
      endDate: item.end_date && new Date(item.end_date),
      completeDate: item.complete_date && new Date(item.complete_date),
      originBoardId: item.origin_board_id
    };
    return sprint;
  }
}