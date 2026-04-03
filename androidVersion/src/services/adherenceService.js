import api from './api';

export const getAdherenceScoreService = async () => {
    const response = await api.get('/adherence/score');
    return response.data;
};

export const getRiskLevelService = async () => {
    const response = await api.get('/adherence/risk');
    return response.data;
};

export const getDailyAdherenceService = async () => {
    const response = await api.get('/adherence/daily');
    return response.data;
};
