
import { ApiListResponse } from './../entities/apiListResponse';
import dig from "../libs/dig";
import { JiraClient } from "../libs/jira/client";
import { Sprint } from '../entities/sprint';

export class OriginalSprintRepository {
  private jiraClient: JiraClient;
  private SPRINT_REQUEST_LIMIT = 50;

  constructor() {
    this.jiraClient = new JiraClient();
  }

  public async findAllByBoardId(boardId: number): Promise<ApiListResponse> {
    try {
      let sprints: Array<Sprint> = [];

      for(let startAt = 0;; startAt += this.SPRINT_REQUEST_LIMIT) {
        const r = await this.jiraClient.get(`/rest/agile/1.0/board/${boardId}/sprint`, { 
          params: { maxResults: this.SPRINT_REQUEST_LIMIT, startAt: startAt }
        });
        const data = r.data;
        const dataSprints = data.values.map((v: any) => this.parseSprint(v));
        sprints = sprints.concat(dataSprints);

        if (dataSprints.length <=0 || data.isLast) {
          break;
        }
      }

      const res: ApiListResponse = {
        success: true,
        total: sprints.length,
        limit: 0,
        offset: 0,
        records: sprints,
        status: 200,
        error: null
      };

      return res;
    } catch (error) {
      const res: ApiListResponse = {
        success: false,
        total: 0,
        limit: 0,
        offset: 0,
        records: [],
        status: dig(error, "status") || 500,
        error: error
      };

      return res;
    }
  }

  private parseSprint(sprint: any): Sprint {
    const b: Sprint = {
      id: sprint.id,
      name: sprint.name,
      state: sprint.state,
      startDate: sprint.startDate ? new Date(sprint.startDate) : null,
      endDate: sprint.endDate ? new Date(sprint.endDate) : null,
      completeDate: sprint.completeDate ? new Date(sprint.completeDate) : null,
      originBoardId: sprint.originBoardId,
    };

    return b;
  }
}