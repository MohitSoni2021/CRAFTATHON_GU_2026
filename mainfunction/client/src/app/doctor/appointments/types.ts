export interface Patient {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

export interface Appointment {
  _id: string;
  userId: Patient;
  date: string;
  time: string;
  mode: "Online" | "Offline";
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
}
