import { SprintRepository } from "../../repositories/sprintRepository";
import * as Enumerable from "linq";
import { Sprint } from "../../entities/sprint";

export class ListSprint {
  private repository: SprintRepository;

  constructor(sprintRepository: SprintRepository) {
    this.repository = sprintRepository;
  }

  async execute(): Promise<Array<Sprint>> {
    const sprints = await this.repository.findAll();

    return Enumerable
      .from(sprints)
      .orderBy(s => s.id)
      .reverse()
      .toArray();
  }
}