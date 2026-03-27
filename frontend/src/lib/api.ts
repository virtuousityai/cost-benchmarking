const BASE = import.meta.env.VITE_API_URL || '/api'

const MAX_RETRIES = 5
const RETRY_DELAY_MS = 3000

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function get<T>(path: string): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`)
      if (res.ok) return res.json()
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS)
        continue
      }
      throw new Error(`API error: ${res.status}`)
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS)
        continue
      }
      throw err
    }
  }
  throw new Error('Max retries exceeded')
}

// Wake up the backend — call this on app load
export async function warmUpBackend(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${BASE}/health`)
      if (res.ok) return
    } catch {
      // backend still waking up
    }
    if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS)
  }
}

// Step 1
export interface ClassificationData {
  disease: string
  criteria: { type: string; description: string }[]
  stratification: { level: string; description: string }[]
}

export function fetchClassification() {
  return get<ClassificationData>('/cohort/classification')
}

// Step 2
export interface SegmentRow {
  cohort: string
  members: number
  avg_risk_score: number
  avg_admissions: number
  avg_ed_visits: number
  adherence_pct: number
  key_conditions: string
}

export function fetchSegmentation() {
  return get<SegmentRow[]>('/cohort/segmentation')
}

// Step 3
export interface PmpmPoint {
  month: string
  pmpm: number
}

export function fetchPmpmTimeseries() {
  return get<Record<string, PmpmPoint[]>>('/baseline/pmpm-timeseries')
}

export interface PmpmSummary {
  cohort: string
  avg_pmpm: number
}

export function fetchPmpmSummary() {
  return get<PmpmSummary[]>('/baseline/pmpm-summary')
}

// Step 4
export interface ScatterPoint {
  member_id: string
  name: string
  cohort: string
  risk_score: number
  avg_pmpm: number
  is_spotlight: boolean
}

export function fetchScatter() {
  return get<ScatterPoint[]>('/baseline/scatter')
}

export interface OutlierRow {
  member_id: string
  name: string
  cohort: string
  risk_score: number
  avg_pmpm: number
  expected_pmpm: number
  cost_ratio: number
  is_spotlight: boolean
}

export function fetchOutliers() {
  return get<OutlierRow[]>('/baseline/outliers')
}

// Step 5
export interface TrajectoryEvent {
  month: string
  description: string
}

export interface Alert {
  type: string
  message: string
  severity: string
}

export interface TrajectoryData {
  member_id: string
  name: string
  cohort: string
  risk_score: number
  conditions: string
  adherence: boolean
  monthly_pmpm: PmpmPoint[]
  events: TrajectoryEvent[]
  alert: Alert | null
}

export function fetchTrajectory(memberId: string) {
  return get<TrajectoryData>(`/baseline/trajectory/${memberId}`)
}

// Step 6
export interface ProgramMonthly {
  month: string
  avg_pmpm: number
  member_count: number
}

export interface ProgramTrend {
  first_half_avg: number
  second_half_avg: number
  pct_change: number
}

export interface ProgramGroup {
  label: string
  monthly: ProgramMonthly[]
  trend: ProgramTrend | null
}

export interface ProgramEffectiveness {
  enrolled: ProgramGroup
  control: ProgramGroup
}

export function fetchProgramEffectiveness() {
  return get<ProgramEffectiveness>('/programs/effectiveness')
}

// Step 7
export interface InsightsSummary {
  high_risk_diabetics: number
  cost_outliers: number
  rising_trajectory: number
  estimated_avoidable_cost: number
}

export function fetchInsightsSummary() {
  return get<InsightsSummary>('/insights/summary')
}
