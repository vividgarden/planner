import { Request, Response } from "express";
import { TicketRepository } from '../repositories/ticketRepository';
import { ListAssigneeVelocity } from '../usecases/velocities/listAssigneeVelocity';
import { SprintRepository } from '../repositories/sprintRepository';
import { GetAssigneeVelocity } from '../usecases/velocities/getAssigneeVelocity';

export class AssigneeVelocitiesController {
  public async index(req: Request, res: Response): Promise<void> {
    const ticketRepository = new TicketRepository();
    const sprintRepository = new SprintRepository();
    const listAssigneeVelocity = new ListAssigneeVelocity(ticketRepository, sprintRepository);

    const epicVelocities = await listAssigneeVelocity.execute();
    res.json(epicVelocities);
  }

  public async get(req: Request, res: Response): Promise<void> {
    const ticketRepository = new TicketRepository();
    const getAssigneeVelocity = new GetAssigneeVelocity(ticketRepository);
    const sprintName: string = req.params.sprintName;

    const velocities = await getAssigneeVelocity.execute(sprintName);
    res.json(velocities);
  }
}