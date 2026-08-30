from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.connection import get_db


router = APIRouter(
    prefix="/principal",
    tags=["Principal"]
)


@router.get("/profile")
def get_principal_profile(
    user_id: int = Query(...),
    db: Session = Depends(get_db),
):
    query = text("""
        SELECT
            u.user_id,
            ur.campus_id,
            ur.role_id,
            r.role_code,
            r.role_name,

            u.first_name,
            u.last_name,
            u.email,
            u.phone,
            u.gender,
            u.profile_photo

        FROM jclg_user u

        JOIN jclg_user_role ur
            ON ur.user_id = u.user_id

        JOIN jclg_role r
            ON r.role_id = ur.role_id

        WHERE u.user_id = :user_id
          AND r.role_code = 'PRINCIPAL'
          AND u.status = TRUE
          AND ur.status = TRUE
          AND r.status = TRUE

        ORDER BY ur.is_primary DESC

        LIMIT 1
    """)

    principal = (
        db.execute(
            query,
            {
                "user_id": user_id
            }
        )
        .mappings()
        .one_or_none()
    )

    if principal is None:
        return {
            "date": date.today(),
            "principal": None,
            "message": "Principal profile not found"
        }

    full_name = " ".join(
        name
        for name in [
            principal["first_name"],
            principal["last_name"]
        ]
        if name
    )

    return {
        "date": date.today(),

        "principal": {
            "user_id": principal["user_id"],
            "campus_id": principal["campus_id"],

            "first_name": principal["first_name"],
            "last_name": principal["last_name"],
            "full_name": full_name,

            "email": principal["email"],
            "phone": principal["phone"],
            "gender": principal["gender"],
            "profile_photo": principal["profile_photo"],

            "role_id": principal["role_id"],
            "role_code": principal["role_code"],
            "role_name": principal["role_name"],
        }
    }