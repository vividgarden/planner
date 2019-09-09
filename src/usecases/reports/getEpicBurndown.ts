import { EpicBurndownItem } from './../../entities/epicBurndownItem';
import { TicketRepository } from '../../repositories/ticketRepository';
import { Ticket } from '../../entities/ticket';
import * as Enumerable from "linq";
import { SprintRepository } from '../../repositories/sprintRepository';
import { ListSprint } from '../sprints/listSprint';
import { ListEpicVelocity } from '../velocities/listEpicVelocity';

interface CalcSprint {
  sprintNumber: number;
  sprintBaseName: string;
  startDate: Date | null;
  endDate: Date | null;
  point: number;
  forecast: boolean;
}

export class GetEpicBurndown {
  private ticketRepository: TicketRepository;
  private sprintRepository: SprintRepository;

  constructor(ticketRepository: TicketRepository, sprintRepository: SprintRepository) {
    this.ticketRepository = ticketRepository;
    this.sprintRepository = sprintRepository;
  }

  async execute(epicId: string, planPoint: number, firstSprint: string = ""): Promise<Array<EpicBurndownItem>> {
    const epicTickets = await this.ticketRepository.findByEpicId(epicId)
    const epicFirstSprint = this.getFirstSprint(epicTickets, firstSprint);

    if (!epicFirstSprint || planPoint <= 0) {
      return [];
    }

    const itemsWithoutRemaining = await this.getBurndownItemsWithoutRemaining(epicId, planPoint, epicTickets, epicFirstSprint);
    const itemsWithoutEstimation = this.setRemainingPoints(itemsWithoutRemaining);
    const itemsWithForecast = this.setForecastRemainingPoints(itemsWithoutEstimation, planPoint);
    const itemsWithStartPoint = this.moveSprintEndPointToStartPoint(itemsWithForecast);
    const lastSprint = itemsWithStartPoint.where(item => item.remainingPoint > 0).last();
    const results = itemsWithStartPoint.where(item => item.sprintNumber <= lastSprint.sprintNumber + 1).toArray();

    return results;
  }

  private async getBurndownItemsWithoutRemaining(
    epicId: string, planPoint: number, epicTickets: Array<Ticket>, epicFirstSprint: string
  ): Promise<Enumerable.IEnumerable<EpicBurndownItem>> {
    const firstSprintNumber = this.getSprintNumber(epicFirstSprint);
    const relatedSprints = await this.getRelatedSprints(epicFirstSprint);
    const epicVelocities = await this.getEpicVelocities(epicId);
    const disappearanceVelocities = this.getDisappearanceVelocities(relatedSprints, epicTickets);
    const totalPoints = this.getSprintTotalPoints(relatedSprints, epicTickets);

    const totalFirstSprintNumber = totalPoints.toEnumerable().select(s => s.key).firstOrDefault(0);
    const totalLastSprintNumber = totalPoints.toEnumerable().select(s => s.key).lastOrDefault(0);
    const planPoints = this.getPlanPoints(firstSprintNumber, totalPoints.get(totalFirstSprintNumber), planPoint);
    const sprints = this.appendForecastSprints(relatedSprints);

    const items = sprints.orderBy(s => s.sprintNumber).select(s => {
      let total = 0;
      if (s.sprintNumber < totalFirstSprintNumber) {
        total = totalPoints.get(totalFirstSprintNumber);
      } else if (s.sprintNumber >= totalLastSprintNumber) {
        total = totalPoints.get(totalLastSprintNumber);
      } else {
        total = totalPoints.get(s.sprintNumber);
      }
      const planPoint = planPoints.get(s.sprintNumber) || 0;
      const epicVelocity = epicVelocities.get(s.sprintNumber) || 0;
      const disappearancePoint = disappearanceVelocities.get(s.sprintNumber) || 0;

      let b: EpicBurndownItem = {
        epicId: epicId,
        sprintName: `${s.sprintBaseName}${s.sprintNumber}`,
        sprintNumber: s.sprintNumber,
        remainingPlanPoint: planPoint,
        remainingPoint: 0,
        forecast: s.forecast,
        velocity: epicVelocity,
        disappearancePoint: disappearancePoint,
        totalPoint: total,
        sprintStartDate: s.startDate
      };

      return b;
    }).toArray();

    return Enumerable.from(items);
  }

  private setRemainingPoints(items: Enumerable.IEnumerable<EpicBurndownItem>): Enumerable.IEnumerable<EpicBurndownItem> {
    const points = items.select(i => i.velocity + i.disappearancePoint).toArray();

    let currentTotal = 0;
    let totals: Array<number> = [];
    points.forEach(point => {
      currentTotal += point;
      totals = totals.concat(currentTotal);
    });

    const remainingItems = items.zip(totals, (item, total) => {
      const r = Object.assign(
        {}, 
        item, 
        { remainingPoint: item.totalPoint - total }
      );

      return r;
    }).toArray();

    return Enumerable.from(remainingItems);
  }

  private setForecastRemainingPoints(items: Enumerable.IEnumerable<EpicBurndownItem>, planPoint: number): Enumerable.IEnumerable<EpicBurndownItem> {
    let remainingPoint = items.where(s => s.forecast).first().remainingPoint;

    const results = items.select(item => {
      if (!item.forecast) {
        return item;
      }
      remainingPoint -= planPoint;
      if (remainingPoint < 0) {
        remainingPoint = 0;
      }

      const r: EpicBurndownItem = Object.assign({}, item, { remainingPoint: remainingPoint });
      return r;
    }).toArray();

    return Enumerable.from(results);
  }

  // 残ポイントはエピック終了時の値を設定している。ロジックでエピック開始時の値にずらす
  private moveSprintEndPointToStartPoint(items: Enumerable.IEnumerable<EpicBurndownItem>): Enumerable.IEnumerable<EpicBurndownItem> {
    const pItems: Enumerable.IEnumerable<EpicBurndownItem | null> = Enumerable.from([null]);
    const prevItems = pItems.concat(items);

    const results = prevItems.zip(items, (prev, next) => {
      if (!prev) {
        return Object.assign({}, next, {
          remainingPoint: next.totalPoint,
        });
      } else {
        return Object.assign({}, next, {
          remainingPoint: prev.remainingPoint
        });
      }
    }).toArray();

    return Enumerable.from(results);
  }

  private getFirstSprint(tickets: Array<Ticket>, queryFirstSprint: string): string | undefined {
    let epicFirstSprint: string | undefined;

    if (queryFirstSprint.length > 0) {
      epicFirstSprint = queryFirstSprint;
    } else {
      epicFirstSprint = this.getFirstSprintFromTickets(tickets);
    }

    return epicFirstSprint;
  }

  private getFirstSprintFromTickets(tickets: Array<Ticket>): string | undefined {
    const firstSprint = Enumerable
      .from(tickets)
      .where(t => t.latestSprint.length > 0)
      .orderBy(t => this.getSprintNumber(t.latestSprint))
      .firstOrDefault(undefined);

    return firstSprint && firstSprint.latestSprint;
  }

  private getSprintNumber(sprintName: string) {
    const sprintNumber = sprintName.match(/\d+/g)
    return sprintNumber && sprintNumber[0] ? parseInt(sprintNumber[0]) : Number.MAX_VALUE;
  }

  // スプリント名には数字が含まれていない前提
  // dev-sprint-67  ==>  dev-sprint-
  private getSprintNameWithoutNumber(sprintName: string) {
    const number = this.getSprintNumber(sprintName);
    return sprintName.replace(number.toString(), "");
  }

  private async getEpicVelocities(epicId: string): Promise<Enumerable.IDictionary<number, number>> {
    const velocities = await new ListEpicVelocity(this.ticketRepository, this.sprintRepository).execute();
    const epicVelocities = Enumerable
      .from(velocities)
      .where(v => v.epicId == epicId);

    return Enumerable.from(epicVelocities).toDictionary(
      e => this.getSprintNumber(e.sprintName),
      e => e.point
    );
  }

  private async getRelatedSprints(epicFirstSprint: string): Promise<Array<CalcSprint>> {
    const sprintNumber = this.getSprintNumber(epicFirstSprint);
    const sprintBaseName = this.getSprintNameWithoutNumber(epicFirstSprint);
    const listSprint = new ListSprint(this.sprintRepository);
    const sprints = await listSprint.execute();
    const relatedSprints = Enumerable
      .from(sprints)
      .where(s => this.getSprintNameWithoutNumber(s.name) === sprintBaseName)
      .where(s => this.getSprintNumber(s.name) >= sprintNumber);

    let calcSprints = relatedSprints.select(s => {
      const c: CalcSprint = {
        sprintNumber: this.getSprintNumber(s.name),
        sprintBaseName: sprintBaseName,
        startDate: s.startDate,
        endDate: null,
        point: 0,
        forecast: false
      };
      return c;
    }).orderBy(s => s.sprintNumber).toArray();

    for(let i = 0; i < calcSprints.length; i++) {
      const next = calcSprints[i + 1];
      if (next) {
        calcSprints[i].endDate = next.startDate;
      } else {
        calcSprints[i].endDate = new Date(2038, 1, 1);
      }
    }

    return calcSprints;
  }

  private appendForecastSprints(sprints: Array<CalcSprint>): Enumerable.IEnumerable<CalcSprint> {
    if (sprints.length <= 0) {
      return Enumerable.empty();
    }

    // Note: 100スプリント超えて予測値出すことはないと思われるので、雑に100個予測スプリントを追加
    const lastSprint = Enumerable
      .from(sprints)
      .orderBy(s => s.sprintNumber)
      .last();
    const forecastSprints = Enumerable
      .range(1, 100)
      .select(i => {
        const s: CalcSprint = {
          sprintNumber: i + lastSprint.sprintNumber,
          sprintBaseName: lastSprint.sprintBaseName,
          startDate: lastSprint.endDate, // 不明
          endDate: lastSprint.endDate,   // 不明
          point: 0,
          forecast: true
        };
        return s;
      });

    return Enumerable.from(sprints).concat(forecastSprints);
  }

  private getPlanPoints(startSprintNumber: number, totalPoint: number, planPoint: number): Enumerable.IDictionary<number, number> {
    let currentTotal = totalPoint;
    let sprintNum = startSprintNumber;
    let sprintPointPairs: Enumerable.IDictionary<number, number> = Enumerable
      .empty()
      .toDictionary(s => 0, s => 0);

    for(; currentTotal > 0; currentTotal -= planPoint, sprintNum++) {
      sprintPointPairs.add(sprintNum, currentTotal);
    }
    sprintPointPairs.add(sprintNum, 0);

    return sprintPointPairs;
  }

  // Sprint対象外でDoneになったチケット または 却下したチケット のポイント
  private getDisappearanceVelocities(sprints: Array<CalcSprint>, tickets: Array<Ticket>): Enumerable.IDictionary<number, number> {
    const rejectTickets = Enumerable.from(tickets).where(t => t.status === "却下");
    const noSprintDoneTickets = Enumerable.from(tickets).where(t => t.latestSprint.length <= 0 && t.status === "Done");
    const calcTickets = rejectTickets.concat(noSprintDoneTickets.toArray());

    const cs = Enumerable.from(sprints).orderBy(s => s.sprintNumber).select(s => {
      const targetTickets = calcTickets.where(c => s.startDate! <= c.updatedAt && c.updatedAt < s.endDate!);
      const point = targetTickets.select(c => c.storyPoint).sum();
      const c: CalcSprint = {
        sprintNumber: s.sprintNumber,
        sprintBaseName: s.sprintBaseName,
        startDate: s.startDate,
        endDate: s.endDate,
        point: point,
        forecast: false
      };
      return c;
    });

    return cs.toDictionary(c => c.sprintNumber, c => c.point);
  }

  private getSprintTotalPoints(sprints: Array<CalcSprint>, tickets: Array<Ticket>): Enumerable.IDictionary<number, number> {
    const cs = Enumerable.from(sprints).orderBy(s => s.sprintNumber).select(s => {
      const startDate = s.startDate || new Date(2038, 1, 1);
      const targetTickets = Enumerable.from(tickets).where(c => c.createdAt <= startDate);
      const point = targetTickets.select(s => s.storyPoint).sum();

      const c: CalcSprint = {
        sprintNumber: s.sprintNumber,
        sprintBaseName: s.sprintBaseName,
        startDate: s.startDate,
        endDate: s.endDate,
        point: point,
        forecast: false
      };
      return c;
    });

    return cs.toDictionary(c => c.sprintNumber, c => c.point);
  }
}