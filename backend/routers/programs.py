from fastapi import APIRouter
from db import get_con

router = APIRouter()


@router.get("/effectiveness")
def get_program_effectiveness():
    """Step 6: Compare enrolled vs non-enrolled PMPM trends."""
    con = get_con()

    rows = con.execute("""
        WITH member_monthly AS (
            SELECT
                m.member_id,
                p.enrolled,
                c.month,
                SUM(c.allowed_cost) as monthly_cost
            FROM members m
            JOIN claims c ON m.member_id = c.member_id
            JOIN programs p ON m.member_id = p.member_id
            GROUP BY m.member_id, p.enrolled, c.month
        )
        SELECT
            enrolled,
            month,
            ROUND(AVG(monthly_cost), 2) as avg_pmpm,
            COUNT(DISTINCT member_id) as member_count
        FROM member_monthly
        GROUP BY enrolled, month
        ORDER BY enrolled, month
    """).fetchall()
    con.close()

    enrolled_data = []
    control_data = []

    for row in rows:
        entry = {"month": row[1], "avg_pmpm": row[2], "member_count": row[3]}
        if row[0]:
            enrolled_data.append(entry)
        else:
            control_data.append(entry)

    # Calculate pre/post for enrolled (first 6 months vs last 6 months)
    def calc_trend(data):
        if len(data) < 12:
            return None
        first_half = sum(d["avg_pmpm"] for d in data[:6]) / 6
        second_half = sum(d["avg_pmpm"] for d in data[6:]) / 6
        pct_change = round((second_half - first_half) / first_half * 100, 1)
        return {
            "first_half_avg": round(first_half, 2),
            "second_half_avg": round(second_half, 2),
            "pct_change": pct_change,
        }

    return {
        "enrolled": {
            "label": "Care Management",
            "monthly": enrolled_data,
            "trend": calc_trend(enrolled_data),
        },
        "control": {
            "label": "No Intervention",
            "monthly": control_data,
            "trend": calc_trend(control_data),
        },
    }
