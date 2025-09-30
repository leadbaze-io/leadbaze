import { motion } from 'framer-motion'
import { CheckCircle, Circle } from 'lucide-react'

interface Step {
  id: number
  title: string
  description: string
  completed: boolean
  disabled: boolean
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepChange: (stepId: number) => void
}

export function StepIndicator({ steps, currentStep, onStepChange }: StepIndicatorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
        {/* Etapas */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 flex-1">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = step.completed
            const isDisabled = step.disabled
            const isClickable = !isDisabled && (step.id <= currentStep || isCompleted)

            return (
              <div key={step.id} className="flex items-center gap-3 sm:gap-4">
                {/* Conector (linha) */}
                {index > 0 && (
                  <div className={`hidden sm:block w-8 h-0.5 transition-colors duration-300 ${
                    steps[index - 1].completed

                      ? 'bg-green-500'

                      : steps[index - 1].id < currentStep
                        ? 'bg-slate-400'
                        : 'bg-gray-300'
                  }`} />
                )}

                {/* Ícone da Etapa */}
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    onClick={() => isClickable && onStepChange(step.id)}
                    disabled={!isClickable}
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 dark:from-slate-700 dark:to-slate-800 text-white shadow-lg scale-110'
                        : isCompleted
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                          : isDisabled
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer'
                    }`}
                    whileHover={isClickable ? { scale: 1.05 } : {}}
                    whileTap={isClickable ? { scale: 0.95 } : {}}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}

                    {/* Número da etapa */}
                    {!isCompleted && (
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                        {step.id}
                      </span>
                    )}
                  </motion.button>

                  {/* Texto da Etapa */}
                  <div className="text-center min-w-0">
                    <p className={`text-sm font-semibold transition-colors duration-300 text-gray-900 dark:text-gray-100 ${
                      isActive
                        ? 'text-purple-600 dark:text-purple-400'
                        : isCompleted
                          ? 'text-green-600'
                          : isDisabled
                            ? 'text-gray-400'
                            : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-xs transition-colors duration-300 text-gray-600 dark:text-gray-400 ${
                      isActive
                        ? 'text-gray-500 dark:text-gray-400'
                        : isCompleted
                          ? 'text-green-500'
                          : isDisabled
                            ? 'text-gray-400'
                            : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Progresso Geral */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Progresso
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                initial={{ width: 0 }}
                animate={{

                  width: `${(currentStep / steps.length) * 100}%`

                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {currentStep}/{steps.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
