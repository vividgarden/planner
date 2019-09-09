import { OriginalTicketRepository } from "../../repositories/originalTicketRepository";
import { Ticket } from "../../entities/ticket";
import { TicketRepository } from "../../repositories/ticketRepository";
import { UpsertTicket } from "./UpsertTicket";
import { SyncTableRepository } from '../../repositories/syncTableRepository';

export class SyncTicket {
  private JIRA_LIMIT = 100;
  private SYNC_NAME = "tickets";

  private syncTableRepository: SyncTableRepository;
  private ticketRepository: TicketRepository;
  private originalTicketRepository: OriginalTicketRepository;

  constructor(
    syncTableRepository: SyncTableRepository,
    ticketRepository: TicketRepository,
    originalTicketRepository: OriginalTicketRepository
  ) {
    this.syncTableRepository = syncTableRepository;
    this.ticketRepository = ticketRepository;
    this.originalTicketRepository = originalTicketRepository;
  }

  async execute(): Promise<boolean> {
    let success = true;
    const upsertTicket = new UpsertTicket(this.ticketRepository);
    const lastSynced = (await this.syncTableRepository.find(this.SYNC_NAME)) || new Date(1970, 1, 1);
    let fetchLastSync = lastSynced;

    for(let offset = 0; offset < Number.MAX_VALUE; offset += this.JIRA_LIMIT) {
      const res = await this.originalTicketRepository.findAll("ORDER BY updated DESC", this.JIRA_LIMIT, offset);
      if (!res.success) {
        success = false;
        break;
      }
      if (this.isComplete(lastSynced, res.records)) {
        break;
      }

      for(const t of res.records) {
        await upsertTicket.execute(t);

        if (fetchLastSync < t.updatedAt) {
          fetchLastSync = t.updatedAt;
        }
      }
    }

    if (lastSynced != fetchLastSync) {
      this.syncTableRepository.create(this.SYNC_NAME, fetchLastSync);
    }

    return true;
  }

  private isComplete(lastSynced: Date, records: Array<Ticket>): boolean {
    if (records.length <= 0) {
      return true;
    }
    if (records[0].updatedAt.getTime() <= lastSynced.getTime()) {
      return true;
    }

    return false;
  }
}