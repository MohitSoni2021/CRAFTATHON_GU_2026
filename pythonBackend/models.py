from typing import Optional, List
from pydantic import BaseModel, Field


class UserSchema(BaseModel):
    user_id: Optional[str] = Field(None, alias="_id")
    name: str
    email: str
    role: str
    timezone: Optional[str]
    adherenceScore: Optional[float]
    createdAt: Optional[str]


class MedicationSchema(BaseModel):
    medication_id: Optional[str] = Field(None, alias="_id")
    userId: str
    name: str
    dosage: str
    unit: str
    frequency: Optional[str]
    scheduleTimes: Optional[List[str]]
    startDate: Optional[str]
    endDate: Optional[str]
    isActive: Optional[bool]


class DoseLogSchema(BaseModel):
    dose_log_id: Optional[str] = Field(None, alias="_id")
    userId: str
    medicationId: str
    scheduledAt: Optional[str]
    takenAt: Optional[str]
    status: Optional[str]
    delayMinutes: Optional[float]


class DatasetRowSchema(BaseModel):
    user_id: str
    user_name: str
    email: str
    timezone: str
    medication_id: str
    medication_name: str
    dosage: Optional[str]
    frequency: Optional[str]
    total_scheduled_doses: int
    doses_taken: int
    doses_missed: int
    adherence_percentage: float
    avg_delay_minutes: Optional[float]
    date: str


class PerUserSummarySchema(BaseModel):
    user_id: str
    user_name: str
    email: str
    timezone: Optional[str]
    total_scheduled_doses: int
    doses_taken: int
    doses_missed: int
    adherence_percentage: float


class OverallSummarySchema(BaseModel):
    total_users: int
    total_scheduled_doses: int
    doses_taken: int
    doses_missed: int
    adherence_percentage: float
