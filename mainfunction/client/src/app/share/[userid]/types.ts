export interface SharedUser {
  name: string;
  age?: number;
  profileImage?: string;
  profile?: {
    bloodGroup?: string;
    gender?: string;
    height?: number;
    weight?: number;
    chronicConditions?: string[];
    storyDesc?: string;
  };
}

export interface SharedLabReport {
  testType: string;
  reportDate: string;
  notes?: string;
  fileUrl?: string;
}

export interface SharedDoctorReport {
  doctorName: string;
  visitDate: string;
  diagnosis?: string[];
}

export interface SharedMeasurementReading {
  type: string;
  value: any;
  unit?: string;
  notes?: string;
}

export interface SharedMeasurement {
  date: string;
  readings: SharedMeasurementReading[];
}

export interface SharedData {
  user: SharedUser;
  labReports: SharedLabReport[];
  doctorReports: SharedDoctorReport[];
  measurements: SharedMeasurement[];
}
