import { useMemo } from 'react'
import type { ContributionData, PatternConfig } from '../types'

interface PatternGridProps {
  data: ContributionData
  config: PatternConfig
}

export const YARN_COLORS = (mode: string) => {
    switch(mode) {
        case 'light':
            return {
                0: { name: 'Cream', hex: '#f8f9fa', bg: 'bg-neutral-50', border: 'border-neutral-200', description: 'Background color for days with no commits' },
                1: { name: 'Light Green', hex: '#c6e48b', bg: 'bg-green-100', border: 'border-green-200', description: '1-3 commits' },
                2: { name: 'Medium Green', hex: '#7bc96f', bg: 'bg-green-300', border: 'border-green-400', description: '4-6 commits' },
                3: { name: 'Dark Green', hex: '#239a3b', bg: 'bg-green-500', border: 'border-green-600', description: '7-9 commits' },
                4: { name: 'Forest Green', hex: '#196127', bg: 'bg-green-700', border: 'border-green-800', description: '10+ commits' },
                5: { name: 'Border', hex: '#e7e5e4', bg: 'bg-neutral-200', border: 'border-neutral-400', description: 'Border color' }
            }
        case 'dark':
            return {
                0: { name: 'Charcoal', hex: '#78716c', bg: 'bg-stone-500', border: 'border-stone-700', description: 'Background color for days with no commits' },
                1: { name: 'Light Green', hex: '#c6e48b', bg: 'bg-green-100', border: 'border-green-200', description: '1-3 commits' },
                2: { name: 'Medium Green', hex: '#7bc96f', bg: 'bg-green-300', border: 'border-green-400', description: '4-6 commits' },
                3: { name: 'Dark Green', hex: '#239a3b', bg: 'bg-green-500', border: 'border-green-600', description: '7-9 commits' },
                4: { name: 'Forest Green', hex: '#196127', bg: 'bg-green-700', border: 'border-green-800', description: '10+ commits' },
                5: { name: 'Border', hex: '#292524', bg: 'bg-stone-800', border: 'border-stone-950', description: 'Border color' }
            }
        case 'spooky':
            return {
                0: { name: 'Charcoal', hex: '#78716c', bg: 'bg-stone-500', border: 'border-stone-700', description: 'Background color for days with no commits' },
                1: { name: 'Light Orange', hex: '#c6e48b', bg: 'bg-orange-300', border: 'border-orange-400', description: '1-3 commits' },
                2: { name: 'Medium Orange', hex: '#7bc96f', bg: 'bg-orange-400', border: 'border-orange-500', description: '4-6 commits' },
                3: { name: 'Dark Orange', hex: '#239a3b', bg: 'bg-orange-500', border: 'border-orange-600', description: '7-9 commits' },
                4: { name: 'Burnt Orange', hex: '#196127', bg: 'bg-orange-600', border: 'border-orange-700', description: '10+ commits' },
                5: { name: 'Border', hex: '#292524', bg: 'bg-stone-800', border: 'border-stone-950', description: 'Border color' }
            }
        default:
            return {
                0: { name: 'Cream', hex: '#f8f9fa', bg: 'bg-neutral-50', border: 'border-neutral-200', description: 'Background color for days with no commits' },
                1: { name: 'Light Green', hex: '#c6e48b', bg: 'bg-green-100', border: 'border-green-200', description: '1-3 commits' },
                2: { name: 'Medium Green', hex: '#7bc96f', bg: 'bg-green-300', border: 'border-green-400', description: '4-6 commits' },
                3: { name: 'Dark Green', hex: '#239a3b', bg: 'bg-green-500', border: 'border-green-600', description: '7-9 commits' },
                4: { name: 'Forest Green', hex: '#196127', bg: 'bg-green-700', border: 'border-green-800', description: '10+ commits' },
                5: { name: 'Border', hex: '#e7e5e4', bg: 'bg-neutral-200', border: 'border-neutral-400', description: 'Border color' }
            }
    }
}

export function PatternGrid({ data, config }: PatternGridProps) {
  const colors = YARN_COLORS(config.borderStyle)
  const patterns = useMemo(() => {
    return data.yearData.map(yearData => {
      type GridSquare = {
        color: typeof colors[0]
        date: string
        count: number
        level: number
        isBorder: boolean
      }
      
      const grid: Array<Array<GridSquare>> = []
      
      // Initialize a 18x110 grid (14 rows, 106 columns + 2 rows/columns for borders)
      const PATTERN_HEIGHT = 18 // 14 squares tall + 4 for top and bottom border
      const PATTERN_WIDTH = 110 // 106 squares wide + 4 for left and right borders
      const BORDER_WIDTH = 2 // 2 squares wide borders
      
      for (let row = 0; row < PATTERN_HEIGHT; row++) {
        grid[row] = []
        for (let col = 0; col < PATTERN_WIDTH; col++) {
          grid[row][col] = {
            color: colors[5], // Default to border color
            date: '',
            count: 0,
            level: 0,
            isBorder: true
          }
        }
      }
      
      // Fill the grid with contribution data
      // Each week gets a 2-column wide strip (18 squares tall × 2 squares wide)
      console.log({length: yearData.contributionCalendar.length})
      
      for (let weekIndex = 2; weekIndex < 55; weekIndex++) {
        if (weekIndex > PATTERN_WIDTH) break // Stop if we exceed the pattern width
        if (weekIndex >= BORDER_WIDTH && weekIndex <= (PATTERN_WIDTH - BORDER_WIDTH - 1)) {
            const week = yearData.contributionCalendar[weekIndex - 2];
            for (let dayIndex = 1; dayIndex < week.contributionDays.length + 1 && dayIndex < 8; dayIndex++) {
                const day = week.contributionDays[dayIndex - 1]
                
                // Each day occupies 2 rows (dayIndex * 2 and dayIndex * 2 + 1)
                const startRow = dayIndex * 2
                const endRow = startRow + 1
                
                // Each week occupies 2 columns (weekIndex * 2 and weekIndex * 2 + 1)
                const startCol = (weekIndex - 1) * 2
                const endCol = startCol + 1
                
                // Fill the 2x2 area for this day
                for (let row = startRow; row <= endRow && row < PATTERN_HEIGHT; row++) {
                  for (let col = startCol; col <= endCol && col < PATTERN_WIDTH; col++) {
                    grid[row][col] = {
                      color: colors[day.level],
                      date: day.date,
                      count: day.count,
                      level: day.level,
                      isBorder: false
                    }
                  }
                }
              }
        }
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

  const maxWidth = 110 // Fixed width for all patterns
  const patternHeight = 18 // Fixed height for each year

  return (
    <div className="space-y-4">
      {/* Color Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
        <h4 className="w-full text-sm font-medium mb-2">Yarn Colors (by commit frequency):</h4>
        {Object.entries(YARN_COLORS(config.borderStyle)).map(([level, color]) => (
          <div key={level} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border ${color.bg} ${color.border}`} />
            <span className="text-xs">{color.name}</span>
          </div>
        ))}
      </div>

      {/* Stacked Year Patterns */}
      <div className="overflow-auto bg-white p-4 rounded-lg border">
        <div className="inline-block space-y-2">
          
          {patterns.map((pattern) => (
            <div key={pattern.year}>
              <div className="flex">
                
                {/* Pattern grid */}
                <div 
                  className="grid gap-px"
                  style={{ 
                    gridTemplateColumns: `repeat(110, 8px)`,
                    gridTemplateRows: `repeat(18, 8px)`
                  }}
                >
                  {pattern.squares.map((square, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 border ${square.color.bg} ${square.color.border}`}
                      title={square.isBorder ? 'border' : `${square.date}: ${square.count} commits`}
                    />
                  ))}
                </div>
                
              </div>
              
            </div>
          ))}

        </div>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>Years: {data.years.join(', ')} (stacked newest to oldest)</p>
        <p>Pattern size: {maxWidth + 4} × {patterns.length * patternHeight + (patterns.length + 1) * 2} squares</p>
        <p>Each year: {maxWidth} × {patternHeight} squares (53 weeks × 2 squares wide, 7 days × 2 squares tall, 2 x 2 border squares)</p>
        <p>Border: 2 squares wide on all sides and between years</p>
        <p>Estimated finished size: ~{Math.round(maxWidth)}″ × {Math.round(patternHeight)}″ (with size H hook)</p>
      </div>
    </div>
  )
}