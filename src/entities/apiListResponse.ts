export interface ApiListResponse {
  success: boolean;
  total: number;
  limit: number;
  offset: number;
  records: Array<any>;
  status: number;
  error: any;
}