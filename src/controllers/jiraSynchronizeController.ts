import { Request, Response } from "express";
import LambdaClient from "../infrastructure/lambdaClient";

export class JiraSynchronizeController {
  public async post(req: Request, res: Response): Promise<void> {
    try {
      await LambdaClient.invoke("syncBoardJob", "RequestResponse", "{}");
      await LambdaClient.invoke("syncSprintJob", "Event", "{}");
      await LambdaClient.invoke("syncTicketJob", "Event", "{}");
      res.json({ result: "Success" });
    } catch (error) {
      res.status(500);
      res.json({ error: error });
    }
  }
}