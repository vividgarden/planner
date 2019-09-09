import { SprintRepository } from "../../repositories/sprintRepository";
import { Sprint } from "../../entities/sprint";

export class UpsertSprint {
  private repository: SprintRepository;

  constructor(sprintRepository: SprintRepository) {
    this.repository = sprintRepository;
  }

  execute(sprint: Sprint): Promise<void> {
    return this.repository.create(sprint);
  }
}