import { Request, Response } from "express";
import { WatchingEpicRepository } from '../repositories/watchingEpicRepository';
import { UpsertWatchingEpic } from '../usecases/watchingEpics/upsertWatchingEpic';
import { WatchingEpic } from '../entities/watchingEpic';

export class WatchingEpicsController {
  public async index(req: Request, res: Response): Promise<void> {
    const repository = new WatchingEpicRepository();

    const watchingEpics = await repository.findAll();
    res.json({ count: watchingEpics.length, records: watchingEpics });
  }

  public async create(req: Request, res: Response): Promise<void> {
    const repository = new WatchingEpicRepository();
    const upsertWatchingEpic = new UpsertWatchingEpic(repository);

    const watchingEpic: WatchingEpic = {
      id: req.body.id,
      planPoint: req.body.planPoint,
      active: req.body.active
    };
    await upsertWatchingEpic.execute(watchingEpic);

    res.json({ success: true });
  }
}