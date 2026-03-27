import { useEffect, useState } from 'react'
import { fetchClassification, type ClassificationData } from '../lib/api'

const CRITERIA_ICONS: Record<string, string> = {
  diagnosis: 'Dx',
  pharmacy: 'Rx',
  registry: 'Reg',
}

const CRITERIA_COLORS: Record<string, string> = {
  diagnosis: 'bg-blue-100 text-blue-700 border-blue-200',
  pharmacy: 'bg-teal-100 text-teal-700 border-teal-200',
  registry: 'bg-slate-100 text-slate-600 border-slate-200',
}

const STRAT_COLORS = [
  'border-l-green-400 bg-green-50',
  'border-l-amber-400 bg-amber-50',
  'border-l-red-400 bg-red-50',
]

export default function Step1CohortBuilder() {
  const [data, setData] = useState<ClassificationData | null>(null)

  useEffect(() => {
    fetchClassification().then(setData)
  }, [])

  if (!data) {
    return <div className="text-slate-400 py-12 text-center">Loading...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Classification Criteria */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Classification Criteria
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Members flagged as {data.disease} if ANY of the following:
        </p>

        <div className="space-y-3">
          {data.criteria.map((c) => (
            <div
              key={c.type}
              className={`flex items-start gap-3 p-3 rounded-lg border ${CRITERIA_COLORS[c.type] || 'bg-slate-50 border-slate-200'}`}
            >
              <span className="w-10 h-10 rounded-lg bg-white/80 border border-current/10 flex items-center justify-center font-bold text-sm shrink-0">
                {CRITERIA_ICONS[c.type] || '?'}
              </span>
              <div>
                <p className="font-medium text-sm capitalize">{c.type}</p>
                <p className="text-xs opacity-80 mt-0.5">{c.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">ICD-10 Codes:</span> E11.0, E11.1, E11.5, E11.9, E11.65
          </p>
          <p className="text-xs text-blue-700 mt-1">
            <span className="font-semibold">Drugs:</span> Metformin, GLP-1 Agonists, Insulin, Lisinopril, Furosemide
          </p>
        </div>
      </div>

      {/* Clinical Stratification */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Clinical Stratification
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Refine into clinically meaningful cohorts
        </p>

        <div className="space-y-3">
          {data.stratification.map((s, i) => (
            <div
              key={s.level}
              className={`border-l-4 rounded-r-lg p-4 ${STRAT_COLORS[i] || 'bg-slate-50 border-l-slate-300'}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-slate-800">{s.level}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${i === 0 ? 'bg-green-200 text-green-800' : i === 1 ? 'bg-amber-200 text-amber-800' : 'bg-red-200 text-red-800'}`}>
                  {i === 0 ? 'Low' : i === 1 ? 'Medium' : 'High'} Complexity
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 p-3 bg-teal-50 rounded-lg border border-teal-200">
          <p className="text-xs text-teal-700 font-medium">
            Population: Type 2 Diabetes Cohort
          </p>
          <p className="text-xs text-teal-600 mt-1">
            High prevalence, high cost variability — ideal for longitudinal benchmarking.
          </p>
        </div>
      </div>
    </div>
  )
}
