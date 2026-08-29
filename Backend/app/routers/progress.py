from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.progress import ProgressOverviewResponse


router = APIRouter(
    prefix="/api/v1/progress",
    tags=["Progress Monitoring"]
)


@router.get(
    "/overview",
    response_model=ProgressOverviewResponse
)
def get_progress_overview(
    campus_id: int = Query(...),
    academic_year_id: int = Query(...),
    target_date: date | None = Query(None),
    principal_user_id: int | None = Query(None),
    attendance_threshold: float = Query(
        75.0,
        ge=0,
        le=100
    ),
    db: Session = Depends(get_db),
):

    if target_date is None:
        target_date = date.today()

    # ---------------------------------------------------------
    # 1. STUDENT OVERVIEW
    # ---------------------------------------------------------

    student_query = text("""
        WITH active_students AS (
            SELECT
                student_id
            FROM jclg_student
            WHERE campus_id = :campus_id
              AND academic_year_id = :academic_year_id
              AND status = TRUE
        ),

        daily_attendance AS (
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

            COUNT(s.student_id) AS total_students,

            COUNT(s.student_id)
                FILTER (
                    WHERE da.has_present = TRUE
                ) AS present_today,

            COUNT(s.student_id)
                FILTER (
                    WHERE COALESCE(da.has_present, FALSE) = FALSE
                      AND da.has_absent = TRUE
                ) AS absent_today,

            COUNT(s.student_id)
                FILTER (
                    WHERE da.student_id IS NULL
                ) AS not_marked_today

        FROM active_students s

        LEFT JOIN daily_attendance da
            ON da.student_id = s.student_id;
    """)

    student_result = db.execute(
        student_query,
        {
            "campus_id": campus_id,
            "academic_year_id": academic_year_id,
            "target_date": target_date,
        }
    ).mappings().one()

    total_students = int(student_result["total_students"])
    present_today = int(student_result["present_today"])
    absent_today = int(student_result["absent_today"])
    not_marked_today = int(student_result["not_marked_today"])

    marked_students = present_today + absent_today

    if marked_students > 0:
        attendance_percentage = round(
            (present_today / marked_students) * 100,
            2
        )
    else:
        attendance_percentage = 0.0

    # ---------------------------------------------------------
    # 2. FACULTY OVERVIEW
    # ---------------------------------------------------------

    faculty_total_query = text("""
        SELECT COUNT(*) AS total_faculty
        FROM jclg_faculty
        WHERE campus_id = :campus_id;
    """)

    faculty_total = db.execute(
        faculty_total_query,
        {
            "campus_id": campus_id,
        }
    ).scalar() or 0

    total_faculty = int(faculty_total)

    faculty_attendance_query = text("""
        SELECT
            COUNT(*) FILTER (
                WHERE fa.status = 'PRESENT'
                  AND fl.leave_id IS NULL
            ) AS present,

            COUNT(*) FILTER (
                WHERE fa.status = 'ABSENT'
                  AND fl.leave_id IS NULL
            ) AS absent,

            COUNT(*) FILTER (
                WHERE fl.leave_id IS NOT NULL
            ) AS on_leave

        FROM jclg_faculty f

        LEFT JOIN jclg_faculty_attendance fa
            ON fa.faculty_id = f.faculty_id
           AND fa.attendance_date = :target_date
           AND fa.campus_id = :campus_id
           AND fa.academic_year_id = :academic_year_id

        LEFT JOIN jclg_faculty_leave fl
            ON fl.faculty_id = f.faculty_id
           AND fl.campus_id = :campus_id
           AND fl.academic_year_id = :academic_year_id
           AND LOWER(fl.status) = 'approved'
           AND :target_date BETWEEN fl.from_date AND fl.to_date

        WHERE f.campus_id = :campus_id;
    """)

    faculty_attendance_result = db.execute(
        faculty_attendance_query,
        {
            "campus_id": campus_id,
            "academic_year_id": academic_year_id,
            "target_date": target_date,
        }
    ).mappings().one()

    faculty_present = int(
        faculty_attendance_result["present"] or 0
    )

    faculty_absent = int(
        faculty_attendance_result["absent"] or 0
    )

    faculty_on_leave = int(
        faculty_attendance_result["on_leave"] or 0
    )

    faculty_marked = (
        faculty_present
        + faculty_absent
        + faculty_on_leave
    )

    faculty_attendance_percentage = (
        round(
            faculty_present * 100.0 / faculty_marked,
            2
        )
        if faculty_marked > 0
        else None
    )

    faculty_attendance_tracking_available = (
        faculty_marked > 0
    )

    if not faculty_attendance_tracking_available:
        faculty_present = None
        faculty_absent = None
    # ---------------------------------------------------------
    # 3. EXAMS TODAY
    # ---------------------------------------------------------

    exams_today_query = text("""
        SELECT COUNT(DISTINCT es.exam_id) AS exams_today

        FROM jclg_exam_subject es

        INNER JOIN jclg_exam e
            ON e.exam_id = es.exam_id

        WHERE e.campus_id = :campus_id
          AND e.academic_year_id = :academic_year_id
          AND e.status = TRUE
          AND es.status = TRUE
          AND es.exam_date = :target_date;
    """)

    exams_today_result = db.execute(
        exams_today_query,
        {
            "campus_id": campus_id,
            "academic_year_id": academic_year_id,
            "target_date": target_date,
        }
    ).mappings().one()

    exams_today = int(
        exams_today_result["exams_today"]
    )

    # ---------------------------------------------------------
    # 4. RESULTS PENDING
    # ---------------------------------------------------------

    results_pending_query = text("""
        WITH expected_results AS (

            SELECT DISTINCT
                e.exam_id,
                s.student_id

            FROM jclg_exam e

            INNER JOIN jclg_exam_subject es
                ON es.exam_id = e.exam_id

            INNER JOIN jclg_student s
                ON s.section_id = es.section_id
               AND s.academic_year_id = e.academic_year_id
               AND s.status = TRUE

            WHERE e.campus_id = :campus_id
              AND e.academic_year_id = :academic_year_id
              AND e.status = TRUE
              AND es.status = TRUE

              AND e.end_date < :target_date
        )

        SELECT COUNT(*) AS results_pending

        FROM expected_results er

        LEFT JOIN jclg_result r
            ON r.exam_id = er.exam_id
           AND r.student_id = er.student_id

        WHERE r.result_id IS NULL;
    """)

    results_pending_result = db.execute(
        results_pending_query,
        {
            "campus_id": campus_id,
            "academic_year_id": academic_year_id,
            "target_date": target_date,
        }
    ).mappings().one()

    results_pending = int(
        results_pending_result["results_pending"]
    )

    # ---------------------------------------------------------
    # 5. STUDENTS NEEDING ATTENTION
    #
    # Based on attendance below the configured threshold.
    # ---------------------------------------------------------

    students_attention_query = text("""
        SELECT COUNT(*) AS students_needing_attention

        FROM (

            SELECT
                s.student_id,

                (
                    100.0
                    *
                    SUM(
                        CASE
                            WHEN LOWER(a.status) = 'present'
                            THEN 1
                            ELSE 0
                        END
                    )
                    /
                    NULLIF(COUNT(a.attendance_id), 0)
                ) AS attendance_percentage

            FROM jclg_student s

            INNER JOIN jclg_attendance a
                ON a.student_id = s.student_id
               AND a.academic_year_id = s.academic_year_id

            WHERE s.campus_id = :campus_id
              AND s.academic_year_id = :academic_year_id
              AND s.status = TRUE

            GROUP BY s.student_id

        ) attendance_summary

        WHERE attendance_summary.attendance_percentage
              < :attendance_threshold;
    """)

    students_attention_result = db.execute(
        students_attention_query,
        {
            "campus_id": campus_id,
            "academic_year_id": academic_year_id,
            "attendance_threshold": attendance_threshold,
        }
    ).mappings().one()

    students_needing_attention = int(
        students_attention_result[
            "students_needing_attention"
        ]
    )

    # ---------------------------------------------------------
    # 6. ACTIVE ALERTS
    #
    # JCLG_NOTIFICATION is user-specific.
    # If principal_user_id is supplied, count unread alerts.
    # ---------------------------------------------------------

    if principal_user_id is not None:

        alerts_query = text("""
            SELECT COUNT(*) AS active_alerts

            FROM jclg_notification

            WHERE user_id = :principal_user_id
              AND is_read = FALSE;
        """)

        alerts_result = db.execute(
            alerts_query,
            {
                "principal_user_id": principal_user_id
            }
        ).mappings().one()

        active_alerts = int(
            alerts_result["active_alerts"]
        )

    else:
        active_alerts_query = text("""
                        SELECT COUNT(DISTINCT student_id)
                        FROM jclg_ai_insight
                        WHERE campus_id = :campus_id
                        AND student_id IS NOT NULL
                         AND LOWER(risk_level) = 'high'
                            """)

        active_alerts = db.execute(
                                active_alerts_query,
                                    {
                                           "campus_id": campus_id,
                                           },
                                ).scalar() or 0

    # ---------------------------------------------------------
    # FINAL RESPONSE
    # ---------------------------------------------------------

    return {
        "date": target_date.isoformat(),

        "academic_year_id": academic_year_id,

        "campus_id": campus_id,

        "students": {
            "total_students": total_students,
            "present_today": present_today,
            "absent_today": absent_today,
            "not_marked_today": not_marked_today,
            "attendance_percentage": attendance_percentage,
        },

        "faculty": {
            "total_faculty": total_faculty,
            "present": faculty_present,
            "absent": faculty_absent,
            "on_leave": faculty_on_leave,
            "attendance_percentage": faculty_attendance_percentage,
            "attendance_tracking_available": faculty_attendance_tracking_available,
        },

        "academic": {
            "exams_today": exams_today,
            "results_pending": results_pending,
            "students_needing_attention":
                students_needing_attention,
            "active_alerts": active_alerts,
        },
    }