import { WatchingEpicRepository } from '../../repositories/watchingEpicRepository';
import { WatchingEpic } from 'src/entities/watchingEpic';

export class UpsertWatchingEpic {
  private repository: WatchingEpicRepository;

  constructor(watchingEpicRepository: WatchingEpicRepository) {
    this.repository = watchingEpicRepository;
  }

  execute(watchingEpic: WatchingEpic): Promise<void> {
    return this.repository.create(watchingEpic);
  }
}