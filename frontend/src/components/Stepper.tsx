interface Step {
  number: number
  title: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick: (index: number) => void
}

export default function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const isActive = i === currentStep
        const isCompleted = i < currentStep

        return (
          <button
            key={step.number}
            onClick={() => onStepClick(i)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
              transition-all whitespace-nowrap cursor-pointer
              ${isActive
                ? 'bg-teal-600 text-white shadow-md'
                : isCompleted
                  ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                  : 'bg-white/70 text-slate-500 hover:bg-white hover:text-slate-700'
              }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${isActive
                  ? 'bg-white text-teal-700'
                  : isCompleted
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
            >
              {isCompleted ? '✓' : step.number}
            </span>
            <span className="hidden lg:inline">{step.title}</span>
          </button>
        )
      })}
    </div>
  )
}
