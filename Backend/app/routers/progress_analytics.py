from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.connection import get_db


router = APIRouter(
    prefix="/progress-analytics",
    tags=["Progress Analytics"],
)


@router.get("")
def get_progress_analytics(
    campus_id: int = Query(...),
    academic_year_id: int = Query(...),
    db: Session = Depends(get_db),
):

    # ============================================================
    # 1. RECENT EXAMS
    # ============================================================

    exams_query = text("""
        SELECT
            exam_id,
            exam_name,
            exam_type,
            start_date
        FROM jclg_exam
        WHERE campus_id = :campus_id
          AND academic_year_id = :academic_year_id
          AND status = TRUE
        ORDER BY start_date ASC
    """)

    exams = (
        db.execute(
            exams_query,
            {
                "campus_id": campus_id,
                "academic_year_id": academic_year_id,
            },
        )
        .mappings()
        .all()
    )

    exam_ids = [e["exam_id"] for e in exams]

    # ============================================================
    # 2. STUDENT PROGRESS TRENDS
    # ============================================================

    trend_data = []

    if len(exam_ids) >= 2:

        trend_query = text("""
            WITH exam_order AS (
                SELECT
                    exam_id,
                    ROW_NUMBER() OVER (
                        ORDER BY start_date
                    ) AS exam_number
                FROM jclg_exam
                WHERE campus_id = :campus_id
                  AND academic_year_id = :academic_year_id
                  AND status = TRUE
            ),

            student_scores AS (
                SELECT
                    r.student_id,
                    eo.exam_number,
                    AVG(r.percentage) AS percentage
                FROM jclg_result r
                JOIN exam_order eo
                    ON eo.exam_id = r.exam_id
                GROUP BY
                    r.student_id,
                    eo.exam_number
            ),

            latest_scores AS (
                SELECT
                    student_id,
                    MAX(
                        percentage
                    ) FILTER (
                        WHERE exam_number = (
                            SELECT MAX(exam_number)
                            FROM exam_order
                        )
                    ) AS latest_percentage,

                    MAX(
                        percentage
                    ) FILTER (
                        WHERE exam_number = (
                            SELECT MAX(exam_number) - 1
                            FROM exam_order
                        )
                    ) AS previous_percentage

                FROM student_scores
                GROUP BY student_id
            ),

            classified AS (
                SELECT
                    student_id,
                    latest_percentage,
                    previous_percentage,

                    CASE
                        WHEN latest_percentage < 40
                            THEN 'NEEDS_SUPPORT'

                        WHEN latest_percentage -
                             previous_percentage >= 5
                            THEN 'IMPROVING'

                        WHEN latest_percentage -
                             previous_percentage <= -5
                            THEN 'DECLINING'

                        ELSE 'STABLE'
                    END AS trend

                FROM latest_scores
                WHERE latest_percentage IS NOT NULL
            )

            SELECT
                trend,
                COUNT(*) AS students
            FROM classified
            GROUP BY trend
        """)

        trend_rows = (
            db.execute(
                trend_query,
                {
                    "campus_id": campus_id,
                    "academic_year_id": academic_year_id,
                },
            )
            .mappings()
            .all()
        )

        total_students = sum(
            int(row["students"])
            for row in trend_rows
        )

        for row in trend_rows:

            count = int(row["students"])

            trend_data.append({
                "trend": row["trend"],
                "students": count,
                "percentage": (
                    round(
                        (count / total_students) * 100,
                        2,
                    )
                    if total_students > 0
                    else 0
                ),
            })

    # ============================================================
    # 3. ATTENDANCE VS PERFORMANCE
    # ============================================================

    attendance_performance_query = text("""
        WITH attendance AS (
            SELECT
                student_id,

                COUNT(*) FILTER (
                    WHERE UPPER(status) = 'PRESENT'
                ) AS present_count,

                COUNT(*) AS total_count

            FROM jclg_attendance
            WHERE academic_year_id = :academic_year_id
            GROUP BY student_id
        ),

        results AS (
            SELECT
                r.student_id,
                AVG(r.percentage) AS average_percentage
            FROM jclg_result r
            JOIN jclg_exam e
                ON e.exam_id = r.exam_id
            WHERE e.campus_id = :campus_id
              AND e.academic_year_id = :academic_year_id
              AND e.status = TRUE
            GROUP BY r.student_id
        )

        SELECT
            s.student_id,
            s.roll_number,
            s.first_name || ' ' || COALESCE(s.last_name, '') AS student_name,
            g.group_name,

            CASE
                WHEN a.total_count > 0
                THEN ROUND(
                    (
                        a.present_count::numeric
                        / a.total_count
                    ) * 100,
                    2
                )
                ELSE 0
            END AS attendance_percentage,

            ROUND(
                COALESCE(r.average_percentage, 0),
                2
            ) AS result_percentage

        FROM jclg_student s
        JOIN jclg_group g
            ON g.group_id = s.group_id
        LEFT JOIN attendance a
            ON a.student_id = s.student_id
        LEFT JOIN results r
            ON r.student_id = s.student_id
        WHERE s.campus_id = :campus_id
          AND s.academic_year_id = :academic_year_id
          AND s.status = TRUE
        ORDER BY s.student_id;
    """)

    ap_rows = (
        db.execute(
            attendance_performance_query,
            {
                "campus_id": campus_id,
                "academic_year_id": academic_year_id,
            },
        )
        .mappings()
        .all()
    )

    # Create attendance bands

    bands = {
        "HIGH": [],
        "MEDIUM": [],
        "LOW": [],
    }

    scatter = []

    for row in ap_rows:

        attendance = float(
            row["attendance_percentage"] or 0
        )

        result = float(
            row["result_percentage"] or 0
        )

        scatter.append({
            "student_id": row["student_id"],
            "student_name": row["student_name"],
            "roll_number": row["roll_number"],
            "group_name": row["group_name"],
            "attendance_percentage": attendance,
            "result_percentage": result,
        })

        if attendance >= 90:
            bands["HIGH"].append(
                (attendance, result)
            )

        elif attendance >= 75:
            bands["MEDIUM"].append(
                (attendance, result)
            )

        else:
            bands["LOW"].append(
                (attendance, result)
            )

    attendance_bands = []

    for band_name, students in bands.items():

        count = len(students)

        avg_attendance = (
            sum(x[0] for x in students) / count
            if count > 0
            else 0
        )

        avg_result = (
            sum(x[1] for x in students) / count
            if count > 0
            else 0
        )

        attendance_bands.append({
            "band": band_name,
            "students": count,
            "average_attendance": round(
                avg_attendance,
                2,
            ),
            "average_result": round(
                avg_result,
                2,
            ),
        })

    # ============================================================
    # 4. ACADEMIC HEALTH BY GROUP
    # ============================================================

    group_query = text("""
    WITH attendance AS (
        SELECT
            student_id,

            COUNT(*) FILTER (
                WHERE UPPER(status) = 'PRESENT'
            ) AS present_count,

            COUNT(*) AS total_count

        FROM jclg_attendance

        WHERE academic_year_id = :academic_year_id

        GROUP BY student_id
    ),

    exam_results AS (
        SELECT
            r.student_id,
            AVG(r.percentage) AS exam_average,

            COUNT(*) FILTER (
                WHERE UPPER(r.result_status) = 'FAIL'
            ) AS failed_count

        FROM jclg_result r

        JOIN jclg_exam e
            ON e.exam_id = r.exam_id

        WHERE e.academic_year_id = :academic_year_id
          AND e.campus_id = :campus_id
          AND e.status = TRUE

        GROUP BY r.student_id
    ),

    syllabus AS (
        SELECT
            sec.group_id,

            SUM(cp.total_units) AS total_units,
            SUM(cp.completed_units) AS completed_units,

            CASE
                WHEN SUM(cp.total_units) > 0
                THEN ROUND(
                    (
                        SUM(cp.completed_units)::numeric
                        / SUM(cp.total_units)
                    ) * 100,
                    2
                )
                ELSE 0
            END AS syllabus_percentage

        FROM jclg_course_planning cp

        JOIN jclg_section sec
            ON sec.section_id = cp.section_id

        WHERE cp.campus_id = :campus_id
          AND cp.academic_year_id = :academic_year_id
          AND UPPER(cp.status) = 'ACTIVE'

        GROUP BY sec.group_id
    )

    SELECT
        g.group_id,
        g.group_name,

        COUNT(DISTINCT s.student_id) AS total_students,

        ROUND(
            AVG(
                CASE
                    WHEN a.total_count > 0
                    THEN (
                        a.present_count::numeric
                        / a.total_count
                    ) * 100
                    ELSE 0
                END
            ),
            2
        ) AS attendance_percentage,

        ROUND(
            AVG(er.exam_average),
            2
        ) AS exam_average,

        COALESCE(
            MAX(syl.syllabus_percentage),
            0
        ) AS syllabus_percentage,

        COUNT(DISTINCT s.student_id)
            FILTER (
                WHERE er.failed_count > 0
            ) AS failed_students

    FROM jclg_group g

    JOIN jclg_student s
        ON s.group_id = g.group_id

    LEFT JOIN attendance a
        ON a.student_id = s.student_id

    LEFT JOIN exam_results er
        ON er.student_id = s.student_id

    LEFT JOIN syllabus syl
        ON syl.group_id = g.group_id

    WHERE g.status = TRUE
      AND s.campus_id = :campus_id
      AND s.academic_year_id = :academic_year_id

    GROUP BY
        g.group_id,
        g.group_name

    ORDER BY
        g.group_name
""")
    group_rows = (
        db.execute(
            group_query,
            {
                "campus_id": campus_id,
                "academic_year_id": academic_year_id,
            },
        )
        .mappings()
        .all()
    )

    academic_health = []

    for row in group_rows:

        syllabus_percentage = float(
            row["syllabus_percentage"] or 0
        )

        attendance = float(
            row["attendance_percentage"] or 0
        )

        exam_average = float(
            row["exam_average"] or 0
        )

        total_students = int(
            row["total_students"] or 0
        )

        failed_students = int(
            row["failed_students"] or 0
        )

        # --------------------------------------------------------
        # Health calculation
        # --------------------------------------------------------

        failure_rate = (
            (failed_students / total_students) * 100
            if total_students > 0
            else 0
        )

        if (
            attendance >= 90
            and exam_average >= 75
            and failure_rate <= 10
        ):
            health_status = "HEALTHY"

        elif (
            attendance >= 80
            and exam_average >= 65
            and failure_rate <= 15
        ):
            health_status = "STABLE"

        else:
            health_status = "NEEDS_ATTENTION"

        academic_health.append({
            "group_id": row["group_id"],
            "group_name": row["group_name"],
            "total_students": total_students,
            "attendance_percentage": attendance,
            "exam_average": exam_average,
            "syllabus_percentage": syllabus_percentage,
            "failed_students": failed_students,
            "health_status": health_status,
        })

    # ============================================================
    # 5. FINAL RESPONSE
    # ============================================================

    return {
        "academic_year_id": academic_year_id,
        "campus_id": campus_id,

        "student_progress_trends": {
            "summary": trend_data,
            "exams": [
                {
                    "exam_id": e["exam_id"],
                    "exam_name": e["exam_name"],
                    "exam_type": e["exam_type"],
                }
                for e in exams
            ],
        },

        "attendance_vs_performance": {
            "scatter": scatter,
            "bands": attendance_bands,
        },

        "academic_health_by_group": academic_health,
    }