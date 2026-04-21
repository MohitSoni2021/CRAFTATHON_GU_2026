export interface FamilyMember {
  _id: string;
  name: string;
  relationship: string;
  status: string;
  age?: number;
  accessLevel?: string;
  userId?: {
    _id: string;
    age?: number;
  };
  healthData?: {
    bp?: Array<{ value: { systolic: number; diastolic: number } }>;
    weight?: Array<{ value: number }>;
    glucose?: Array<{ value: number }>;
  };
}

export interface FamilyRequest {
  familyId: string;
  adminName: string;
  adminEmail: string;
  relationshipToAdmin: string;
}

export interface NewMemberForm {
  name: string;
  relation: string;
  age: string;
  gender: string;
  chronicConditions: string;
  accessLevel: string;
}
