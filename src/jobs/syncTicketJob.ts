import { LambdaResponse } from "../entities/lambdaResponse";
import { OriginalTicketRepository } from "../repositories/originalTicketRepository";
import { SyncTicket } from "../usecases/tickets/syncTicket";
import { TicketRepository } from "../repositories/ticketRepository";
import { SyncTableRepository } from '../repositories/syncTableRepository';

export class SyncTicketJob {
  public async perform(event: any, context: any, callback: any) {
    const syncTableRepository = new SyncTableRepository();
    const ticketRepository = new TicketRepository();
    const originalTicketRepository = new OriginalTicketRepository();
    const syncTicket = new SyncTicket(syncTableRepository, ticketRepository, originalTicketRepository);
    const result = await syncTicket.execute();

    if (result) {
      const successResponse: LambdaResponse = {
        statusCode: 200,
        body: JSON.stringify({ status: "success" })
      };
      callback(null, successResponse);
    } else {
      const errorResponse: LambdaResponse = {
        statusCode: 500,
        body: JSON.stringify({ status: "something wrong." })
      };
      callback(null, errorResponse);
    }
  }
}

export const handler = async (event: any, context: any, callback: any) => {
  const job = new SyncTicketJob();
  await job.perform(event, context, callback);
}