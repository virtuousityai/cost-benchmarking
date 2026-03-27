from fastapi import APIRouter, Query
from db import get_con

router = APIRouter()


@router.get("/pmpm-timeseries")
def get_pmpm_timeseries():
    """Step 3: PMPM over 12 months by cohort."""
    con = get_con()
    rows = con.execute("""
        SELECT
            m.cohort,
            c.month,
            ROUND(SUM(c.allowed_cost) / COUNT(DISTINCT m.member_id), 2) as pmpm
        FROM claims c
        JOIN members m ON c.member_id = m.member_id
        GROUP BY m.cohort, c.month
        ORDER BY m.cohort, c.month
    """).fetchall()
    con.close()

    result = {}
    for cohort, month, pmpm in rows:
        if cohort not in result:
            result[cohort] = []
        result[cohort].append({"month": month, "pmpm": pmpm})

    return result


@router.get("/pmpm-summary")
def get_pmpm_summary():
    """Step 3: 12-month average PMPM by cohort."""
    con = get_con()
    rows = con.execute("""
        SELECT
            m.cohort,
            ROUND(SUM(c.allowed_cost) / COUNT(DISTINCT m.member_id) / 12, 2) as avg_pmpm
        FROM claims c
        JOIN members m ON c.member_id = m.member_id
        GROUP BY m.cohort
        ORDER BY avg_pmpm
    """).fetchall()
    con.close()

    return [{"cohort": r[0], "avg_pmpm": r[1]} for r in rows]


@router.get("/scatter")
def get_scatter_data():
    """Step 4: Risk score vs PMPM for all members."""
    con = get_con()
    rows = con.execute("""
        SELECT
            m.member_id,
            m.name,
            m.cohort,
            m.risk_score,
            ROUND(SUM(c.allowed_cost) / 12, 2) as avg_pmpm,
            m.is_spotlight
        FROM members m
        JOIN claims c ON m.member_id = c.member_id
        GROUP BY m.member_id, m.name, m.cohort, m.risk_score, m.is_spotlight
    """).fetchall()
    con.close()

    return [
        {
            "member_id": r[0],
            "name": r[1],
            "cohort": r[2],
            "risk_score": r[3],
            "avg_pmpm": r[4],
            "is_spotlight": r[5],
        }
        for r in rows
    ]


@router.get("/outliers")
def get_outliers():
    """Step 4: Members whose cost exceeds expected range for their risk score."""
    con = get_con()
    rows = con.execute("""
        WITH member_costs AS (
            SELECT
                m.member_id,
                m.name,
                m.cohort,
                m.risk_score,
                m.conditions,
                ROUND(SUM(c.allowed_cost) / 12, 2) as avg_pmpm,
                m.is_spotlight
            FROM members m
            JOIN claims c ON m.member_id = c.member_id
            GROUP BY m.member_id, m.name, m.cohort, m.risk_score, m.conditions, m.is_spotlight
        ),
        expected AS (
            SELECT
                cohort,
                AVG(avg_pmpm) as cohort_avg,
                STDDEV(avg_pmpm) as cohort_std
            FROM member_costs
            GROUP BY cohort
        )
        SELECT
            mc.member_id,
            mc.name,
            mc.cohort,
            mc.risk_score,
            mc.avg_pmpm,
            ROUND(e.cohort_avg, 2) as expected_pmpm,
            ROUND(mc.avg_pmpm / e.cohort_avg, 2) as cost_ratio,
            mc.is_spotlight
        FROM member_costs mc
        JOIN expected e ON mc.cohort = e.cohort
        WHERE mc.avg_pmpm > e.cohort_avg + 1.5 * e.cohort_std
        ORDER BY cost_ratio DESC
    """).fetchall()
    con.close()

    return [
        {
            "member_id": r[0],
            "name": r[1],
            "cohort": r[2],
            "risk_score": r[3],
            "avg_pmpm": r[4],
            "expected_pmpm": r[5],
            "cost_ratio": r[6],
            "is_spotlight": r[7],
        }
        for r in rows
    ]


@router.get("/trajectory/{member_id}")
def get_member_trajectory(member_id: str):
    """Step 5: Monthly cost trajectory for a single member."""
    con = get_con()

    member = con.execute("""
        SELECT member_id, name, cohort, risk_score, conditions, adherence
        FROM members WHERE member_id = ?
    """, [member_id]).fetchone()

    if not member:
        con.close()
        return {"error": "Member not found"}

    monthly = con.execute("""
        SELECT month, ROUND(SUM(allowed_cost), 2) as pmpm
        FROM claims
        WHERE member_id = ?
        GROUP BY month
        ORDER BY month
    """, [member_id]).fetchall()

    events = con.execute("""
        SELECT month, event_description
        FROM member_events
        WHERE member_id = ?
        ORDER BY month
    """, [member_id]).fetchall()

    alert = con.execute("""
        SELECT alert_type, message, severity
        FROM alerts
        WHERE member_id = ?
    """, [member_id]).fetchone()

    con.close()

    return {
        "member_id": member[0],
        "name": member[1],
        "cohort": member[2],
        "risk_score": member[3],
        "conditions": member[4],
        "adherence": member[5],
        "monthly_pmpm": [{"month": m[0], "pmpm": m[1]} for m in monthly],
        "events": [{"month": e[0], "description": e[1]} for e in events],
        "alert": {"type": alert[0], "message": alert[1], "severity": alert[2]} if alert else None,
    }
