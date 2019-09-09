import { TicketRepository } from '../../repositories/ticketRepository';
import * as Enumerable from "linq";
import { Ticket } from '../../entities/ticket';
import { SprintRepository } from '../../repositories/sprintRepository';
import { TicketTypeVelocity } from '../../entities/ticketTypeVelocity';
import { GetTicketTypeVelocity } from './getTicketTypeVelocity';

export class ListTicketTypeVelocity {
  private ticketRepository: TicketRepository;
  private sprintRepository: SprintRepository;

  constructor(ticketRepository: TicketRepository, sprintRepository: SprintRepository) {
    this.ticketRepository = ticketRepository;
    this.sprintRepository = sprintRepository;
  }

  async execute(): Promise<Array<TicketTypeVelocity>> {
    const sprints = Enumerable.from(await this.sprintRepository.findAll()).orderBy(s => s.id).reverse();
    let ticketTypeVelocities: Array<TicketTypeVelocity> = [];
    const getTicketTypeVelocity = new GetTicketTypeVelocity(this.ticketRepository);

    for(const sprint of sprints) {
      const velocities = await getTicketTypeVelocity.execute(sprint.name);
      ticketTypeVelocities = ticketTypeVelocities.concat(velocities);
    }

    return ticketTypeVelocities;
  }
}