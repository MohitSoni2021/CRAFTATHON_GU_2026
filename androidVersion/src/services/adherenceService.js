import api from './api';

export const getAdherenceScoreService = async () => {
    const response = await api.get('/adherence/score');
    return response.data;
};

export const getAdherenceRiskService = async () => {
    const response = await api.get('/adherence/risk');
    return response.data;
};

export const getAdherenceWeeklyService = async () => {
    const response = await api.get('/adherence/weekly');
    return response.data;
};

export const getAdherencePatternsService = async () => {
    const response = await api.get('/adherence/patterns');
    return response.data;
};

export const getDailyAdherenceService = async () => {
    const response = await api.get('/adherence/daily');
    return response.data;
};
