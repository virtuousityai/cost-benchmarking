import { useEffect, useState } from 'react'
import { fetchProgramEffectiveness, type ProgramEffectiveness } from '../lib/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

function formatMonth(m: string) {
  const [, month] = m.split('-')
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return names[parseInt(month) - 1] || m
}

export default function Step6Programs() {
  const [data, setData] = useState<ProgramEffectiveness | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgramEffectiveness().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading || !data) {
    return <div className="text-slate-400 py-12 text-center">Loading...</div>
  }

  // Merge enrolled + control into one array for the chart
  const chartData = data.enrolled.monthly.map((e, i) => ({
    month: formatMonth(e.month),
    enrolled: e.avg_pmpm,
    control: data.control.monthly[i]?.avg_pmpm ?? null,
  }))

  const enrolledTrend = data.enrolled.trend
  const controlTrend = data.control.trend

  return (
    <div className="space-y-6">
      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TrendCard
          label={data.enrolled.label}
          trend={enrolledTrend}
          color="teal"
          positive
        />
        <TrendCard
          label={data.control.label}
          trend={controlTrend}
          color="slate"
          positive={false}
        />
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          Monthly PMPM Comparison
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Enrolled in care management vs. no intervention
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `$${v.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value, name) => [
                `$${Number(value).toLocaleString()}`,
                name === 'enrolled' ? 'Care Management' : 'No Intervention',
              ]}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Legend
              formatter={(value) =>
                value === 'enrolled' ? 'Care Management' : 'No Intervention'
              }
            />
            <Line
              type="monotone"
              dataKey="enrolled"
              stroke="#0d9488"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0d9488' }}
            />
            <Line
              type="monotone"
              dataKey="control"
              stroke="#94a3b8"
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={{ r: 3, fill: '#94a3b8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pre/Post Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Pre / Post Comparison</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 text-xs border-b border-slate-200">
              <th className="pb-2 font-medium">Group</th>
              <th className="pb-2 font-medium text-right">First 6 Months Avg</th>
              <th className="pb-2 font-medium text-right">Last 6 Months Avg</th>
              <th className="pb-2 font-medium text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: data.enrolled.label, trend: enrolledTrend },
              { label: data.control.label, trend: controlTrend },
            ].map((row) => (
              <tr key={row.label} className="border-b border-slate-100">
                <td className="py-3 font-medium text-slate-700">{row.label}</td>
                <td className="py-3 text-right text-slate-600">
                  {row.trend ? `$${row.trend.first_half_avg.toLocaleString()}` : '—'}
                </td>
                <td className="py-3 text-right text-slate-600">
                  {row.trend ? `$${row.trend.second_half_avg.toLocaleString()}` : '—'}
                </td>
                <td className="py-3 text-right font-semibold">
                  {row.trend ? (
                    <span className={row.trend.pct_change <= 0 ? 'text-green-600' : 'text-red-600'}>
                      {row.trend.pct_change > 0 ? '+' : ''}{row.trend.pct_change}%
                    </span>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface TrendCardProps {
  label: string
  trend: { first_half_avg: number; second_half_avg: number; pct_change: number } | null
  color: 'teal' | 'slate'
  positive: boolean
}

function TrendCard({ label, trend, color, positive }: TrendCardProps) {
  if (!trend) return null

  const improving = positive ? trend.pct_change <= 0 : trend.pct_change > 0
  const arrow = trend.pct_change <= 0 ? '\u2193' : '\u2191'
  const borderColor = color === 'teal' ? 'border-teal-200' : 'border-slate-200'
  const bgColor = color === 'teal' ? 'bg-teal-50/50' : 'bg-slate-50'

  return (
    <div className={`rounded-xl border-2 ${borderColor} ${bgColor} p-5`}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-3 mt-2">
        <span className={`text-3xl font-bold ${improving ? 'text-green-600' : 'text-red-600'}`}>
          {trend.pct_change > 0 ? '+' : ''}{trend.pct_change}%
        </span>
        <span className={`text-lg ${improving ? 'text-green-500' : 'text-red-500'}`}>{arrow}</span>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        ${trend.first_half_avg.toLocaleString()} avg (H1) → ${trend.second_half_avg.toLocaleString()} avg (H2)
      </p>
    </div>
  )
}
