from fastapi import APIRouter
from db import get_con

router = APIRouter()


@router.get("/classification")
def get_classification_logic():
    """Step 1: Disease classification criteria."""
    return {
        "disease": "Type 2 Diabetes Mellitus",
        "criteria": [
            {"type": "diagnosis", "description": ">=2 claims with ICD-10 E11.x"},
            {"type": "pharmacy", "description": "Pharmacy claims for Metformin, GLP-1s, or Insulin"},
            {"type": "registry", "description": "Inclusion in internal disease registry"},
        ],
        "stratification": [
            {"level": "Uncomplicated", "description": "Diabetes only"},
            {"level": "Single comorbidity", "description": "Diabetes + Hypertension"},
            {"level": "Multiple comorbidities", "description": "Diabetes + CKD, CHF, Obesity"},
        ],
    }


@router.get("/segmentation")
def get_segmentation():
    """Step 2: Cohort segmentation with risk scores and utilization."""
    con = get_con()
    rows = con.execute("""
        SELECT
            cohort,
            COUNT(*) as member_count,
            ROUND(AVG(risk_score), 2) as avg_risk_score,
            ROUND(AVG(prior_admissions), 1) as avg_admissions,
            ROUND(AVG(ed_visits), 1) as avg_ed_visits,
            ROUND(SUM(CASE WHEN adherence THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as adherence_pct
        FROM members
        GROUP BY cohort
        ORDER BY avg_risk_score
    """).fetchall()
    con.close()

    cohort_conditions = {
        "Low": "Diabetes only",
        "Medium": "Diabetes + Hypertension",
        "High": "Diabetes + CKD, CHF",
    }

    return [
        {
            "cohort": r[0],
            "members": r[1],
            "avg_risk_score": r[2],
            "avg_admissions": r[3],
            "avg_ed_visits": r[4],
            "adherence_pct": r[5],
            "key_conditions": cohort_conditions.get(r[0], ""),
        }
        for r in rows
    ]
