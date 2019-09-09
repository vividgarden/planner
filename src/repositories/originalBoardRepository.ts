import { Board } from './../entities/board';
import { ApiListResponse } from './../entities/apiListResponse';
import dig from "../libs/dig";
import { JiraClient } from "../libs/jira/client";

export class OriginalBoardRepository {
  private jiraClient: JiraClient;

  constructor() {
    this.jiraClient = new JiraClient();
  }

  public async findAll(): Promise<ApiListResponse> {
    try {
      const r = await this.jiraClient.get("/rest/greenhopper/latest/rapidviews/list")
      const data = r.data;
      const boards = data.views.map((v: any) => this.parseBoard(v));
      const res: ApiListResponse = {
        success: true,
        total: boards.length,
        limit: 0,
        offset: 0,
        records: boards,
        status: r.status,
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

  private parseBoard(board: any): Board {
    const b: Board = {
      id: board.id,
      name: board.name,
      locationKey: dig(board, "location", "locationKey")
    };

    return b;
  }
}