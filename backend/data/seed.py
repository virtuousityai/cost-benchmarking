"""
Synthetic data generator for Cost & Care Benchmarking demo.
~300 members across 3 cohorts + 5 spotlight members with crafted trajectories.
"""

import duckdb
import random
import os

random.seed(42)

DB_PATH = os.path.join(os.path.dirname(__file__), "benchmarking.duckdb")

# --- Name pools ---
FIRST_NAMES = [
    "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
    "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Daniel", "Lisa", "Matthew", "Nancy",
    "Anthony", "Betty", "Mark", "Margaret", "Donald", "Sandra", "Steven", "Ashley",
    "Paul", "Dorothy", "Andrew", "Kimberly", "Joshua", "Emily", "Kenneth", "Donna",
    "Kevin", "Michelle", "Brian", "Carol", "George", "Amanda", "Timothy", "Melissa",
    "Ronald", "Deborah", "Edward", "Stephanie", "Jason", "Rebecca", "Jeffrey", "Sharon",
    "Ryan", "Laura", "Jacob", "Cynthia"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"
]

MONTHS = [
    "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
    "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12"
]

# --- Cohort definitions ---
COHORTS = {
    "Low": {
        "count": 150,
        "risk_range": (0.5, 1.3),
        "risk_center": 0.9,
        "pmpm_range": (250, 600),
        "pmpm_center": 420,
        "conditions": ["Type 2 Diabetes"],
        "icd_codes": ["E11.0", "E11.1", "E11.9"],
        "drugs": ["Metformin"],
    },
    "Medium": {
        "count": 100,
        "risk_range": (1.0, 1.8),
        "risk_center": 1.4,
        "pmpm_range": (550, 1250),
        "pmpm_center": 890,
        "conditions": ["Type 2 Diabetes", "Hypertension"],
        "icd_codes": ["E11.0", "E11.5", "E11.9", "I10"],
        "drugs": ["Metformin", "Lisinopril", "GLP-1 Agonist"],
    },
    "High": {
        "count": 50,
        "risk_range": (1.8, 3.2),
        "risk_center": 2.3,
        "pmpm_range": (1800, 4000),
        "pmpm_center": 2750,
        "conditions": ["Type 2 Diabetes", "Hypertension", "CKD", "CHF"],
        "icd_codes": ["E11.0", "E11.5", "E11.65", "I10", "N18.3", "I50.9"],
        "drugs": ["Metformin", "Insulin", "GLP-1 Agonist", "Lisinopril", "Furosemide"],
    },
}

# --- Spotlight members (hand-crafted trajectories) ---
SPOTLIGHT_MEMBERS = [
    {
        "id": "S001",
        "name": "Maria Torres",
        "cohort": "High",
        "risk_score": 1.5,
        "conditions": ["Type 2 Diabetes", "CKD"],
        "adherence": False,
        "prior_admissions": 2,
        "ed_visits": 4,
        "enrolled_program": False,
        "monthly_pmpm": [400, 450, 600, 850, 1200, 1800, 2400, 2800, 3100, 3400, 3200, 3500],
        "alert": {
            "type": "rising_trajectory",
            "message": "3.7x expected cost. Rapid cost escalation in last 90 days.",
            "severity": "critical",
        },
        "events": {
            "2025-05": "New diagnosis: CKD Stage 3",
            "2025-06": "Medication gap detected (14 days)",
            "2025-07": "ER visit - hyperglycemia",
            "2025-09": "ER visit - fluid overload",
        },
    },
    {
        "id": "S002",
        "name": "Robert Chen",
        "cohort": "Medium",
        "risk_score": 1.6,
        "conditions": ["Type 2 Diabetes", "Hypertension"],
        "adherence": True,
        "prior_admissions": 0,
        "ed_visits": 1,
        "enrolled_program": True,
        "monthly_pmpm": [920, 900, 880, 860, 840, 820, 800, 780, 760, 740, 720, 700],
        "alert": None,
        "events": {},
    },
    {
        "id": "S003",
        "name": "Linda Washington",
        "cohort": "High",
        "risk_score": 2.5,
        "conditions": ["Type 2 Diabetes", "Hypertension", "CHF"],
        "adherence": False,
        "prior_admissions": 3,
        "ed_visits": 6,
        "enrolled_program": False,
        "monthly_pmpm": [2200, 2300, 2100, 2500, 2800, 3000, 2900, 3200, 3400, 3600, 3800, 4100],
        "alert": {
            "type": "cost_outlier",
            "message": "Sustained high cost. 1.5x expected for risk profile.",
            "severity": "high",
        },
        "events": {
            "2025-04": "Hospital admission - CHF exacerbation",
            "2025-08": "ER visit - chest pain",
            "2025-11": "Hospital admission - CHF exacerbation",
        },
    },
    {
        "id": "S004",
        "name": "James Patel",
        "cohort": "Low",
        "risk_score": 0.8,
        "conditions": ["Type 2 Diabetes"],
        "adherence": True,
        "prior_admissions": 0,
        "ed_visits": 0,
        "enrolled_program": True,
        "monthly_pmpm": [380, 400, 390, 410, 395, 405, 400, 385, 395, 400, 390, 405],
        "alert": None,
        "events": {},
    },
    {
        "id": "S005",
        "name": "Angela Freeman",
        "cohort": "Medium",
        "risk_score": 1.3,
        "conditions": ["Type 2 Diabetes", "Hypertension", "Obesity"],
        "adherence": False,
        "prior_admissions": 1,
        "ed_visits": 3,
        "enrolled_program": False,
        "monthly_pmpm": [700, 750, 800, 900, 1050, 1200, 1400, 1600, 1850, 2100, 2400, 2800],
        "alert": {
            "type": "rising_trajectory",
            "message": "High likelihood of transitioning to top 5% cost cohort within 60 days.",
            "severity": "warning",
        },
        "events": {
            "2025-03": "Medication gap detected (21 days)",
            "2025-06": "ER visit - uncontrolled blood pressure",
            "2025-09": "New diagnosis: Obesity (BMI 38)",
            "2025-11": "ER visit - diabetic complications",
        },
    },
]


def generate_name(used_names: set) -> str:
    while True:
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        if name not in used_names:
            used_names.add(name)
            return name


def clamp(val, lo, hi):
    return max(lo, min(hi, val))


def triangular(center, lo, hi):
    return clamp(random.triangular(lo, hi, center), lo, hi)


def generate_monthly_pmpm(center, lo, hi):
    """Generate 12 months of PMPM with slight random walk."""
    base = triangular(center, lo, hi)
    trend = random.uniform(-0.02, 0.02)  # slight monthly trend
    values = []
    current = base
    for _ in range(12):
        noise = random.gauss(0, base * 0.08)
        current = current * (1 + trend) + noise
        values.append(round(clamp(current, lo * 0.7, hi * 1.3), 2))
    return values


def create_schema(con):
    stmts = [
        "DROP TABLE IF EXISTS alerts",
        "DROP TABLE IF EXISTS member_events",
        "DROP TABLE IF EXISTS programs",
        "DROP TABLE IF EXISTS pharmacy",
        "DROP TABLE IF EXISTS claims",
        "DROP TABLE IF EXISTS members",
        """
        CREATE TABLE members (
            member_id VARCHAR PRIMARY KEY,
            name VARCHAR NOT NULL,
            cohort VARCHAR NOT NULL,
            risk_score DOUBLE NOT NULL,
            conditions VARCHAR NOT NULL,
            adherence BOOLEAN NOT NULL,
            prior_admissions INTEGER DEFAULT 0,
            ed_visits INTEGER DEFAULT 0,
            is_spotlight BOOLEAN DEFAULT FALSE
        )
        """,
        """
        CREATE TABLE claims (
            id INTEGER,
            member_id VARCHAR NOT NULL,
            month VARCHAR NOT NULL,
            allowed_cost DOUBLE NOT NULL,
            claim_type VARCHAR NOT NULL,
            icd_codes VARCHAR,
            FOREIGN KEY (member_id) REFERENCES members(member_id)
        )
        """,
        """
        CREATE TABLE pharmacy (
            id INTEGER,
            member_id VARCHAR NOT NULL,
            drug_name VARCHAR NOT NULL,
            fill_month VARCHAR NOT NULL,
            gap_flag BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (member_id) REFERENCES members(member_id)
        )
        """,
        """
        CREATE TABLE programs (
            member_id VARCHAR NOT NULL,
            enrolled BOOLEAN NOT NULL,
            program_name VARCHAR,
            enrollment_month VARCHAR,
            FOREIGN KEY (member_id) REFERENCES members(member_id)
        )
        """,
        """
        CREATE TABLE alerts (
            member_id VARCHAR NOT NULL,
            alert_type VARCHAR NOT NULL,
            message VARCHAR NOT NULL,
            severity VARCHAR NOT NULL,
            FOREIGN KEY (member_id) REFERENCES members(member_id)
        )
        """,
        """
        CREATE TABLE member_events (
            member_id VARCHAR NOT NULL,
            month VARCHAR NOT NULL,
            event_description VARCHAR NOT NULL,
            FOREIGN KEY (member_id) REFERENCES members(member_id)
        )
        """,
    ]
    for stmt in stmts:
        con.execute(stmt)


def seed_regular_members(con):
    used_names = set()
    member_id_counter = 1
    claim_id = 1
    pharma_id = 1

    for cohort_name, cfg in COHORTS.items():
        for _ in range(cfg["count"]):
            mid = f"M{member_id_counter:04d}"
            member_id_counter += 1
            name = generate_name(used_names)
            risk = round(triangular(cfg["risk_center"], *cfg["risk_range"]), 2)
            conditions = ", ".join(cfg["conditions"])
            adherence = random.random() > 0.3  # 70% adherent
            prior_admissions = random.choices([0, 1, 2, 3], weights=[60, 25, 10, 5])[0]
            ed_visits = random.choices([0, 1, 2, 3, 4], weights=[40, 30, 15, 10, 5])[0]

            if cohort_name == "Medium":
                prior_admissions = random.choices([0, 1, 2], weights=[50, 35, 15])[0]
                ed_visits = random.choices([0, 1, 2, 3], weights=[30, 35, 25, 10])[0]
            elif cohort_name == "High":
                prior_admissions = random.choices([1, 2, 3, 4], weights=[30, 35, 25, 10])[0]
                ed_visits = random.choices([1, 2, 3, 4, 5, 6], weights=[10, 20, 30, 20, 15, 5])[0]

            con.execute(
                "INSERT INTO members VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [mid, name, cohort_name, risk, conditions, adherence, prior_admissions, ed_visits, False],
            )

            # Claims - monthly
            monthly_pmpm = generate_monthly_pmpm(cfg["pmpm_center"], *cfg["pmpm_range"])
            for i, month in enumerate(MONTHS):
                cost = monthly_pmpm[i]
                med_cost = round(cost * random.uniform(0.55, 0.75), 2)
                pharma_cost = round(cost - med_cost, 2)

                icd = random.choice(cfg["icd_codes"])
                con.execute(
                    "INSERT INTO claims VALUES (?, ?, ?, ?, ?, ?)",
                    [claim_id, mid, month, med_cost, "medical", icd],
                )
                claim_id += 1
                con.execute(
                    "INSERT INTO claims VALUES (?, ?, ?, ?, ?, ?)",
                    [claim_id, mid, month, pharma_cost, "pharmacy", None],
                )
                claim_id += 1

            # Pharmacy fills
            for drug in cfg["drugs"]:
                for month in MONTHS:
                    gap = not adherence and random.random() < 0.2
                    con.execute(
                        "INSERT INTO pharmacy VALUES (?, ?, ?, ?, ?)",
                        [pharma_id, mid, drug, month, gap],
                    )
                    pharma_id += 1

            # Programs - ~40% enrolled in care management
            enrolled = random.random() < 0.4
            program_name = "Diabetes Care Management" if enrolled else None
            enroll_month = random.choice(MONTHS[:6]) if enrolled else None
            con.execute(
                "INSERT INTO programs VALUES (?, ?, ?, ?)",
                [mid, enrolled, program_name, enroll_month],
            )


def seed_spotlight_members(con):
    claim_id = 100000
    pharma_id = 100000

    for sp in SPOTLIGHT_MEMBERS:
        conditions = ", ".join(sp["conditions"])
        con.execute(
            "INSERT INTO members VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [sp["id"], sp["name"], sp["cohort"], sp["risk_score"], conditions,
             sp["adherence"], sp["prior_admissions"], sp["ed_visits"], True],
        )

        cohort_cfg = COHORTS[sp["cohort"]]

        # Claims from hand-crafted PMPM
        for i, month in enumerate(MONTHS):
            cost = sp["monthly_pmpm"][i]
            med_cost = round(cost * 0.65, 2)
            pharma_cost = round(cost - med_cost, 2)
            icd = random.choice(cohort_cfg["icd_codes"])

            con.execute(
                "INSERT INTO claims VALUES (?, ?, ?, ?, ?, ?)",
                [claim_id, sp["id"], month, med_cost, "medical", icd],
            )
            claim_id += 1
            con.execute(
                "INSERT INTO claims VALUES (?, ?, ?, ?, ?, ?)",
                [claim_id, sp["id"], month, pharma_cost, "pharmacy", None],
            )
            claim_id += 1

        # Pharmacy
        for drug in cohort_cfg["drugs"]:
            for month in MONTHS:
                gap = not sp["adherence"] and random.random() < 0.3
                con.execute(
                    "INSERT INTO pharmacy VALUES (?, ?, ?, ?, ?)",
                    [pharma_id, sp["id"], drug, month, gap],
                )
                pharma_id += 1

        # Programs
        con.execute(
            "INSERT INTO programs VALUES (?, ?, ?, ?)",
            [sp["id"], sp["enrolled_program"],
             "Diabetes Care Management" if sp["enrolled_program"] else None,
             "2025-01" if sp["enrolled_program"] else None],
        )

        # Alerts
        if sp["alert"]:
            con.execute(
                "INSERT INTO alerts VALUES (?, ?, ?, ?)",
                [sp["id"], sp["alert"]["type"], sp["alert"]["message"], sp["alert"]["severity"]],
            )

        # Events
        for month, desc in sp.get("events", {}).items():
            con.execute(
                "INSERT INTO member_events VALUES (?, ?, ?)",
                [sp["id"], month, desc],
            )


def main():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    con = duckdb.connect(DB_PATH)
    create_schema(con)
    seed_regular_members(con)
    seed_spotlight_members(con)

    # Verify
    for table in ["members", "claims", "pharmacy", "programs", "alerts", "member_events"]:
        count = con.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        print(f"  {table}: {count} rows")

    con.close()
    print(f"\nDatabase created at {DB_PATH}")


if __name__ == "__main__":
    main()
