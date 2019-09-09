import { TicketRepository } from '../../repositories/ticketRepository';
import * as Enumerable from "linq";
import { Ticket } from '../../entities/ticket';
import { EpicVelocity } from '../../entities/epicVelocity';

export class GetEpicVelocity {
  private repository: TicketRepository;

  constructor(ticketRepository: TicketRepository) {
    this.repository = ticketRepository;
  }

  async execute(sprintName: string): Promise<Array<EpicVelocity>> {
    const tickets = Enumerable.from(await this.repository.findByLatestSprintId(sprintName));
    const doneTickets = tickets.where(t => t.status === "Done");

    return doneTickets.groupBy(t => t.epicId, null, (key: string, group: Array<Ticket>) => {
      const sampleTicket = Enumerable.from(group).first();
      const epicId = sampleTicket && sampleTicket.epicId;
      const epicName = sampleTicket && sampleTicket.epicName;
      const point = Enumerable.from(group).select(v => v.storyPoint).sum();

      const v: EpicVelocity = {
        sprintName: sprintName,
        epicId: epicId,
        epicName: epicName,
        point: point
      }
      return v;
    }).toArray();
  }
}