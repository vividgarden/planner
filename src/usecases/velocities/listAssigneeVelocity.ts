import { TicketRepository } from '../../repositories/ticketRepository';
import * as Enumerable from "linq";
import { Ticket } from '../../entities/ticket';
import { SprintRepository } from '../../repositories/sprintRepository';
import { AssigneeVelocity } from '../../entities/assigneeVelocity';
import { GetAssigneeVelocity } from './getAssigneeVelocity';

export class ListAssigneeVelocity {
  private ticketRepository: TicketRepository;
  private sprintRepository: SprintRepository;

  constructor(ticketRepository: TicketRepository, sprintRepository: SprintRepository) {
    this.ticketRepository = ticketRepository;
    this.sprintRepository = sprintRepository;
  }

  async execute(): Promise<Array<AssigneeVelocity>> {
    const sprints = Enumerable.from(await this.sprintRepository.findAll()).orderBy(s => s.id).reverse();
    let assigneeVelocities: Array<AssigneeVelocity> = [];
    const getAssigneeVelocity = new GetAssigneeVelocity(this.ticketRepository);

    for(const sprint of sprints) {
      const velocities = await getAssigneeVelocity.execute(sprint.name);
      assigneeVelocities = assigneeVelocities.concat(velocities);
    }

    return assigneeVelocities;
  }
}