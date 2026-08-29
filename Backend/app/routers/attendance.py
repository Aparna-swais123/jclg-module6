from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.attendance import (
    GroupAttendanceListResponse,
    SectionAttendanceListResponse,
    StudentAttendanceListResponse,
)


router = APIRouter(
    prefix="/api/v1/attendance",
    tags=["Attendance Monitoring"]
)


@router.get("/groups",response_model=GroupAttendanceListResponse,)
def get_group_attendance(
    campus_id: int = Query(...),
    academic_year_id: int = Query(...),
    target_date: date | None = Query(None),
    db: Session = Depends(get_db),
):
    if target_date is None:
        target_date = date.today()

    group_query = text("""
        WITH daily_attendance AS (
            SELECT
                a.student_id,

                BOOL_OR(
                    LOWER(a.status) = 'present'
                ) AS has_present,

                BOOL_OR(
                    LOWER(a.status) = 'absent'
                ) AS has_absent

            FROM jclg_attendance a

            WHERE a.academic_year_id = :academic_year_id
              AND a.attendance_date = :target_date

            GROUP BY a.student_id
        )

        SELECT
            g.group_id,
            g.group_name,

            COUNT(st.student_id) AS total_students,

            COUNT(st.student_id)
                FILTER (
                    WHERE da.has_present = TRUE
                ) AS present_today,

            COUNT(st.student_id)
                FILTER (
                    WHERE COALESCE(da.has_present, FALSE) = FALSE
                      AND da.has_absent = TRUE
                ) AS absent_today,

            COUNT(st.student_id)
                FILTER (
                    WHERE da.student_id IS NULL
                ) AS not_marked_today

        FROM jclg_group g

        INNER JOIN jclg_student st
            ON st.group_id = g.group_id
           AND st.campus_id = :campus_id
           AND st.academic_year_id = :academic_year_id
           AND st.status = TRUE

        LEFT JOIN daily_attendance da
            ON da.student_id = st.student_id

        WHERE g.academic_year_id = :academic_year_id
          AND g.status = TRUE

        GROUP BY
            g.group_id,
            g.group_name

        ORDER BY
            g.group_name;
    """)

    result = db.execute(
        group_query,
        {
            "campus_id": campus_id,
            "academic_year_id": academic_year_id,
            "target_date": target_date,
        },
    ).mappings().all()

    groups = []

    for row in result:
        total_students = int(row["total_students"] or 0)
        present_today = int(row["present_today"] or 0)
        absent_today = int(row["absent_today"] or 0)
        not_marked_today = int(row["not_marked_today"] or 0)

        attendance_percentage = (
            round(
                (present_today / total_students) * 100,
                2,
            )
            if total_students > 0
            else 0.0
        )

        groups.append(
            {
                "group_id": row["group_id"],
                "group_name": row["group_name"],
                "total_students": total_students,
                "present_today": present_today,
                "absent_today": absent_today,
                "not_marked_today": not_marked_today,
                "attendance_percentage": attendance_percentage,
            }
        )

    return {
        "date": target_date.isoformat(),
        "academic_year_id": academic_year_id,
        "campus_id": campus_id,
        "groups": groups,
    }




@router.get("/groups/{group_id}/sections", response_model=SectionAttendanceListResponse,)
def get_group_sections(
    group_id: int,
    campus_id: int = Query(...),
    academic_year_id: int = Query(...),
    target_date: date | None = Query(None),
    db: Session = Depends(get_db),
):
    if target_date is None:
        target_date = date.today()

    section_query = text("""
        WITH daily_attendance AS (
            SELECT
                a.student_id,

                BOOL_OR(
                    LOWER(a.status) = 'present'
                ) AS has_present,

                BOOL_OR(
                    LOWER(a.status) = 'absent'
                ) AS has_absent

            FROM jclg_attendance a

            WHERE a.academic_year_id = :academic_year_id
              AND a.attendance_date = :target_date

            GROUP BY a.student_id
        )

        SELECT
            s.section_id,
            s.section_name,

            COUNT(st.student_id) AS total_students,

            COUNT(st.student_id)
                FILTER (
                    WHERE da.has_present = TRUE
                ) AS present_today,

            COUNT(st.student_id)
                FILTER (
                    WHERE COALESCE(da.has_present, FALSE) = FALSE
                      AND da.has_absent = TRUE
                ) AS absent_today,

            COUNT(st.student_id)
                FILTER (
                    WHERE da.student_id IS NULL
                ) AS not_marked_today

        FROM jclg_section s

        INNER JOIN jclg_student st
            ON st.section_id = s.section_id
           AND st.group_id = :group_id
           AND st.campus_id = :campus_id
           AND st.academic_year_id = :academic_year_id
           AND st.status = TRUE

        LEFT JOIN daily_attendance da
            ON da.student_id = st.student_id

        WHERE s.group_id = :group_id
          AND s.status = TRUE

        GROUP BY
            s.section_id,
            s.section_name

        ORDER BY
            s.section_name;
    """)

    result = db.execute(
        section_query,
        {
            "group_id": group_id,
            "campus_id": campus_id,
            "academic_year_id": academic_year_id,
            "target_date": target_date,
        },
    ).mappings().all()

    sections = []

    for row in result:
        total_students = int(row["total_students"] or 0)
        present_today = int(row["present_today"] or 0)
        absent_today = int(row["absent_today"] or 0)
        not_marked_today = int(row["not_marked_today"] or 0)

        attendance_percentage = (
            round(
                (present_today / total_students) * 100,
                2,
            )
            if total_students > 0
            else 0.0
        )

        sections.append(
            {
                "section_id": row["section_id"],
                "section_name": row["section_name"],
                "total_students": total_students,
                "present_today": present_today,
                "absent_today": absent_today,
                "not_marked_today": not_marked_today,
                "attendance_percentage": attendance_percentage,
            }
        )

    return {
        "date": target_date.isoformat(),
        "academic_year_id": academic_year_id,
        "campus_id": campus_id,
        "group_id": group_id,
        "sections": sections,
    }



@router.get("/sections/{section_id}/students",
response_model=StudentAttendanceListResponse,)
def get_section_students(
    section_id: int,
    campus_id: int = Query(...),
    academic_year_id: int = Query(...),
    target_date: date | None = Query(None),
    db: Session = Depends(get_db),
):
    if target_date is None:
        target_date = date.today()

    student_query = text("""
        SELECT
            st.student_id,
            st.student_code,
            st.roll_number,
            st.first_name,
            st.last_name,

            COALESCE(
                UPPER(a.status),
                'NOT_MARKED'
            ) AS attendance_status,
CASE
    WHEN UPPER(COALESCE(a.status, '')) = 'ABSENT'
    THEN l.leave_type
    ELSE NULL
END AS leave_type,

CASE
    WHEN UPPER(COALESCE(a.status, '')) = 'ABSENT'
    THEN l.status
    ELSE NULL
END AS leave_status,

CASE
    WHEN UPPER(COALESCE(a.status, '')) = 'ABSENT'
    THEN l.reason
    ELSE NULL
END AS leave_reason

        FROM jclg_student st

        LEFT JOIN jclg_attendance a
            ON a.student_id = st.student_id
           AND a.section_id = st.section_id
           AND a.academic_year_id = :academic_year_id
           AND a.attendance_date = :target_date

        LEFT JOIN LATERAL (
            SELECT
                leave_type,
                status,
                reason
            FROM jclg_leave
            WHERE student_id = st.student_id
              AND from_date <= :target_date
              AND to_date >= :target_date
            ORDER BY leave_id DESC
            LIMIT 1
        ) l ON TRUE

        WHERE st.section_id = :section_id
          AND st.campus_id = :campus_id
          AND st.academic_year_id = :academic_year_id
          AND st.status = TRUE

        ORDER BY
            st.roll_number;
    """)

    result = db.execute(
        student_query,
        {
            "section_id": section_id,
            "campus_id": campus_id,
            "academic_year_id": academic_year_id,
            "target_date": target_date,
        },
    ).mappings().all()

    students = []

    for row in result:
        students.append(
            {
                "student_id": row["student_id"],
                "student_code": row["student_code"],
                "roll_number": row["roll_number"],
                "student_name": (
                    f"{row['first_name']} "
                    f"{row['last_name'] or ''}"
                ).strip(),
                "attendance_status": row["attendance_status"],
                "leave_type": row["leave_type"],
                "leave_status": row["leave_status"],
                "leave_reason": row["leave_reason"],
            }
        )

    return {
        "date": target_date.isoformat(),
        "academic_year_id": academic_year_id,
        "campus_id": campus_id,
        "section_id": section_id,
        "students": students,
    }