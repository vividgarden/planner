import { Ticket } from "../entities/ticket";
import { JiraClient } from "../libs/jira/client";
import { ApiListResponse } from "../entities/apiListResponse";
import { ApiRecordResponse } from "../entities/apiRecordResponse";
import dig from "../libs/dig";
import * as moment from "moment-timezone";

export class OriginalTicketRepository {
  private jiraClient: JiraClient;

  constructor() {
    this.jiraClient = new JiraClient();
  }

  public async findAll(jql: string = "", limit: number = 50, offset: number = 0): Promise<ApiListResponse> {
    try {
      const r = await this.jiraClient.get("/rest/api/latest/search", { 
        params: { jql: jql, maxResults: limit, startAt: offset } 
      });
      const data = r.data;
      const res: ApiListResponse = {
        success: true,
        total: data.total,
        limit: data.maxResults,
        offset: data.startAt,
        records: data.issues.map((v: any) => this.parseTicket(v)),
        status: r.status,
        error: null
      };

      return res;
    } catch (error) {
      const res: ApiListResponse = {
        success: false,
        total: 0,
        limit: limit,
        offset: offset,
        records: [],
        status: dig(error, "status") || 500,
        error: error
      };

      return res;
    }
  }

  public async find(id: string): Promise<ApiRecordResponse> {
    try {
      const r = await this.jiraClient.get(`/rest/api/latest/issue/${id}`)
      const res: ApiRecordResponse = {
        success: true,
        record: this.parseTicket(r.data),
        status: r.status,
        error: null
      };

      return res;
    } catch (error) {
      const res: ApiRecordResponse = {
        success: false,
        record: null,
        status: dig(error, "status") || 500,
        error: error
      };
      return res;
    }
  }

  private parseTicket(raw): Ticket {
    const t: Ticket = {
      id: raw.key,
      link: raw.self,
      ticketType: dig(raw, "fields", "issuetype", "name") || "",
      summary: dig(raw, "fields", "summary") || "",
      status: dig(raw, "fields", "status", "name") || "",
      assignee: dig(raw, "fields", "assignee", "key") || "",
      reporter: dig(raw, "fields", "reporter", "key") || "",
      storyPoint: dig(raw, "fields", "customfield_10023") || 0,
      latestSprint: this.parseSprint(dig(raw, "fields", "customfield_10010") || ""),
      epicId: dig(raw, "fields", "customfield_10008") || "",
      epicName: dig(raw, "fields", "customfield_10005") || "",
      projectId: dig(raw, "fields", "project", "key") || "",
      projectName: dig(raw, "fields", "project", "name") || "",
      createdAt: moment.tz(dig(raw, "fields", "created"), "UTC").toDate(),
      updatedAt: moment.tz(dig(raw, "fields", "updated"), "UTC").toDate(),
    };
    return t;
  }

  // sample
  // com.atlassian.greenhopper.service.sprint.Sprint@2d06f6ad[id=75,rapidViewId=3,state=ACTIVE,name=dev-sprint-64,goal=,startDate=2019-08-12T07:28:06.060Z,endDate=2019-08-17T21:28:00.000Z,completeDate=<null>,sequence=75]
  private parseSprint(rawSprint: string | Array<string>): string {
    if (rawSprint.length <= 0) {
      return "";
    } else {
      const pattern = /\,name=([a-zA-Z0-9-_]+)/g;
      let r = rawSprint.toString().match(pattern).map(v => v.replace(",name=", ""));

      if (r) {
        return r[r.length - 1];
      } else {
        return "";
      }
    }
  }
}