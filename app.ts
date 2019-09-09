import * as express from "express";
import * as serverless from "serverless-http";
import * as aws from "aws-sdk";
import * as bodyParser from "body-parser";
import { PlannerRoutes } from "./src/routes/plannerRoutes";

class App {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.app.use(bodyParser.json({ strict: false }));
  }

  start(): express.Application {
    this.setCors(this.app);
    this.setRoutes(this.app);

    return this.app;
  }

  private setCors(app: express.Application): void {
    app.use((req: express.Request, res: express.Response, next: express.NextFunction): void => {
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      next();
    });
  }

  private setRoutes(app: express.Application): void {
    const plannerRoutes = new PlannerRoutes();
    plannerRoutes.routes(this.app);
  }
}

const app = new App().start();
export const handler = serverless(app);
