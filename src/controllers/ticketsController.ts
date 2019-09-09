import { Request, Response } from "express";
import { TicketRepository } from "../repositories/ticketRepository";

export class TicketsController {
  public async index(req: Request, res: Response): Promise<void> {
    const ticketRepository = new TicketRepository();
    const tickets = await ticketRepository.findAll();

    res.json({ count: tickets.length, tickets: tickets });
  }
}