export interface BiometricValue {
  systolic?: number;
  diastolic?: number;
}

export interface BiometricTrend {
  date: string;
  value: number | BiometricValue;
}

export interface HealthTrends {
  bp: BiometricTrend[];
  weight: BiometricTrend[];
  glucose: BiometricTrend[];
}

export interface DoctorReport {
  _id: string;
  doctorName: string;
  visitDate: string;
  diagnosis: string;
}

export interface Prescription {
  _id: string;
  doctorName: string;
  date: string;
  medicines: Array<{ name: string } | string>;
}

export interface LabReport {
  _id: string;
  testType: string;
  reportDate: string;
  parsedResults?: {
    summary?: { abnormalTests: number };
    tests?: Array<{ resultValue: string }>;
    [key: string]: any;
  };
}

export interface AIAnalysis {
  riskLevel: string;
  summary: string;
  actionItems: string[];
  doctorQuestions: string[];
}

export interface MemberHealthData {
  prescriptions: Prescription[];
  labReports: LabReport[];
  doctorReports: DoctorReport[];
  analysis: AIAnalysis | null;
  healthTrends: HealthTrends;
}

export interface NewVitalForm {
  type: string;
  value: string;
  systolic: string;
  diastolic: string;
  date: string;
}
