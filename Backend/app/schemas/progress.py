from pydantic import BaseModel
from typing import Optional


class StudentOverview(BaseModel):
    total_students: int
    present_today: int
    absent_today: int
    not_marked_today: int
    attendance_percentage: float


class FacultyOverview(BaseModel):
    total_faculty: int
    present: Optional[int] = None
    absent: Optional[int] = None
    on_leave: int
    attendance_percentage: Optional[float] = None
    attendance_tracking_available: bool


class AcademicOverview(BaseModel):
    exams_today: int
    results_pending: int
    students_needing_attention: int
    active_alerts: int


class ProgressOverviewResponse(BaseModel):
    date: str
    academic_year_id: int
    campus_id: int

    students: StudentOverview
    faculty: FacultyOverview
    academic: AcademicOverview