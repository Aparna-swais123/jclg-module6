from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.connection import get_db


router = APIRouter(
    prefix="/faculty-syllabus",
    tags=["Faculty Syllabus Coverage"]
)


@router.get("")
def get_faculty_syllabus_coverage(
    campus_id: int = Query(...),
    academic_year_id: int = Query(...),
    db: Session = Depends(get_db),
):
    query = text("""
        SELECT
            cp.faculty_id,

            CONCAT(
                f.first_name,
                CASE
                    WHEN f.last_name IS NOT NULL
                    THEN ' ' || f.last_name
                    ELSE ''
                END
            ) AS faculty_name,

            s.subject_name,

            g.group_name,

            cp.total_units,
            cp.completed_units,

            CASE
                WHEN cp.total_units > 0
                THEN ROUND(
                    (cp.completed_units::numeric / cp.total_units) * 100,
                    2
                )
                ELSE 0
            END AS completed_percentage

        FROM jclg_course_planning cp

        JOIN jclg_faculty f
            ON f.faculty_id = cp.faculty_id

        JOIN jclg_subject s
            ON s.subject_id = cp.subject_id

        JOIN jclg_section sec
            ON sec.section_id = cp.section_id

        JOIN jclg_group g
            ON g.group_id = sec.group_id

        WHERE cp.campus_id = :campus_id
          AND cp.academic_year_id = :academic_year_id

          AND cp.status = 'ACTIVE'

          AND f.status = TRUE

        ORDER BY
            f.first_name,
            s.subject_name
    """)

    rows = (
        db.execute(
            query,
            {
                "campus_id": campus_id,
                "academic_year_id": academic_year_id,
            },
        )
        .mappings()
        .all()
    )

    faculty_data = []

    for row in rows:

        completed_percentage = float(
            row["completed_percentage"] or 0
        )

        remaining_percentage = round(
            100 - completed_percentage,
            2
        )

        # Determine schedule status
        if completed_percentage >= 75:
            schedule_status = "AHEAD_OF_SCHEDULE"
        elif completed_percentage >= 50:
            schedule_status = "ON_SCHEDULE"
        else:
            schedule_status = "BEHIND_SCHEDULE"

        faculty_data.append({
            "faculty_id": row["faculty_id"],
            "faculty_name": row["faculty_name"],
            "subject_name": row["subject_name"],
            "group_name": row["group_name"],

            "planned_percentage": 100,

            "completed_percentage": completed_percentage,

            "remaining_percentage": remaining_percentage,

            "schedule_status": schedule_status,
        })

    return {
        "academic_year_id": academic_year_id,
        "campus_id": campus_id,
        "faculty": faculty_data,
    }