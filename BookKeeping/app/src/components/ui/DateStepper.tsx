import { IconChevronLeft, IconChevronRight } from './icons'

interface DateStepperProps {
  value: string
  onChange: (value: string) => void
  onPrev: () => void
  onNext: () => void
  displayLabel?: string
}

export function DateStepper({
  value,
  onChange,
  onPrev,
  onNext,
  displayLabel,
}: DateStepperProps) {
  return (
    <div className="app-card mb-5 flex items-center justify-between gap-2 p-2">
      <button
        type="button"
        onClick={onPrev}
        className="btn-ghost shrink-0"
        aria-label="上一段"
      >
        <IconChevronLeft className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1 text-center">
        {displayLabel ? (
          <p className="truncate text-sm font-semibold text-[var(--color-text)]">
            {displayLabel}
          </p>
        ) : null}
        <input
          type="date"
          value={value}
          onChange={(e) => {
            if (e.target.value) onChange(e.target.value)
          }}
          className="app-input mt-1 border-0 bg-transparent py-1 text-center text-sm shadow-none focus:shadow-none"
          aria-label="选择日期"
        />
      </div>

      <button
        type="button"
        onClick={onNext}
        className="btn-ghost shrink-0"
        aria-label="下一段"
      >
        <IconChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

interface MonthStepperProps {
  label: string
  onPrev: () => void
  onNext: () => void
}

export function MonthStepper({ label, onPrev, onNext }: MonthStepperProps) {
  return (
    <div className="app-card mb-5 flex items-center justify-between gap-2 p-2">
      <button type="button" onClick={onPrev} className="btn-ghost shrink-0" aria-label="上一月">
        <IconChevronLeft className="h-5 w-5" />
      </button>
      <p className="text-base font-semibold tracking-tight">{label}</p>
      <button type="button" onClick={onNext} className="btn-ghost shrink-0" aria-label="下一月">
        <IconChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
