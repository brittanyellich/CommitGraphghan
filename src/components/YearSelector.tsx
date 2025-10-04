import { Button } from '@radix-ui/themes'
import { CalendarIcon } from "@radix-ui/react-icons"

interface YearSelectorProps {
  selectedYears: number[]
  onYearsChange: (years: number[]) => void
  disabled?: boolean
}

export function YearSelector({ selectedYears, onYearsChange, disabled }: YearSelectorProps) {
  const currentYear = new Date().getFullYear()
  const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i)

  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      if (selectedYears.length > 1) {
        onYearsChange(selectedYears.filter(y => y !== year))
      }
    } else {
      onYearsChange([...selectedYears, year].sort((a, b) => a - b))
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Select Years</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {availableYears.map(year => (
          <Button
            key={year}
            onClick={() => toggleYear(year)}
            disabled={disabled}
            className={`h-8 px-3 transition-colors ${
                selectedYears.includes(year)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-foreground hover:bg-muted'
              }`}
            variant={selectedYears.includes(year) ? 'solid' : 'outline'}
          >
            {year}
          </Button>
        ))}
      </div>
      {selectedYears.length > 1 && (
        <p className="text-xs text-muted-foreground">
          Creating a {selectedYears.length}-year pattern ({selectedYears[0]} - {selectedYears[selectedYears.length - 1]})
        </p>
      )}
    </div>
  )
}