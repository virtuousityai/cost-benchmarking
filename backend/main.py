from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import cohort, baseline, programs, insights

app = FastAPI(title="Cost & Care Benchmarking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cohort.router, prefix="/api/cohort", tags=["cohort"])
app.include_router(baseline.router, prefix="/api/baseline", tags=["baseline"])
app.include_router(programs.router, prefix="/api/programs", tags=["programs"])
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
