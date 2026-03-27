interface StepSummaryProps {
  stepNumber: number
  title: string
  summary: string
}

export default function StepSummary({ stepNumber, title, summary }: StepSummaryProps) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-xl border border-teal-200 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
          {stepNumber}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <p className="text-slate-600 text-sm mt-1 leading-relaxed">{summary}</p>
        </div>
      </div>
    </div>
  )
}
