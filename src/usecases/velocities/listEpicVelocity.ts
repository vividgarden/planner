import { TicketRepository } from '../../repositories/ticketRepository';
import * as Enumerable from "linq";
import { Ticket } from '../../entities/ticket';
import { EpicVelocity } from '../../entities/epicVelocity';
import { SprintRepository } from '../../repositories/sprintRepository';
import { GetEpicVelocity } from './getEpicVelocity';

export class ListEpicVelocity {
  private ticketRepository: TicketRepository;
  private sprintRepository: SprintRepository;

  constructor(ticketRepository: TicketRepository, sprintRepository: SprintRepository) {
    this.ticketRepository = ticketRepository;
    this.sprintRepository = sprintRepository;
  }

  async execute(): Promise<Array<EpicVelocity>> {
    const sprints = Enumerable.from(await this.sprintRepository.findAll()).orderBy(s => s.id).reverse();
    let epicVelocities: Array<EpicVelocity> = [];
    const getEpicVelocity = new GetEpicVelocity(this.ticketRepository)

    for(const sprint of sprints) {
      const velocities = await getEpicVelocity.execute(sprint.name)
      epicVelocities = epicVelocities.concat(velocities);
    }

    // FIXME: EpicNameが正しくJIRAから取得できないので、Ticketから引く。本当は同期処理を直したほうが良い
    const allTickets = Enumerable
      .from(await this.ticketRepository.findAll())
      .toDictionary(t => t.id);
    const results = Enumerable
      .from(epicVelocities)
      .select(e => {
        if (!e.epicId || e.epicId.length <= 0) {
          return e;
        }

        const t = allTickets.get(e.epicId);
        if (t) {
          return Object.assign({}, e, {epicName: t.summary });
        } else {
          return e;
        }
      })
      .toArray();

    return results;
  }
}