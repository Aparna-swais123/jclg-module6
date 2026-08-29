from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.connection import get_db



router = APIRouter()




@router.get("/faculty-monitoring")
def get_faculty_monitoring(
    campus_id: int = Query(...),
    academic_year_id: int = Query(...),
    target_date: date | None = Query(None),
    db: Session = Depends(get_db),
):
    if target_date is None:
        target_date = date.today()

    day_of_week = target_date.isoweekday()

    faculty_query = text("""
        SELECT
            f.faculty_id,

            CONCAT_WS(
                ' ',
                f.first_name,
                f.last_name
            ) AS faculty_name,

            f.department,

            COUNT(t.timetable_id) AS total_periods,

            COUNT(t.timetable_id)
            FILTER (
                WHERE EXISTS (
                    SELECT 1
                    FROM jclg_attendance a
                    WHERE a.section_id = t.section_id
                      AND a.period_no = t.period_no
                      AND a.attendance_date = :target_date
                      AND a.academic_year_id = :academic_year_id
                )
            ) AS completed_periods,

            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM jclg_faculty_leave fl
                    WHERE fl.faculty_id = f.faculty_id
                      AND fl.campus_id = :campus_id
                      AND fl.academic_year_id = :academic_year_id
                      AND fl.from_date <= :target_date
                      AND fl.to_date >= :target_date
                      AND UPPER(fl.status) IN ('APPROVED', 'PENDING')
                )
                THEN 'ON_LEAVE'

                WHEN EXISTS (
                    SELECT 1
                    FROM jclg_faculty_attendance fa
                    WHERE fa.faculty_id = f.faculty_id
                      AND fa.campus_id = :campus_id
                      AND fa.academic_year_id = :academic_year_id
                      AND fa.attendance_date = :target_date
                      AND UPPER(fa.status) = 'PRESENT'
                )
                THEN 'PRESENT'

                WHEN EXISTS (
                    SELECT 1
                    FROM jclg_faculty_attendance fa
                    WHERE fa.faculty_id = f.faculty_id
                      AND fa.campus_id = :campus_id
                      AND fa.academic_year_id = :academic_year_id
                      AND fa.attendance_date = :target_date
                      AND UPPER(fa.status) = 'ABSENT'
                )
                THEN 'ABSENT'

                ELSE 'NOT_MARKED'
            END AS attendance_status

        FROM jclg_faculty f

        LEFT JOIN jclg_timetable t
            ON t.faculty_id = f.faculty_id
           AND t.campus_id = :campus_id
           AND t.academic_year_id = :academic_year_id
           AND t.day_of_week = :day_of_week
           AND t.status = TRUE

        WHERE f.campus_id = :campus_id
          AND f.status = TRUE

        GROUP BY
            f.faculty_id,
            f.first_name,
            f.last_name,
            f.department

        ORDER BY
            faculty_name
    """)

    result = db.execute(
        faculty_query,
        {
            "campus_id": campus_id,
            "academic_year_id": academic_year_id,
            "target_date": target_date,
            "day_of_week": day_of_week,
        },
    ).mappings().all()

    faculty = []

    for row in result:
        total_periods = int(row["total_periods"] or 0)
        completed_periods = int(row["completed_periods"] or 0)

        progress_percentage = (
            round((completed_periods / total_periods) * 100)
            if total_periods > 0
            else 0
        )

        faculty.append(
            {
                "faculty_id": row["faculty_id"],
                "faculty_name": row["faculty_name"],
                "department": row["department"],
                "total_periods": total_periods,
                "completed_periods": completed_periods,
                "progress_percentage": progress_percentage,
                "attendance_status": row["attendance_status"],
            }
        )

    return {
        "date": target_date.isoformat(),
        "academic_year_id": academic_year_id,
        "campus_id": campus_id,
        "faculty": faculty,
    }