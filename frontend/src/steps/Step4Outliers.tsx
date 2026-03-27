import { useEffect, useState } from 'react'
import { fetchScatter, fetchOutliers, type ScatterPoint, type OutlierRow } from '../lib/api'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ZAxis,
} from 'recharts'

const COHORT_COLORS: Record<string, string> = {
  Low: '#14b8a6',
  Medium: '#3b82f6',
  High: '#ef4444',
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ScatterPoint }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-800">{d.name}</p>
      <p className="text-slate-500">{d.member_id} — {d.cohort}</p>
      <p className="mt-1">Risk Score: <span className="font-medium">{d.risk_score}</span></p>
      <p>Avg PMPM: <span className="font-medium">${d.avg_pmpm.toLocaleString()}</span></p>
    </div>
  )
}

export default function Step4Outliers() {
  const [scatter, setScatter] = useState<ScatterPoint[] | null>(null)
  const [outliers, setOutliers] = useState<OutlierRow[] | null>(null)

  useEffect(() => {
    fetchScatter().then(setScatter)
    fetchOutliers().then(setOutliers)
  }, [])

  if (!scatter || !outliers) {
    return <div className="text-slate-400 py-12 text-center">Loading...</div>
  }

  const byCohort: Record<string, ScatterPoint[]> = { Low: [], Medium: [], High: [] }
  scatter.forEach((p) => {
    if (byCohort[p.cohort]) byCohort[p.cohort].push(p)
  })

  return (
    <div className="space-y-6">
      {/* Scatterplot */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Risk Score vs. PMPM</h3>
            <p className="text-xs text-slate-500 mt-0.5">Each dot is a member. Points above the expected band are cost outliers.</p>
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
        <ResponsiveContainer width="100%" height={380}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="risk_score"
              type="number"
              name="Risk Score"
              tick={{ fontSize: 11 }}
              label={{ value: 'Risk Score', position: 'insideBottom', offset: -5, fontSize: 11 }}
              domain={[0.3, 3.5]}
            />
            <YAxis
              dataKey="avg_pmpm"
              type="number"
              name="Avg PMPM"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `$${v.toLocaleString()}`}
              label={{ value: 'Avg PMPM', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
            />
            <ZAxis range={[40, 40]} />
            <Tooltip content={<CustomTooltip />} />
            {/* Expected cost reference line (linear approximation) */}
            <ReferenceLine
              segment={[{ x: 0.5, y: 300 }, { x: 3.2, y: 3000 }]}
              stroke="#94a3b8"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{ value: 'Expected Cost Band', position: 'insideTopRight', fontSize: 10, fill: '#94a3b8' }}
            />
            {Object.entries(byCohort).map(([cohort, data]) => (
              <Scatter
                key={cohort}
                name={cohort}
                data={data}
                fill={COHORT_COLORS[cohort]}
                fillOpacity={0.6}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Outlier Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">
            Cost Outliers
          </h3>
          <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">
            {outliers.length} flagged
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-2">Member</th>
                <th className="px-5 py-2">Cohort</th>
                <th className="px-5 py-2 text-right">Risk Score</th>
                <th className="px-5 py-2 text-right">Actual PMPM</th>
                <th className="px-5 py-2 text-right">Expected PMPM</th>
                <th className="px-5 py-2 text-right">Cost Ratio</th>
              </tr>
            </thead>
            <tbody>
              {outliers.slice(0, 15).map((o) => (
                <tr key={o.member_id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-2.5">
                    <p className="font-medium text-slate-800">{o.name}</p>
                    <p className="text-xs text-slate-400">{o.member_id}</p>
                  </td>
                  <td className="px-5 py-2.5">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: COHORT_COLORS[o.cohort] }}
                    />
                    {o.cohort}
                  </td>
                  <td className="px-5 py-2.5 text-right">{o.risk_score}</td>
                  <td className="px-5 py-2.5 text-right font-medium">${o.avg_pmpm.toLocaleString()}</td>
                  <td className="px-5 py-2.5 text-right text-slate-500">${o.expected_pmpm.toLocaleString()}</td>
                  <td className="px-5 py-2.5 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                      ${o.cost_ratio >= 2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {o.cost_ratio}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
