import { SprintRepository } from "../../repositories/sprintRepository";
import { OriginalSprintRepository } from "../../repositories/originalSprintRepository";
import { Board } from '../../entities/board';
import { UpsertSprint } from "./upsertSprint";

export class SyncSprint {
  private sprintRepository: SprintRepository;
  private originalSprintRepository: OriginalSprintRepository;

  constructor(sprintRepository: SprintRepository, originalSprintRepository: OriginalSprintRepository) {
    this.sprintRepository = sprintRepository;
    this.originalSprintRepository = originalSprintRepository;
  }

  async execute(boards: Array<Board>): Promise<boolean> {
    const upsertSprint = new UpsertSprint(this.sprintRepository);

    for(const board of boards) {
      const sprints = await this.originalSprintRepository.findAllByBoardId(board.id);

      for(const sprint of sprints.records) {
        await upsertSprint.execute(sprint);
      }
    }

    return true;
  }
}