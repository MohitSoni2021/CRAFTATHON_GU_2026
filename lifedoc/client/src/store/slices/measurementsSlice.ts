import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
export interface MeasurementReading {
    _id?: string;
    type: 'glucose' | 'bloodPressure' | 'weight' | 'heartRate' | 'spo2' | 'other';
    timestamp?: string;
    value: number | { systolic: number; diastolic: number };
    unit?: string;
    notes?: string;
}

export interface Measurement {
    _id: string;
    userId: string;
    date: string;
    readings: MeasurementReading[];
    createdAt: string;
    updatedAt: string;
}

interface MeasurementsState {
    measurements: Measurement[];
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: MeasurementsState = {
    measurements: [],
    loading: false,
    error: null,
};

// Helper to get auth header
const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
    return { Authorization: `Bearer ${token}` };
};

// Async thunks
export const fetchMeasurements = createAsyncThunk(
    'measurements/fetchAll',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/measurements/user/${userId}`, {
                headers: getAuthHeader(),
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch measurements');
        }
    }
);

export const createMeasurement = createAsyncThunk(
    'measurements/create',
    async (data: { userId: string; date: string; readings: MeasurementReading[] }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/measurements`, data, {
                headers: getAuthHeader(),
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create measurement');
        }
    }
);

// Slice
const measurementsSlice = createSlice({
    name: 'measurements',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch
        builder
            .addCase(fetchMeasurements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMeasurements.fulfilled, (state, action) => {
                state.loading = false;
                state.measurements = action.payload;
            })
            .addCase(fetchMeasurements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create
        builder
            .addCase(createMeasurement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createMeasurement.fulfilled, (state, action) => {
                state.loading = false;
                // Optimization: Add properly to state or re-fetch. 
                // For simplicity, we can unshift (if date is new) or just push. 
                // Since backend handles merging by date, handling this correctly in reducer is tricky without replacing the whole day's entry.
                // For now, let's find if we have an entry for this date and update it, or add new.
                const index = state.measurements.findIndex(m => m.date === action.payload.date);
                if (index !== -1) {
                    state.measurements[index] = action.payload;
                } else {
                    state.measurements.unshift(action.payload);
                }
            })
            .addCase(createMeasurement.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearErrors } = measurementsSlice.actions;
export default measurementsSlice.reducer;
