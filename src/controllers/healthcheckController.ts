import * as express from "express";

export class HealthcheckController {
  public async index(req: express.Request, res: express.Response): Promise<void> {
    res.json({ system: "All Green" });
  }
}