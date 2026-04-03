from datetime import datetime, timezone, timedelta, time
from zoneinfo import ZoneInfo
from typing import Optional, Tuple
import pandas as pd

try:
    from .db import db
    from .models import DatasetRowSchema, PerUserSummarySchema, OverallSummarySchema
except ImportError:
    from db import db
    from models import DatasetRowSchema, PerUserSummarySchema, OverallSummarySchema


def _parse_date_filter(date_str: Optional[str]) -> Optional[datetime]:
    if date_str is None:
        return None
    return datetime.fromisoformat(date_str)


def _query_date_range(start: Optional[str], end: Optional[str]) -> dict:
    q = {}
    start_date = _parse_date_filter(start)
    end_date = _parse_date_filter(end)

    if start_date is not None:
        start_date = datetime.combine(start_date.date(), time.min).replace(tzinfo=timezone.utc)
        q["$gte"] = start_date

    if end_date is not None:
        end_date = datetime.combine(end_date.date(), time.max).replace(tzinfo=timezone.utc)
        q["$lte"] = end_date

    return q


def _to_local_date_for_display(universal: datetime, timezone_str: Optional[str]) -> str:
    if universal is None:
        return ""
    try:
        tz = ZoneInfo(timezone_str) if timezone_str else ZoneInfo("UTC")
    except Exception:
        tz = ZoneInfo("UTC")
    return universal.astimezone(tz).date().isoformat()


async def generate_dataset(start: Optional[str] = None, end: Optional[str] = None) -> Tuple[list, list, dict]:
    """Run an aggregated adherence dataset build.

    Returns:
        dataset_rows (List[dict]): One per (user, medication, date).
        per_user_summary (List[dict]): Aggregated per user.
        overall_summary (dict): Dataset-level summary.
    """

    date_query = _query_date_range(start, end)
    match_stage = {}
    if date_query:
        match_stage = {
            "scheduledAt": date_query
        }

    pipeline = [
        {"$match": match_stage} if match_stage else {"$match": {}},
        {
            "$lookup": {
                "from": "User",
                "localField": "userId",
                "foreignField": "_id",
                "as": "user",
            }
        },
        {"$unwind": "$user"},
        {
            "$match": {
                "user.role": "PATIENT"
            }
        },
        {
            "$lookup": {
                "from": "Medication",
                "localField": "medicationId",
                "foreignField": "_id",
                "as": "medication",
            }
        },
        {"$unwind": "$medication"},
        {
            "$addFields": {
                "effective_date": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$scheduledAt",
                        "timezone": {"$ifNull": ["$user.timezone", "UTC"]},
                    }
                }
            }
        },
        {
            "$group": {
                "_id": {
                    "user_id": "$user._id",
                    "user_name": "$user.name",
                    "email": "$user.email",
                    "timezone": {"$ifNull": ["$user.timezone", "UTC"]},
                    "medication_id": "$medication._id",
                    "medication_name": "$medication.name",
                    "dosage": "$medication.dosage",
                    "frequency": "$medication.frequency",
                    "date": "$effective_date",
                },
                "total_scheduled_doses": {"$sum": 1},
                "doses_taken": {
                    "$sum": {
                        "$cond": [{"$eq": ["$status", "TAKEN"]}, 1, 0]
                    }
                },
                "doses_missed": {
                    "$sum": {
                        "$cond": [{"$eq": ["$status", "MISSED"]}, 1, 0]
                    }
                },
                "delay_sum_for_taken": {
                    "$sum": {
                        "$cond": [{"$eq": ["$status", "TAKEN"]}, {"$ifNull": ["$delayMinutes", 0]}, 0]
                    }
                },
                "delay_count_for_taken": {
                    "$sum": {
                        "$cond": [{"$eq": ["$status", "TAKEN"]}, 1, 0]
                    }
                },
            }
        },
        {
            "$project": {
                "user_id": {"$toString": "$_id.user_id"},
                "user_name": "$_id.user_name",
                "email": "$_id.email",
                "timezone": "$_id.timezone",
                "medication_id": {"$toString": "$_id.medication_id"},
                "medication_name": "$_id.medication_name",
                "dosage": "$_id.dosage",
                "frequency": "$_id.frequency",
                "date": "$_id.date",
                "total_scheduled_doses": 1,
                "doses_taken": 1,
                "doses_missed": 1,
                "adherence_percentage": {
                    "$cond": [
                        {"$eq": ["$total_scheduled_doses", 0]},
                        0,
                        {"$multiply": [{"$divide": ["$doses_taken", "$total_scheduled_doses"]}, 100]},
                    ]
                },
                "avg_delay_minutes": {
                    "$cond": [
                        {"$eq": ["$delay_count_for_taken", 0]},
                        None,
                        {"$divide": ["$delay_sum_for_taken", "$delay_count_for_taken"]},
                    ]
                },
            }
        },
        {
            "$sort": {"user_id": 1, "medication_id": 1, "date": 1}
        },
    ]

    raw_rows = await db.DoseLog.aggregate(pipeline).to_list(length=None)

    # Ensure typed conversion and timezone safety by double-checking date logic.
    dataset_rows = []
    for row in raw_rows:
        row_obj = DatasetRowSchema(
            user_id=row.get("user_id"),
            user_name=row.get("user_name"),
            email=row.get("email"),
            timezone=row.get("timezone", "UTC"),
            medication_id=row.get("medication_id"),
            medication_name=row.get("medication_name"),
            dosage=row.get("dosage"),
            frequency=row.get("frequency"),
            total_scheduled_doses=int(row.get("total_scheduled_doses", 0)),
            doses_taken=int(row.get("doses_taken", 0)),
            doses_missed=int(row.get("doses_missed", 0)),
            adherence_percentage=float(round(row.get("adherence_percentage", 0.0), 2)),
            avg_delay_minutes=(None if row.get("avg_delay_minutes") is None else float(round(row.get("avg_delay_minutes"), 2))),
            date=row.get("date"),
        )
        dataset_rows.append(row_obj.dict())

    if len(dataset_rows) == 0:
        per_user_summary = []
        overall_summary = OverallSummarySchema(
            total_users=0,
            total_scheduled_doses=0,
            doses_taken=0,
            doses_missed=0,
            adherence_percentage=0.0,
        ).dict()
        return dataset_rows, per_user_summary, overall_summary

    df = pd.DataFrame(dataset_rows)

    user_grouped = df.groupby(["user_id", "user_name", "email", "timezone"], as_index=False).agg(
        total_scheduled_doses=("total_scheduled_doses", "sum"),
        doses_taken=("doses_taken", "sum"),
        doses_missed=("doses_missed", "sum"),
    )

    user_grouped["adherence_percentage"] = (
        user_grouped.apply(
            lambda x: round((x.doses_taken / x.total_scheduled_doses * 100) if x.total_scheduled_doses > 0 else 0.0, 2),
            axis=1,
        )
    )

    per_user_summary = []
    for _, row in user_grouped.iterrows():
        per_user_summary.append(PerUserSummarySchema(
            user_id=row["user_id"],
            user_name=row["user_name"],
            email=row["email"],
            timezone=row["timezone"],
            total_scheduled_doses=int(row["total_scheduled_doses"]),
            doses_taken=int(row["doses_taken"]),
            doses_missed=int(row["doses_missed"]),
            adherence_percentage=float(row["adherence_percentage"]),
        ).dict())

    tot_scheduled = int(df["total_scheduled_doses"].sum())
    total_taken = int(df["doses_taken"].sum())
    total_missed = int(df["doses_missed"].sum())

    overall_adherence_pct = round((total_taken / tot_scheduled * 100) if tot_scheduled > 0 else 0.0, 2)
    overall_summary = OverallSummarySchema(
        total_users=int(user_grouped.shape[0]),
        total_scheduled_doses=tot_scheduled,
        doses_taken=total_taken,
        doses_missed=total_missed,
        adherence_percentage=overall_adherence_pct,
    ).dict()

    # save to CSV for analytics/ML pipeline output
    df.to_csv("./medtrack_dataset.csv", index=False)

    return dataset_rows, per_user_summary, overall_summary
