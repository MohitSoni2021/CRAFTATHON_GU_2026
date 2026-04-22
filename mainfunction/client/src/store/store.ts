import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import measurementsReducer from './slices/measurementsSlice';
import diaryReducer from './slices/diarySlice';
import labReportsReducer from './slices/labReportsSlice';
import doctorReportsReducer from './slices/doctorReportsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    measurements: measurementsReducer,
    diary: diaryReducer,
    labReports: labReportsReducer,
    doctorReports: doctorReportsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
