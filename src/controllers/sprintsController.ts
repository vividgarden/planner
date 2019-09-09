import { Request, Response } from "express";
import { SprintRepository } from '../repositories/sprintRepository';
import { ListSprint } from '../usecases/sprints/listSprint';

export class SprintsController {
  public async index(req: Request, res: Response): Promise<void> {
    const repository = new SprintRepository();
    const listSprint = new ListSprint(repository);
    const sprints = await listSprint.execute();

    res.json({ count: sprints.length, sprints: sprints });
  }
}