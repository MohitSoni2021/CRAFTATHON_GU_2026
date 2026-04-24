export interface SOSContact {
  name: string;
  phone: string;
  relationship?: string;
  email?: string;
}

export interface UserProfile {
  gender?: string;
  height?: number;
  weight?: number;
  bloodGroup?: string;
  chronicConditions?: string[];
  photoUrl?: string;
  storyDesc?: string;
}

export interface UserSubscription {
  plan: string;
  status: string;
}

export interface UserUsage {
  aiConsultations: number;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  type: string;
  age?: number;
  profileImage?: string;
  profile?: UserProfile;
  sosContacts?: SOSContact[];
  subscription?: UserSubscription;
  usage?: UserUsage;
}

export interface SavedPost {
  savedPostId: string;
  title: string;
  url: string;
  imageUrl?: string;
  savedAt: string;
}

export interface ProfileFormData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  bloodGroup: string;
  chronicConditions: string;
  sosName: string;
  sosPhone: string;
  sosRelation: string;
  sosEmail: string;
}
