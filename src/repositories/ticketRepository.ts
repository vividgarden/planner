import { Ticket } from "../entities/ticket";
import * as aws from "aws-sdk";
import dynamoClient from "../infrastructure/dynamoClient";
import { AttributeMap } from "aws-sdk/clients/dynamodb";

export class TicketRepository {
  private client: aws.DynamoDB.DocumentClient;
  private tableName: string;

  constructor() {
    this.client = dynamoClient;
    this.tableName = process.env.dynamoJiraTickets!;
  }

  public async findAll(): Promise<Array<Ticket>> {
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

    return allItems.map(item => this.dynamoItemToTicket(item));
  }

  public async findByLatestSprintId(sprint: string): Promise<Array<Ticket>> {
    const params = {
      TableName: this.tableName,
      IndexName: "sprint_tickets",
      KeyConditionExpression: "latest_sprint = :sprint",
      ExpressionAttributeValues: {
        ":sprint": sprint
      },
    };

    const o = await this.client.query(params).promise();
    const items = o.Items;

    if (!items || items.length <= 0) {
      return [];
    }

    return items.map(item => this.dynamoItemToTicket(item));
  }

  public async findByEpicId(epicId: string): Promise<Array<Ticket>> {
    const params = {
      TableName: this.tableName,
      IndexName: "epic_tickets",
      KeyConditionExpression: "epic_id = :epicId",
      ExpressionAttributeValues: {
        ":epicId": epicId
      },
    };

    const o = await this.client.query(params).promise();
    const items = o.Items;

    if (!items || items.length <= 0) {
      return [];
    }

    return items.map(item => this.dynamoItemToTicket(item));
  }

  public async create(ticket: Ticket): Promise<void> {
    const unixCreatedAt = ticket.createdAt.getTime();
    const unixUpdatedAt = ticket.updatedAt.getTime();

    const params = {
      TableName: this.tableName,
      Item: {
        id: ticket.id,
        link: ticket.link,
        ticket_type: ticket.ticketType,
        summary: ticket.summary,
        status: ticket.status,
        assignee: ticket.assignee,
        reporter: ticket.reporter,
        story_point: ticket.storyPoint,
        latest_sprint: ticket.latestSprint || "None",
        epic_id: ticket.epicId || "None",
        epic_name: ticket.epicName,
        project_id: ticket.projectId,
        project_name: ticket.projectName,
        created_at: unixCreatedAt,
        updated_at: unixUpdatedAt
      }
    };

    await this.client.put(params).promise();
  }

  private dynamoItemToTicket(item: AttributeMap): Ticket {
    const t: Ticket = {
      id: item.id,
      link: item.link || "",
      ticketType: item.ticket_type || "",
      summary: item.summary || "",
      status: item.status || "",
      assignee: item.assignee || "",
      reporter: item.reporter || "",
      storyPoint: item.story_point || 0,
      latestSprint: item.latest_sprint === "None" ? "" : item.latest_sprint,
      epicId: item.epic_id === "None" ? "" : item.epic_id,
      epicName: item.epic_name || "",
      projectId: item.project_id || "",
      projectName: item.project_name || "",
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    };
    return t;
  }
}