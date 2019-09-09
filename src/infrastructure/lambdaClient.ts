import { Lambda } from "aws-sdk";
import { handler as SyncTicketJobHandler } from "../jobs/syncTicketJob";
import { handler as SyncBoardJobHandler } from "../jobs/syncBoardJob";
import { handler as SyncSprintJobHandler } from "../jobs/syncSprintJob";

interface ILambdaClient {
  invoke(functionName: string, invocationType: string, payload: string): Promise<any>;
}

class RemoteLambdaClient implements ILambdaClient {
  private lambda: Lambda;
  private projectName: string = "planner";

  constructor() {
    this.lambda = new Lambda({
      apiVersion: "2015-03-31",
      region: process.env.region
    });
  }

  invoke(functionName: string, invocationType: string, payload: string): Promise<any> {
    return this.lambda.invoke({
      FunctionName: `${this.projectName}-${process.env.stage}-${functionName}`,
      InvocationType: invocationType,
      Payload: payload,
    }).promise();
  }
}

class LocalLambdaClient implements ILambdaClient {
  private localLambdaMapping: { [key: string]: any; } = {
    "syncTicketJob": SyncTicketJobHandler,
    "syncBoardJob": SyncBoardJobHandler,
    "syncSprintJob": SyncSprintJobHandler,
  };

  invoke(functionName: string, invocationType: string, payload: string): Promise<any> {
    const handler = this.localLambdaMapping[functionName];

    // async call not implemented.
    return new Promise(
      (resolve: (error: any, response: any) => void, reject: (a: any) => void) => {
        if (handler) {
          let e;
          let r;

          handler(null, null, (error: any, response: any) => {
            e = error;
            r = response;
          });
          resolve(e, r);
        }
        reject(new Error("Method not implemented."));
      }
    );
  }
}

const getLambdaClient = (): ILambdaClient => {
  if (process.env.IS_OFFLINE === 'true') {
    return new LocalLambdaClient();
  } else {
    return new RemoteLambdaClient();
  }
}
const LambdaClient = getLambdaClient();
export default LambdaClient;