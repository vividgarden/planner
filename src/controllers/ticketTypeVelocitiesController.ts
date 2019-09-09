import { Request, Response } from "express";
import { TicketRepository } from '../repositories/ticketRepository';
import { ListTicketTypeVelocity } from '../usecases/velocities/listTicketTypeVelocity';
import { SprintRepository } from '../repositories/sprintRepository';
import { GetTicketTypeVelocity } from '../usecases/velocities/getTicketTypeVelocity';

export class TicketTypeVelocitiesController {
  public async index(req: Request, res: Response): Promise<void> {
    const ticketRepository = new TicketRepository();
    const sprintRepository = new SprintRepository();
    const listTicketTypeVelocity = new ListTicketTypeVelocity(ticketRepository, sprintRepository);

    const epicVelocities = await listTicketTypeVelocity.execute();
    res.json(epicVelocities);
  }

  public async get(req: Request, res: Response): Promise<void> {
    const ticketRepository = new TicketRepository();
    const getTicketTypeVelocity = new GetTicketTypeVelocity(ticketRepository)
    const sprintName: string = req.params.sprintName;

    const velocities = await getTicketTypeVelocity.execute(sprintName);
    res.json(velocities);
  }
}