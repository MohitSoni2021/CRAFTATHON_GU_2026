export const roleBadge = (type: string) => {
    const map: Record<string, string> = {
        admin: 'bg-purple-100 text-purple-700',
        doctor: 'bg-emerald-100 text-emerald-700',
        user: 'bg-primary/10 text-primary',
    };
    return map[type] || 'bg-gray-100 text-gray-600';
};

export const planBadge = (plan: string) => 
    plan === 'premium'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-gray-100 text-gray-500';
