export interface User {
    _id: string;
    name: string;
    email: string;
    type: string;
    isVerified: boolean;
    createdAt: string;
    subscription?: { plan: string; status: string };
    usage?: { aiConsultations: number };
    profile?: { gender?: string };
}

export interface Stats {
    users: number;
    doctors: number;
    admins: number;
    articles: number;
    appointments: number;
    premiumUsers: number;
    newUsersThisMonth: number;
    totalAll: number;
}
