import { useEffect, useState } from 'react'
import { fetchTrajectory, type TrajectoryData } from '../lib/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceDot,
} from 'recharts'

const SPOTLIGHT_IDS = ['S001', 'S002', 'S003', 'S004', 'S005']

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 border-red-300 text-red-800',
  high: 'bg-orange-100 border-orange-300 text-orange-800',
  warning: 'bg-amber-100 border-amber-300 text-amber-800',
}

function formatMonth(m: string) {
  const [, month] = m.split('-')
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return names[parseInt(month) - 1] || m
}

export default function Step5Trajectories() {
  const [selected, setSelected] = useState(SPOTLIGHT_IDS[0])
  const [data, setData] = useState<TrajectoryData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchTrajectory(selected).then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [selected])

  if (loading || !data) {
    return <div className="text-slate-400 py-12 text-center">Loading...</div>
  }

  const chartData = data.monthly_pmpm.map((p) => ({
    month: formatMonth(p.month),
    rawMonth: p.month,
    pmpm: p.pmpm,
  }))

  const eventMonths = new Set(data.events.map((e) => e.month))

  return (
    <div className="space-y-6">
      {/* Member Selector */}
      <div className="flex gap-2 flex-wrap">
        {SPOTLIGHT_IDS.map((id) => (
          <button
            key={id}
            onClick={() => setSelected(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
              ${selected === id
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {id}
          </button>
        ))}
      </div>

      {/* Member Info + Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{data.name}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{data.member_id} — {data.cohort} complexity</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-slate-500">Risk Score</p>
              <p className="text-xl font-bold text-slate-800">{data.risk_score}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <p className="text-slate-500 text-xs">Conditions</p>
              <p className="font-medium text-slate-700 mt-0.5">{data.conditions}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Medication Adherence</p>
              <p className={`font-medium mt-0.5 ${data.adherence ? 'text-green-600' : 'text-red-600'}`}>
                {data.adherence ? 'Adherent' : 'Non-adherent'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Cohort</p>
              <p className="font-medium text-slate-700 mt-0.5">{data.cohort}</p>
            </div>
          </div>
        </div>

        {/* Alert */}
        {data.alert ? (
          <div className={`rounded-xl border-2 p-5 ${SEVERITY_STYLES[data.alert.severity] || 'bg-slate-100 border-slate-300'}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
              System Alert
            </p>
            <p className="text-sm font-bold mt-2">{data.alert.message}</p>
            <p className="text-xs mt-2 opacity-70">Type: {data.alert.type.replace('_', ' ')}</p>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Status</p>
            <p className="text-sm font-bold text-green-700 mt-2">No alerts</p>
            <p className="text-xs text-green-600 mt-2">Member is within expected cost range.</p>
          </div>
        )}
      </div>

      {/* Trajectory Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Monthly Cost Trajectory</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="pmpmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `$${v.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, 'PMPM']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Area
              type="monotone"
              dataKey="pmpm"
              stroke="#0d9488"
              strokeWidth={2.5}
              fill="url(#pmpmGrad)"
            />
            {/* Event markers */}
            {chartData
              .filter((d) => eventMonths.has(d.rawMonth))
              .map((d) => (
                <ReferenceDot
                  key={d.rawMonth}
                  x={d.month}
                  y={d.pmpm}
                  r={6}
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Events Timeline */}
      {data.events.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Clinical Events</h3>
          <div className="space-y-2">
            {data.events.map((e) => (
              <div key={e.month} className="flex items-center gap-3 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-slate-500 font-mono text-xs w-16">{formatMonth(e.month)}</span>
                <span className="text-slate-700">{e.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
