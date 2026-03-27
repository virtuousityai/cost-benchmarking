import { useEffect, useState } from 'react'
import { fetchSegmentation, type SegmentRow } from '../lib/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const COHORT_COLORS: Record<string, string> = {
  Low: '#14b8a6',
  Medium: '#3b82f6',
  High: '#ef4444',
}

const COHORT_BG: Record<string, string> = {
  Low: 'bg-teal-50 border-teal-200',
  Medium: 'bg-blue-50 border-blue-200',
  High: 'bg-red-50 border-red-200',
}

const COHORT_TEXT: Record<string, string> = {
  Low: 'text-teal-700',
  Medium: 'text-blue-700',
  High: 'text-red-700',
}

export default function Step2Segmentation() {
  const [data, setData] = useState<SegmentRow[] | null>(null)

  useEffect(() => {
    fetchSegmentation().then(setData)
  }, [])

  if (!data) {
    return <div className="text-slate-400 py-12 text-center">Loading...</div>
  }

  const totalMembers = data.reduce((a, d) => a + d.members, 0)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((row) => (
          <div
            key={row.cohort}
            className={`rounded-xl border p-5 ${COHORT_BG[row.cohort]}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-semibold ${COHORT_TEXT[row.cohort]}`}>
                {row.cohort} Complexity
              </span>
              <span className="text-xs text-slate-500">
                {((row.members / totalMembers) * 100).toFixed(0)}% of cohort
              </span>
            </div>
            <p className={`text-3xl font-bold ${COHORT_TEXT[row.cohort]}`}>
              {row.members.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">members</p>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div>
                <p className="text-slate-500">Avg Risk Score</p>
                <p className="font-semibold text-slate-700">{row.avg_risk_score}</p>
              </div>
              <div>
                <p className="text-slate-500">Adherence</p>
                <p className="font-semibold text-slate-700">{row.adherence_pct}%</p>
              </div>
              <div>
                <p className="text-slate-500">Avg Admissions</p>
                <p className="font-semibold text-slate-700">{row.avg_admissions}</p>
              </div>
              <div>
                <p className="text-slate-500">Avg ED Visits</p>
                <p className="font-semibold text-slate-700">{row.avg_ed_visits}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Segmentation Table + Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Cohort Breakdown</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-2">Cohort</th>
                <th className="px-5 py-2 text-right">Members</th>
                <th className="px-5 py-2 text-right">Risk Score</th>
                <th className="px-5 py-2">Key Conditions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.cohort} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                      style={{ backgroundColor: COHORT_COLORS[row.cohort] }}
                    />
                    {row.cohort}
                  </td>
                  <td className="px-5 py-3 text-right font-medium">
                    {row.members.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right font-medium">
                    {row.avg_risk_score}
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-xs">
                    {row.key_conditions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bar Chart - Risk Score by Cohort */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">
            Average Risk Score by Cohort
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="cohort" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 3]} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="avg_risk_score" name="Avg Risk Score" radius={[6, 6, 0, 0]}>
                {data.map((row) => (
                  <Cell key={row.cohort} fill={COHORT_COLORS[row.cohort]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
