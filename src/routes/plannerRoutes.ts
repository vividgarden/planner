import * as express from "express";
import { HealthcheckController } from '../controllers/healthcheckController';
import { JiraSynchronizeController } from '../controllers/jiraSynchronizeController';
import { JiraOriginalTicketsController } from '../controllers/jiraOriginalTicketsController';
import { TicketsController } from '../controllers/ticketsController';
import { SprintTicketsController } from "../controllers/sprintTicketsController";
import { EpicVelocitiesController } from '../controllers/epicVelocitiesController';
import { TicketTypeVelocitiesController } from '../controllers/ticketTypeVelocitiesController';
import { AssigneeVelocitiesController } from '../controllers/assigneeVelocitiesController';
import { SprintsController } from '../controllers/sprintsController';
import { WatchingEpicsController } from '../controllers/watchingEpicsController';
import { EpicBurndownReportsController } from '../controllers/epicBurndownReportsController';

export class PlannerRoutes {
  private healthcheckController = new HealthcheckController();
  private jiraSynchronizeController = new JiraSynchronizeController();
  private jiraOriginalTicketsController = new JiraOriginalTicketsController();
  private sprintTicketsController = new SprintTicketsController();
  private ticketsController = new TicketsController();
  private epicVelocitiesController = new EpicVelocitiesController();
  private ticketTypeVelocitiesController = new TicketTypeVelocitiesController();
  private assigneeVelocitiesController = new AssigneeVelocitiesController();
  private sprintsController = new SprintsController();
  private watchingEpicsController = new WatchingEpicsController();
  private epicBurndownReportsController = new EpicBurndownReportsController();

  public routes(app: express.Application): void {
    app
      .route("/")
      .get(this.healthcheckController.index);

    // healthcheck
    app
      .route("/healthcheck")
      .get(this.healthcheckController.index);

    // jira
    app
      .route("/jira/sync")
      .post(this.jiraSynchronizeController.post);
    app
      .route("/jira/original/tickets")
      .get(this.jiraOriginalTicketsController.index);
    app
      .route("/jira/original/tickets/:id")
      .get(this.jiraOriginalTicketsController.show);

    // tickets
    app
      .route("/sprint/:sprintId/tickets")
      .get(this.sprintTicketsController.index);
    app
      .route("/tickets")
      .get(this.ticketsController.index);

    // velocities
    app
      .route("/epicVelocities")
      .get(this.epicVelocitiesController.index);
    app
      .route("/epicVelocities/:sprintName")
      .get(this.epicVelocitiesController.get);

    app
      .route("/ticketTypeVelocities")
      .get(this.ticketTypeVelocitiesController.index);
    app
      .route("/ticketTypevelocities/:sprintName")
      .get(this.ticketTypeVelocitiesController.get);

    app
      .route("/assigneeVelocities")
      .get(this.assigneeVelocitiesController.index);
    app
      .route("/assigneeVelocities/:sprintName")
      .get(this.assigneeVelocitiesController.get);

    // sprints
    app
      .route("/sprints")
      .get(this.sprintsController.index);

    // watching epics
    app
      .route("/watchingEpics")
      .get(this.watchingEpicsController.index)
      .post(this.watchingEpicsController.create);

    // reports
    app
      .route("/reports/epicBurndown/:epicId")
      .get(this.epicBurndownReportsController.get);
  }
}