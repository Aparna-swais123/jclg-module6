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

    # Fetch sections performance for this exam and campus
    section_query = text("""
        SELECT 
            s.group_id,
            sec.section_id,
            sec.section_name,
            COUNT(DISTINCT s.student_id) AS total_students,
            COUNT(DISTINCT r.student_id) AS appeared,
            COUNT(DISTINCT r.student_id) FILTER (WHERE UPPER(r.result_status) = 'PASS') AS passed,
            COUNT(DISTINCT r.student_id) FILTER (WHERE UPPER(r.result_status) = 'FAIL') AS failed,
            COALESCE(ROUND(AVG(r.percentage), 2), 0) AS average_percentage
        FROM jclg_section sec
        JOIN jclg_student s ON s.section_id = sec.section_id
        LEFT JOIN jclg_result r ON r.student_id = s.student_id AND r.exam_id = :exam_id
        WHERE s.campus_id = :campus_id AND s.academic_year_id = :academic_year_id
        GROUP BY s.group_id, sec.section_id, sec.section_name
        ORDER BY sec.section_name
    """)
    section_rows = (
        db.execute(
            section_query,
            {
                "exam_id": exam_id,
                "campus_id": campus_id,
                "academic_year_id": academic_year_id,
            },
        )
        .mappings()
        .all()
    )

    # Fetch subjects performance for this exam and campus
    subject_query = text("""
        SELECT 
            s.group_id,
            s.section_id,
            sub.subject_id,
            sub.subject_name,
            sub.max_marks,
            sub.pass_marks,
            COUNT(m.student_id) AS total_students,
            COUNT(m.student_id) FILTER (WHERE m.marks_obtained >= sub.pass_marks) AS passed,
            COUNT(m.student_id) FILTER (WHERE m.marks_obtained < sub.pass_marks) AS failed,
            COALESCE(ROUND(AVG((m.marks_obtained / sub.max_marks) * 100), 2), 0) AS average_percentage,
            COALESCE(ROUND(MAX((m.marks_obtained / sub.max_marks) * 100), 2), 0) AS highest_percentage,
            COALESCE(ROUND(MIN((m.marks_obtained / sub.max_marks) * 100), 2), 0) AS lowest_percentage
        FROM jclg_subject sub
        JOIN jclg_exam_subject es ON es.subject_id = sub.subject_id AND es.exam_id = :exam_id
        JOIN jclg_marks m ON m.exam_subject_id = es.exam_subject_id
        JOIN jclg_student s ON s.student_id = m.student_id
        WHERE s.campus_id = :campus_id AND s.academic_year_id = :academic_year_id
        GROUP BY s.group_id, s.section_id, sub.subject_id, sub.subject_name, sub.max_marks, sub.pass_marks
        ORDER BY sub.subject_name
    """)
    subject_rows = (
        db.execute(
            subject_query,
            {
                "exam_id": exam_id,
                "campus_id": campus_id,
                "academic_year_id": academic_year_id,
            },
        )
        .mappings()
        .all()
    )

    # Group subjects by (group_id, section_id)
    subjects_by_group_sec = {}
    for sub in subject_rows:
        key = (sub["group_id"], sub["section_id"])
        if key not in subjects_by_group_sec:
            subjects_by_group_sec[key] = []
        
        tot = int(sub["total_students"] or 0)
        p = int(sub["passed"] or 0)
        f = int(sub["failed"] or 0)
        pass_pct = round((p / tot) * 100, 2) if tot > 0 else 0
        fail_pct = round((f / tot) * 100, 2) if tot > 0 else 0

        subjects_by_group_sec[key].append({
            "subject_id": sub["subject_id"],
            "subject_name": sub["subject_name"],
            "max_marks": float(sub["max_marks"] or 100),
            "pass_marks": float(sub["pass_marks"] or 35),
            "total_students": tot,
            "passed": p,
            "failed": f,
            "pass_percentage": pass_pct,
            "fail_percentage": fail_pct,
            "average_percentage": float(sub["average_percentage"] or 0),
            "highest_percentage": float(sub["highest_percentage"] or 0),
            "lowest_percentage": float(sub["lowest_percentage"] or 0),
        })

    # Group sections by group_id
    sections_by_group = {}
    for sec in section_rows:
        gid = sec["group_id"]
        if gid not in sections_by_group:
            sections_by_group[gid] = []
        
        sec_appeared = int(sec["appeared"] or 0)
        sec_passed = int(sec["passed"] or 0)
        sec_failed = int(sec["failed"] or 0)
        sec_total = int(sec["total_students"] or 0)
        sec_pass_pct = round((sec_passed / sec_appeared) * 100, 2) if sec_appeared > 0 else 0
        sec_fail_pct = round((sec_failed / sec_appeared) * 100, 2) if sec_appeared > 0 else 0

        sec_subjects = subjects_by_group_sec.get((gid, sec["section_id"]), [])

        sections_by_group[gid].append({
            "section_id": sec["section_id"],
            "section_name": sec["section_name"],
            "total_students": sec_total,
            "appeared": sec_appeared,
            "passed": sec_passed,
            "failed": sec_failed,
            "pass_percentage": sec_pass_pct,
            "fail_percentage": sec_fail_pct,
            "average_percentage": float(sec["average_percentage"] or 0),
            "subjects": sec_subjects,
        })

    group_data = []

    for group in groups:
        grp_appeared = int(group["appeared"] or 0)
        grp_passed = int(group["passed"] or 0)
        grp_failed = int(group["failed"] or 0)
        gid = group["group_id"]

        group_data.append({
            "group_id": gid,
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
            "sections": sections_by_group.get(gid, []),
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