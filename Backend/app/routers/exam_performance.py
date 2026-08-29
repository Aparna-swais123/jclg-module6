from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.connection import get_db


router = APIRouter(prefix="/exam-performance", tags=["Examination Performance"])


@router.get("")
def get_exam_performance(
    campus_id: int = Query(...),
    academic_year_id: int = Query(...),
    exam_id: int = Query(...),
    db: Session = Depends(get_db),
):
    exam_query = text("""
        SELECT
            exam_id,
            exam_name,
            exam_type
        FROM jclg_exam
        WHERE exam_id = :exam_id
          AND campus_id = :campus_id
          AND academic_year_id = :academic_year_id
          AND status = TRUE
    """)

    exam = (
        db.execute(
            exam_query,
            {
                "exam_id": exam_id,
                "campus_id": campus_id,
                "academic_year_id": academic_year_id,
            },
        )
        .mappings()
        .one_or_none()
    )

    if exam is None:
        return {
            "date": date.today(),
            "academic_year_id": academic_year_id,
            "campus_id": campus_id,
            "exam": None,
            "overall": {},
            "groups": [],
            "result_summary": {},
            "grade_distribution": [],
        }

    overall_query = text("""
        SELECT
            COUNT(DISTINCT student_id) AS appeared,

            COUNT(DISTINCT student_id)
                FILTER (
                    WHERE UPPER(result_status) = 'PASS'
                ) AS passed,

            COUNT(DISTINCT student_id)
                FILTER (
                    WHERE UPPER(result_status) = 'FAIL'
                ) AS failed,

            ROUND(AVG(percentage), 2) AS average_percentage,

            ROUND(MAX(percentage), 2) AS highest_percentage

        FROM jclg_result
        WHERE exam_id = :exam_id
    """)

    overall = (
        db.execute(
            overall_query,
            {"exam_id": exam_id},
        )
        .mappings()
        .one()
    )

    appeared = int(overall["appeared"] or 0)
    passed = int(overall["passed"] or 0)
    failed = int(overall["failed"] or 0)

    pass_percentage = (
        round((passed / appeared) * 100, 2)
        if appeared > 0
        else 0
    )

    fail_percentage = (
        round((failed / appeared) * 100, 2)
        if appeared > 0
        else 0
    )

    group_query = text("""
        SELECT
            g.group_id,
            g.group_name,

            COUNT(DISTINCT s.student_id) AS total_students,

            COUNT(DISTINCT r.student_id) AS appeared,

            COUNT(DISTINCT r.student_id)
                FILTER (
                    WHERE UPPER(r.result_status) = 'PASS'
                ) AS passed,

            COUNT(DISTINCT r.student_id)
                FILTER (
                    WHERE UPPER(r.result_status) = 'FAIL'
                ) AS failed,

            ROUND(AVG(r.percentage), 2) AS average_percentage

        FROM jclg_group g

        JOIN jclg_student s
            ON s.group_id = g.group_id
           AND s.campus_id = :campus_id

        LEFT JOIN jclg_result r
            ON r.student_id = s.student_id
           AND r.exam_id = :exam_id

        WHERE g.status = TRUE
          AND g.academic_year_id = :academic_year_id

        GROUP BY
            g.group_id,
            g.group_name

        ORDER BY
            g.group_name
    """)

    groups = (
        db.execute(
            group_query,
            {
                "exam_id": exam_id,
                "campus_id": campus_id,
                "academic_year_id": academic_year_id,
            },
        )
        .mappings()
        .all()
    )

    group_data = []

    for group in groups:
        grp_appeared = int(group["appeared"] or 0)
        grp_passed = int(group["passed"] or 0)
        grp_failed = int(group["failed"] or 0)

        group_data.append({
            "group_id": group["group_id"],
            "group_name": group["group_name"],
            "total_students": int(group["total_students"] or 0),
            "appeared": grp_appeared,
            "passed": grp_passed,
            "failed": grp_failed,
            "pass_percentage": (
                round((grp_passed / grp_appeared) * 100, 2)
                if grp_appeared > 0
                else 0
            ),
            "fail_percentage": (
                round((grp_failed / grp_appeared) * 100, 2)
                if grp_appeared > 0
                else 0
            ),
            "average_percentage": float(
                group["average_percentage"] or 0
            ),
        })

    summary_query = text("""
        SELECT
            COUNT(*) FILTER (
                WHERE UPPER(result_status) = 'PASS'
            ) AS passed,

            COUNT(*) FILTER (
                WHERE UPPER(result_status) = 'FAIL'
            ) AS failed,

            COUNT(*) FILTER (
                WHERE UPPER(grade) = 'A+'
            ) AS distinction,

            COUNT(*) FILTER (
                WHERE UPPER(grade) = 'A'
            ) AS first_class,

            COUNT(*) FILTER (
                WHERE UPPER(grade) = 'B+'
            ) AS second_class,

            COUNT(*) FILTER (
                WHERE UPPER(result_status) = 'BELOW_PASS'
            ) AS below_pass,

            COUNT(*) FILTER (
                WHERE UPPER(result_status) = 'PENDING'
            ) AS result_pending

        FROM jclg_result
        WHERE exam_id = :exam_id
    """)

    summary_result = (
        db.execute(
            summary_query,
            {"exam_id": exam_id},
        )
        .mappings()
        .one()
    )

    result_summary = {
        "passed": int(summary_result["passed"] or 0),
        "failed": int(summary_result["failed"] or 0),
        "distinction": int(summary_result["distinction"] or 0),
        "first_class": int(summary_result["first_class"] or 0),
        "second_class": int(summary_result["second_class"] or 0),
        "below_pass": int(summary_result["below_pass"] or 0),
        "result_pending": int(summary_result["result_pending"] or 0),
    }

    grade_query = text("""
        SELECT
            grade,
            COUNT(*) AS count
        FROM jclg_result
        WHERE exam_id = :exam_id
          AND grade IS NOT NULL
        GROUP BY grade
        ORDER BY
            CASE UPPER(grade)
                WHEN 'A+' THEN 1
                WHEN 'A'  THEN 2
                WHEN 'B+' THEN 3
                WHEN 'B'  THEN 4
                WHEN 'C'  THEN 5
                WHEN 'D'  THEN 6
                WHEN 'F'  THEN 7
                ELSE 8
            END
    """)

    grade_rows = (
        db.execute(
            grade_query,
            {"exam_id": exam_id},
        )
        .mappings()
        .all()
    )

    grade_distribution = []

    for row in grade_rows:
        count = int(row["count"] or 0)

        grade_distribution.append({
            "grade": row["grade"],
            "count": count,
            "percentage": (
                round((count / appeared) * 100, 2)
                if appeared > 0
                else 0
            ),
        })

    return {
        "date": date.today(),
        "academic_year_id": academic_year_id,
        "campus_id": campus_id,

        "exam": {
            "exam_id": exam["exam_id"],
            "exam_name": exam["exam_name"],
            "exam_type": exam["exam_type"],
        },

        "overall": {
            "average_percentage": float(
                overall["average_percentage"] or 0
            ),
            "pass_percentage": pass_percentage,
            "fail_percentage": fail_percentage,
            "highest_percentage": float(
                overall["highest_percentage"] or 0
            ),
            "appeared": appeared,
            "passed": passed,
            "failed": failed,
        },

        "groups": group_data,

        "result_summary": result_summary,

        "grade_distribution": grade_distribution,
    }