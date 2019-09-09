
import { TicketRepository } from '../../repositories/ticketRepository';
import * as Enumerable from "linq";
import { Ticket } from '../../entities/ticket';
import { AssigneeVelocity } from '../../entities/assigneeVelocity';

export class GetAssigneeVelocity {
  private repository: TicketRepository;

  constructor(ticketRepository: TicketRepository) {
    this.repository = ticketRepository;
  }

  async execute(sprintName: string): Promise<Array<AssigneeVelocity>> {
    const tickets = Enumerable.from(await this.repository.findByLatestSprintId(sprintName));
    const doneTickets = tickets.where(t => t.status === "Done");

    return doneTickets.groupBy(t => t.assignee, null, (key: string, group: Array<Ticket>) => {
      const point = Enumerable.from(group).select(v => v.storyPoint).sum();

      const v: AssigneeVelocity = {
        sprintName: sprintName,
        assignee: key,
        point: point
      }
      return v;
    }).toArray();
  }
}