export interface Ticket {
  id: string;
  link: string;
  ticketType: string;
  summary: string;
  status: string;
  assignee: string;
  reporter: string;
  storyPoint: number;
  latestSprint: string;
  epicId: string;
  epicName: string;
  projectId: number;
  projectName: string;
  createdAt: Date;
  updatedAt: Date;
}