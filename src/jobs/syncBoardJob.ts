import { BoardRepository } from './../repositories/boardRepository';
import { LambdaResponse } from "../entities/lambdaResponse";
import { OriginalBoardRepository } from '../repositories/originalBoardRepository';
import { SyncBoard } from '../usecases/boards/syncBoard';

export class SyncBoardJob {
  public async perform(event: any, context: any, callback: any) {
    const boardRepository = new BoardRepository();
    const originalBoardRepository = new OriginalBoardRepository();

    const syncBoard = new SyncBoard(boardRepository, originalBoardRepository);
    await syncBoard.execute();
    const successResponse: LambdaResponse = {
      statusCode: 200,
      body: JSON.stringify({ status: "success" })
    };
    callback(null, successResponse);
  }
}

export const handler = async (event: any, context: any, callback: any) => {
  const job = new SyncBoardJob();
  await job.perform(event, context, callback);
}