from fastapi import APIRouter
from db import get_con

router = APIRouter()


@router.get("/summary")
def get_summary():
    """Step 7: Dashboard summary cards."""
    con = get_con()

    high_risk = con.execute(
        "SELECT COUNT(*) FROM members WHERE cohort = 'High'"
    ).fetchone()[0]

    # Outliers: members > 1.5 std above their cohort mean
    outliers = con.execute("""
        WITH member_costs AS (
            SELECT m.member_id, m.cohort,
                   SUM(c.allowed_cost) / 12 as avg_pmpm
            FROM members m
            JOIN claims c ON m.member_id = c.member_id
            GROUP BY m.member_id, m.cohort
        ),
        thresholds AS (
            SELECT cohort,
                   AVG(avg_pmpm) + 1.5 * STDDEV(avg_pmpm) as threshold
            FROM member_costs GROUP BY cohort
        )
        SELECT COUNT(*)
        FROM member_costs mc
        JOIN thresholds t ON mc.cohort = t.cohort
        WHERE mc.avg_pmpm > t.threshold
    """).fetchone()[0]

    rising = con.execute(
        "SELECT COUNT(*) FROM alerts WHERE alert_type = 'rising_trajectory'"
    ).fetchone()[0]

    # Estimated avoidable cost: outlier excess * 12
    avoidable = con.execute("""
        WITH member_costs AS (
            SELECT m.member_id, m.cohort,
                   SUM(c.allowed_cost) / 12 as avg_pmpm
            FROM members m
            JOIN claims c ON m.member_id = c.member_id
            GROUP BY m.member_id, m.cohort
        ),
        thresholds AS (
            SELECT cohort,
                   AVG(avg_pmpm) as cohort_avg,
                   AVG(avg_pmpm) + 1.5 * STDDEV(avg_pmpm) as threshold
            FROM member_costs GROUP BY cohort
        )
        SELECT ROUND(SUM((mc.avg_pmpm - t.cohort_avg) * 12), 0)
        FROM member_costs mc
        JOIN thresholds t ON mc.cohort = t.cohort
        WHERE mc.avg_pmpm > t.threshold
    """).fetchone()[0] or 0

    con.close()

    return {
        "high_risk_diabetics": high_risk,
        "cost_outliers": outliers,
        "rising_trajectory": rising,
        "estimated_avoidable_cost": avoidable,
    }
