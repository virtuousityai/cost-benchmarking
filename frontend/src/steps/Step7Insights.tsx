import { useEffect, useState } from 'react'
import { fetchInsightsSummary, type InsightsSummary } from '../lib/api'

const CARDS = [
  {
    key: 'high_risk_diabetics' as const,
    label: 'High-Risk Diabetics',
    icon: '\u26A0',
    color: 'from-red-500 to-red-600',
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: 'cost_outliers' as const,
    label: 'Cost Outliers Flagged',
    icon: '\uD83D\uDCC8',
    color: 'from-orange-500 to-amber-500',
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: 'rising_trajectory' as const,
    label: 'Rising Trajectory',
    icon: '\uD83D\uDE80',
    color: 'from-blue-500 to-blue-600',
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: 'estimated_avoidable_cost' as const,
    label: 'Est. Avoidable Cost (Annual)',
    icon: '\uD83D\uDCB0',
    color: 'from-teal-500 to-teal-600',
    format: (v: number) => `$${(v / 1_000_000).toFixed(1)}M`,
  },
]

export default function Step7Insights() {
  const [data, setData] = useState<InsightsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsightsSummary().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading || !data) {
    return <div className="text-slate-400 py-12 text-center">Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((card) => (
          <div
            key={card.key}
            className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200 p-5"
          >
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${card.color}`} />
            <div className="pl-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {card.label}
              </p>
              <p className="text-3xl font-bold text-slate-800 mt-2">
                {card.format(data[card.key])}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* End-to-End Narrative */}
      <div className="bg-gradient-to-br from-teal-800 to-blue-900 rounded-xl p-8 text-white shadow-lg">
        <h3 className="text-lg font-bold mb-4">End-to-End Narrative</h3>
        <p className="text-teal-100 leading-relaxed text-sm">
          We start by precisely defining a disease cohort, stratify it by clinical and risk complexity,
          establish a real internal PMPM baseline, and then apply that model across the entire population
          to identify outliers and emerging high-cost members.
        </p>
        <p className="text-teal-100 leading-relaxed text-sm mt-3">
          Instead of looking backward like traditional benchmarking, this gives you a{' '}
          <span className="text-white font-semibold">continuous, predictive view of cost</span> —
          and a way to directly measure which interventions actually work.
        </p>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Recommended Actions</h3>
        <div className="space-y-3">
          {[
            {
              priority: 'Critical',
              color: 'bg-red-100 text-red-700',
              text: `Review ${data.cost_outliers} cost outliers for care management enrollment`,
            },
            {
              priority: 'High',
              color: 'bg-orange-100 text-orange-700',
              text: `Monitor ${data.rising_trajectory} members on rising cost trajectories — intervene within 30 days`,
            },
            {
              priority: 'Medium',
              color: 'bg-blue-100 text-blue-700',
              text: 'Expand diabetes care management program to medium-complexity cohort based on effectiveness data',
            },
            {
              priority: 'Ongoing',
              color: 'bg-teal-100 text-teal-700',
              text: `Track $${(data.estimated_avoidable_cost / 1_000_000).toFixed(1)}M avoidable cost reduction quarterly`,
            },
          ].map((item) => (
            <div key={item.priority} className="flex items-start gap-3">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.color} shrink-0 mt-0.5`}>
                {item.priority}
              </span>
              <p className="text-sm text-slate-700">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
