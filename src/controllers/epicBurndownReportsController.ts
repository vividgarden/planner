import { Request, Response } from "express";
import { TicketRepository } from '../repositories/ticketRepository';
import { GetEpicBurndown } from '../usecases/reports/getEpicBurndown';
import { SprintRepository } from "../repositories/sprintRepository";

export class EpicBurndownReportsController {
  DEFAULT_PLAN_POINT = 10;

  public get = async (req: Request, res: Response): Promise<void> => {
    const ticketRepository = new TicketRepository();
    const sprintRepository = new SprintRepository();
    const getEpicBurndown = new GetEpicBurndown(ticketRepository, sprintRepository);
    const epicId = req.params.epicId;
    const planPoint = req.query.planPoint || this.DEFAULT_PLAN_POINT;
    const firstSprint = req.query.firstSprint || "";

    const burndownItems = await getEpicBurndown.execute(epicId, planPoint, firstSprint);

    res.json({ items: burndownItems });
  }
}