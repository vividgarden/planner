import axios from "axios";

export class JiraClient {
  async get(path: string, params: any = {}) {
    const res = await axios.get(`${process.env.jiraHost}${path}`, this.appendAuthHeader(params));

    return res;
  }

  private appendAuthHeader(params: any): any {
    const buf = new Buffer(`${process.env.jiraUser}:${process.env.jiraSecret}`);
    const base64 = buf.toString("base64");

    return Object.assign({}, params, {
      headers: {
        Authorization: `Basic ${base64}`
      }
    });
  }
}