import { Ticket } from './ticket';

export interface EpicBurndownItem {
  epicId: string;
  sprintName: string;
  sprintNumber: number;
  remainingPlanPoint: number;
  remainingPoint: number;
  forecast: boolean;
  totalPoint: number;
  velocity: number;
  disappearancePoint: number;
  sprintStartDate: Date | null;
}