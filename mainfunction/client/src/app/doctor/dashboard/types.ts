export interface User {
  _id: string;
  name?: string;
  profileImage?: string;
}

export interface Consultation {
  _id: string;
  user?: User;
  date: string;
  symptoms: string;
  urgency: string;
  aiSummary: string;
  actions?: string[];
  suggestedMedicines?: string[];
}

export interface Meeting {
  _id: string;
  topic: string;
  reason: string;
  urgency: string;
  scheduledAt?: string;
  createdAt: string;
  summary?: string;
  meetingLink?: string;
  requester?: User;
}

export interface Appointment {
  _id: string;
  date: string;
  time: string;
  type: string;
  mode: string;
  status: string;
  userId: User;
}
