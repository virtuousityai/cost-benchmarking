import { useState } from 'react'
import Stepper from './components/Stepper'
import StepSummary from './components/StepSummary'
import Step1CohortBuilder from './steps/Step1CohortBuilder'
import Step2Segmentation from './steps/Step2Segmentation'
import Step3Baseline from './steps/Step3Baseline'
import Step4Outliers from './steps/Step4Outliers'
import Step5Trajectories from './steps/Step5Trajectories'
import Step6Programs from './steps/Step6Programs'
import Step7Insights from './steps/Step7Insights'

const STEPS = [
  {
    number: 1,
    title: 'Define & Classify Disease State',
    summary:
      "We're not just identifying diabetics — we're stratifying them into clinically meaningful cohorts that behave very differently from a cost perspective. Members are flagged via ICD-10 codes (E11.x), pharmacy claims (Metformin, GLP-1s, Insulin), or disease registry inclusion.",
    component: Step1CohortBuilder,
  },
  {
    number: 2,
    title: 'Risk & Cohort Segmentation',
    summary:
      "This lets us isolate not just diabetics — but the diabetics most likely to drive future cost. We segment by clinical complexity, layer in risk scores and utilization markers like prior admissions, ED visits, and medication adherence.",
    component: Step2Segmentation,
  },
  {
    number: 3,
    title: 'Establish PMPM Baseline',
    summary:
      "This is your internal benchmark — not industry average, but what your population actually costs over time. PMPM (Per Member Per Month) is calculated as total allowed cost divided by total member months, tracked across 12 months by cohort.",
    component: Step3Baseline,
  },
  {
    number: 4,
    title: 'Find Outliers Across Population',
    summary:
      "We're not just finding high-cost members — we're finding members whose costs are anomalous relative to their clinical profile. Each member is plotted against their expected cost band based on cohort and risk score.",
    component: Step4Outliers,
  },
  {
    number: 5,
    title: 'Emerging High-Cost Trajectories',
    summary:
      "This is where the value comes in — we're catching the trajectory before it peaks. Individual member cost trends are overlaid with clinical events like ER visits, new diagnoses, and medication gaps to identify rising-cost patterns early.",
    component: Step5Trajectories,
  },
  {
    number: 6,
    title: 'Program Effectiveness',
    summary:
      "Now we can prove which programs actually bend the cost curve — and which don't. Members enrolled in the diabetes care management program are compared against a control group to measure real PMPM impact over time.",
    component: Step6Programs,
  },
  {
    number: 7,
    title: 'Actionable Insights',
    summary:
      "The full picture: high-risk counts, cost outliers, rising trajectories, and estimated avoidable spend — all derived from continuous, predictive benchmarking rather than backward-looking industry averages.",
    component: Step7Insights,
  },
]

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const step = STEPS[currentStep]
  const StepComponent = step.component

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-800 to-blue-900 text-white px-8 py-5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Longitudinal Cost & Care Benchmarking
            </h1>
            <p className="text-teal-200 text-sm mt-1">
              Type 2 Diabetes Cohort — Population Analytics
            </p>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="max-w-7xl mx-auto px-8 pt-6">
        <Stepper
          steps={STEPS.map((s) => ({ number: s.number, title: s.title }))}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Step Summary */}
      <div className="max-w-7xl mx-auto px-8 pt-4">
        <StepSummary
          stepNumber={step.number}
          title={step.title}
          summary={step.summary}
        />
      </div>

      {/* Step Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <StepComponent />
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-8 pb-8 flex justify-between">
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="px-6 py-2.5 rounded-lg font-medium transition-all
            bg-white border border-teal-300 text-teal-700 hover:bg-teal-50
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={currentStep === STEPS.length - 1}
          className="px-6 py-2.5 rounded-lg font-medium transition-all
            bg-teal-600 text-white hover:bg-teal-700 shadow-md
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next Step
        </button>
      </div>
    </div>
  )
}

export default App
