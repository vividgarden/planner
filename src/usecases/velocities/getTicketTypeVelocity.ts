
import { TicketRepository } from '../../repositories/ticketRepository';
import * as Enumerable from "linq";
import { Ticket } from '../../entities/ticket';
import { TicketTypeVelocity } from '../../entities/ticketTypeVelocity';

export class GetTicketTypeVelocity {
  private repository: TicketRepository;

  constructor(ticketRepository: TicketRepository) {
    this.repository = ticketRepository;
  }

  async execute(sprintName: string): Promise<Array<TicketTypeVelocity>> {
    const tickets = Enumerable.from(await this.repository.findByLatestSprintId(sprintName));
    const doneTickets = tickets.where(t => t.status === "Done");

    return doneTickets.groupBy(t => t.ticketType, null, (key: string, group: Array<Ticket>) => {
      const sampleTicket = Enumerable.from(group).first();
      const point = Enumerable.from(group).select(v => v.storyPoint).sum();

      const v: TicketTypeVelocity = {
        sprintName: sprintName,
        ticketType: key,
        point: point
      }
      return v;
    }).toArray();
  }
}