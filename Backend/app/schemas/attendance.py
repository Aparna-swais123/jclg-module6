from pydantic import BaseModel
from typing import Optional


class GroupAttendanceResponse(BaseModel):
    group_id: int
    group_name: str
    total_students: int
    present_today: int
    absent_today: int
    not_marked_today: int
    attendance_percentage: float


class SectionAttendanceResponse(BaseModel):
    section_id: int
    section_name: str
    total_students: int
    present_today: int
    absent_today: int
    not_marked_today: int
    attendance_percentage: float


class StudentAttendanceResponse(BaseModel):
    student_id: int
    student_code: str
    roll_number: str
    student_name: str
    attendance_status: str
    leave_type: Optional[str] = None
    leave_status: Optional[str] = None
    leave_reason: Optional[str] = None


class GroupAttendanceListResponse(BaseModel):
    date: str
    academic_year_id: int
    campus_id: int
    groups: list[GroupAttendanceResponse]


class SectionAttendanceListResponse(BaseModel):
    date: str
    academic_year_id: int
    campus_id: int
    group_id: int
    sections: list[SectionAttendanceResponse]


class StudentAttendanceListResponse(BaseModel):
    date: str
    academic_year_id: int
    campus_id: int
    section_id: int
    students: list[StudentAttendanceResponse]