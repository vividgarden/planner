import { Ticket } from "../../entities/ticket";
import { TicketRepository } from '../../repositories/ticketRepository';

export class UpsertTicket {
  private repository: TicketRepository;

  constructor(ticketRepository: TicketRepository) {
    this.repository = ticketRepository;
  }

  execute(ticket: Ticket): Promise<void> {
    return this.repository.create(ticket);
  }
}