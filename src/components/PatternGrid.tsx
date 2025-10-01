import { useMemo } from 'react'
import type { ContributionData, PatternConfig } from '../types'

interface PatternGridProps {
  data: ContributionData
  config: PatternConfig
}

const YARN_COLORS = {
  0: { name: 'Cream', hex: '#f8f9fa', bg: 'bg-neutral-50', border: 'border-neutral-200' },
  1: { name: 'Light Green', hex: '#c6e48b', bg: 'bg-green-100', border: 'border-green-200' },
  2: { name: 'Medium Green', hex: '#7bc96f', bg: 'bg-green-300', border: 'border-green-400' },
  3: { name: 'Dark Green', hex: '#239a3b', bg: 'bg-green-500', border: 'border-green-600' },
  4: { name: 'Forest Green', hex: '#196127', bg: 'bg-green-700', border: 'border-green-800' }
}

export function PatternGrid({ data, config }: PatternGridProps) {
  const patterns = useMemo(() => {
    return data.yearData.map(yearData => {
      type GridSquare = {
        color: typeof YARN_COLORS[0]
        date: string
        count: number
        level: number
      }
      
      const grid: Array<Array<GridSquare>> = []
      
      // Initialize a 14x106 grid (14 rows, 106 columns)
      const PATTERN_HEIGHT = 14
      const PATTERN_WIDTH = 106
      
      for (let row = 0; row < PATTERN_HEIGHT; row++) {
        grid[row] = []
        for (let col = 0; col < PATTERN_WIDTH; col++) {
          grid[row][col] = {
            color: YARN_COLORS[0], // Default to cream
            date: '',
            count: 0,
            level: 0
          }
        }
      }
      
      // Fill the grid with contribution data
      // Each week gets a 2-column wide strip (14 squares tall × 2 squares wide)
      let weekColumn = 0
      
      for (const week of yearData.contributionCalendar) {
        if (weekColumn >= PATTERN_WIDTH / 2) break // Don't exceed pattern width
        
        // Each week has 7 days, each day gets 2x2 squares
        for (let dayIndex = 0; dayIndex < week.contributionDays.length && dayIndex < 7; dayIndex++) {
          const day = week.contributionDays[dayIndex]
          const color = YARN_COLORS[day.level]
          
          // Each day occupies 2 rows (dayIndex * 2 and dayIndex * 2 + 1)
          const startRow = dayIndex * 2
          const endRow = startRow + 1
          
          // Each week occupies 2 columns (weekColumn * 2 and weekColumn * 2 + 1)
          const startCol = weekColumn * 2
          const endCol = startCol + 1
          
          // Fill the 2x2 area for this day
          for (let row = startRow; row <= endRow && row < PATTERN_HEIGHT; row++) {
            for (let col = startCol; col <= endCol && col < PATTERN_WIDTH; col++) {
              grid[row][col] = {
                color,
                date: day.date,
                count: day.count,
                level: day.level
              }
            }
          }
        }
        
        weekColumn++
      }
      
      // Flatten the grid to a 1D array for rendering
      const squares: GridSquare[] = []
      for (let row = 0; row < PATTERN_HEIGHT; row++) {
        for (let col = 0; col < PATTERN_WIDTH; col++) {
          squares.push(grid[row][col])
        }
      }
      
      return {
        year: yearData.year,
        squares,
        gridCols: PATTERN_WIDTH,
        gridRows: PATTERN_HEIGHT,
        totalContributions: yearData.totalContributions
      }
    })
  }, [data, config])

  const maxWidth = 106 // Fixed width for all patterns
  const patternHeight = 14 // Fixed height for each year
  const borderColor = config.borderStyle === 'light' ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'

  return (
    <div className="space-y-4">
      {/* Color Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
        <h4 className="w-full text-sm font-medium mb-2">Yarn Colors (by commit frequency):</h4>
        {Object.entries(YARN_COLORS).map(([level, color]) => (
          <div key={level} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border ${color.bg} ${color.border}`} />
            <span className="text-xs">{color.name}</span>
          </div>
        ))}
      </div>

      {/* Stacked Year Patterns */}
      <div className="overflow-auto bg-white p-4 rounded-lg border">
        <div className="inline-block space-y-2">
          {/* Top border - 2 squares wide */}
          <div className={`h-4 ${borderColor} border mb-2`} style={{ width: `${(106 + 8) * 8}px` }} />
          
          {patterns.map((pattern, yearIndex) => (
            <div key={pattern.year} className="space-y-2">
              <div className="flex">
                {/* Left border - 2 squares wide */}
                <div className={`w-4 ${borderColor} border mr-2`} style={{ height: `${14 * 8}px` }} />
                
                {/* Pattern grid */}
                <div 
                  className="grid gap-px"
                  style={{ 
                    gridTemplateColumns: `repeat(106, 8px)`,
                    gridTemplateRows: `repeat(14, 8px)`
                  }}
                >
                  {pattern.squares.map((square, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 border ${square.color.bg} ${square.color.border}`}
                      title={`${square.date}: ${square.count} commits`}
                    />
                  ))}
                </div>
                
                {/* Right border - 2 squares wide */}
                <div className={`w-4 ${borderColor} border ml-2`} style={{ height: `${14 * 8}px` }} />
              </div>
              
              {/* Border between years (except for last year) - 2 squares wide */}
              {yearIndex < patterns.length - 1 && (
                <div className={`h-4 ${borderColor} border`} style={{ width: `${(106 + 8) * 8}px` }} />
              )}
            </div>
          ))}
          
          {/* Bottom border - 2 squares wide */}
          <div className={`h-4 ${borderColor} border mt-2`} style={{ width: `${(106 + 8) * 8}px` }} />
        </div>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>Years: {data.years.join(', ')} (stacked newest to oldest)</p>
        <p>Pattern size: {maxWidth + 4} × {patterns.length * patternHeight + (patterns.length + 1) * 2} squares</p>
        <p>Each year: {maxWidth} × {patternHeight} squares (53 weeks × 2 squares wide, 7 days × 2 squares tall)</p>
        <p>Border: 2 squares wide on all sides and between years</p>
        <p>Estimated finished size: ~{Math.round((maxWidth + 4) * 3)}″ × {Math.round((patterns.length * patternHeight + (patterns.length + 1) * 2) * 3)}″ (with size H hook)</p>
      </div>
    </div>
  )
}