import { LambdaResponse } from "../entities/lambdaResponse";
import { SprintRepository } from "../repositories/sprintRepository";
import { OriginalSprintRepository } from "../repositories/originalSprintRepository";
import { BoardRepository } from '../repositories/boardRepository';
import { SyncSprint } from '../usecases/sprints/syncSprint';

export class SyncSprintJob {
  public async perform(event: any, context: any, callback: any) {
    const sprintRepository = new SprintRepository();
    const originalSprintRepository = new OriginalSprintRepository();
    const boardRepository = new BoardRepository();
    const boards = await boardRepository.findAll();

    const syncSprint = new SyncSprint(sprintRepository, originalSprintRepository);
    await syncSprint.execute(boards);
    const successResponse: LambdaResponse = {
      statusCode: 200,
      body: JSON.stringify({ status: "success" })
    };
    callback(null, successResponse);
  }
}

export const handler = async (event: any, context: any, callback: any) => {
  const job = new SyncSprintJob();
  await job.perform(event, context, callback);
}