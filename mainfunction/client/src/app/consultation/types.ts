export interface AiResult {
  _id?: string;
  summary: string;
  urgency?: "Low" | "Medium" | "High" | "Limit Reached" | string;
  isLimitError?: boolean;
  upgradeUrl?: string;
  lifestyleAdvice?: string[];
  suggestedMedicines?: string[];
  reviewStatus?: "pending" | "reviewed" | "none" | string;
  doctorNotes?: string;
}

export type Language = "en" | "hi" | "gu";
