import { Request, Response } from "express";
import { TicketRepository } from "../repositories/ticketRepository";

export class SprintTicketsController {
  public async index(req: Request, res: Response): Promise<void> {
    const ticketRepository = new TicketRepository();
    const sprintId = req.params.sprintId;
    const tickets = await ticketRepository.findByLatestSprintId(sprintId);

    res.json({ count: tickets.length, tickets: tickets });
  }
}