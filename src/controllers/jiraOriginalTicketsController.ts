import { Request, Response } from "express";
import { OriginalTicketRepository } from "../repositories/originalTicketRepository";

export class JiraOriginalTicketsController {

  public async index(req: Request, res: Response): Promise<void> {
    const ticketRepository = new OriginalTicketRepository();
    const jql = req.query.jql || "";
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;

    const r = await ticketRepository.findAll(jql, limit, offset);

    if (r.success) {
      res.json(r);
    } else {
      res.status(r.status);
      res.json({ error: r.error });
    }
  }

  public async show(req: Request, res: Response): Promise<void> {
    const ticketRepository = new OriginalTicketRepository();
    const id = req.params.id;

    const r = await ticketRepository.find(id);

    if (r.success) {
      res.json(r);
    } else {
      res.status(r.status);
      res.json({ error: r.error });
    }
  }
}