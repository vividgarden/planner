export interface Sprint {
  id: number;
  name: string;
  state: string;
  startDate: Date | null;
  endDate: Date | null;
  completeDate: Date | null;
  originBoardId: number;
}