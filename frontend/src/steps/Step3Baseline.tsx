import { useEffect, useState } from 'react'
import { fetchPmpmTimeseries, fetchPmpmSummary, type PmpmPoint, type PmpmSummary } from '../lib/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'

const COHORT_COLORS: Record<string, string> = {
  Low: '#14b8a6',
  Medium: '#3b82f6',
  High: '#ef4444',
}

const COHORT_BG: Record<string, string> = {
  Low: 'bg-teal-50 border-teal-200 text-teal-700',
  Medium: 'bg-blue-50 border-blue-200 text-blue-700',
  High: 'bg-red-50 border-red-200 text-red-700',
}

function formatMonth(m: string) {
  const [, month] = m.split('-')
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return names[parseInt(month) - 1] || m
}

export default function Step3Baseline() {
  const [timeseries, setTimeseries] = useState<Record<string, PmpmPoint[]> | null>(null)
  const [summary, setSummary] = useState<PmpmSummary[] | null>(null)

  useEffect(() => {
    fetchPmpmTimeseries().then(setTimeseries)
    fetchPmpmSummary().then(setSummary)
  }, [])

  if (!timeseries || !summary) {
    return <div className="text-slate-400 py-12 text-center">Loading...</div>
  }

  // Merge into chart-friendly format: [{month, Low, Medium, High}]
  const months = timeseries['Low']?.map((p) => p.month) || []
  const chartData = months.map((month, i) => ({
    month: formatMonth(month),
    Low: timeseries['Low']?.[i]?.pmpm || 0,
    Medium: timeseries['Medium']?.[i]?.pmpm || 0,
    High: timeseries['High']?.[i]?.pmpm || 0,
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summary.map((s) => (
          <div key={s.cohort} className={`rounded-xl border p-5 ${COHORT_BG[s.cohort]}`}>
            <p className="text-sm font-semibold">{s.cohort} Complexity</p>
            <p className="text-3xl font-bold mt-1">
              ${s.avg_pmpm.toLocaleString()}
            </p>
            <p className="text-xs opacity-70 mt-1">12-month avg PMPM</p>
          </div>
        ))}
      </div>

      {/* Time-series Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">PMPM Over 12 Months</h3>
            <p className="text-xs text-slate-500 mt-0.5">Per Member Per Month = Total Allowed Cost / Total Member Months</p>
          </div>
          <div className="flex gap-3 text-xs">
            {Object.entries(COHORT_COLORS).map(([cohort, color]) => (
              <span key={cohort} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                {cohort}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `$${v.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="Low" stroke={COHORT_COLORS.Low} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Medium" stroke={COHORT_COLORS.Medium} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="High" stroke={COHORT_COLORS.High} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PMPM Calculation Note */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <p className="text-xs text-teal-700">
          <span className="font-semibold">How PMPM is calculated:</span> Total allowed cost divided by total member months.
          This is your internal benchmark — not industry average, but what your population actually costs over time.
        </p>
      </div>
    </div>
  )
}
