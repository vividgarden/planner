import { GetEpicVelocity } from '../usecases/velocities/getEpicVelocity';
import { TicketRepository } from '../repositories/ticketRepository';
import { SprintRepository } from '../repositories/sprintRepository';
import { Request, Response } from "express";
import { ListEpicVelocity } from '../usecases/velocities/listEpicVelocity';

export class EpicVelocitiesController {
  public async index(req: Request, res: Response): Promise<void> {
    const ticketRepository = new TicketRepository();
    const sprintRepository = new SprintRepository();
    const listEpicVelocity = new ListEpicVelocity(ticketRepository, sprintRepository);

    const epicVelocities = await listEpicVelocity.execute();
    res.json(epicVelocities);
  }

  public async get(req: Request, res: Response): Promise<void> {
    const ticketRepository = new TicketRepository();
    const getEpicVelocity = new GetEpicVelocity(ticketRepository);
    const sprintName: string = req.params.sprintName;

    const epicVelocities = await getEpicVelocity.execute(sprintName);
    res.json(epicVelocities);
  }
}