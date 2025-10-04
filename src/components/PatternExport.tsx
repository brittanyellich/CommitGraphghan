import { Button, Card } from '@radix-ui/themes'
import { DownloadIcon, FileIcon } from "@radix-ui/react-icons"
import type { ContributionData, PatternConfig } from '../types'
import { YARN_COLORS, generatePatternGrid } from './PatternGrid'

interface PatternExportProps {
  data: ContributionData
  config: PatternConfig
}


export function PatternExport({ data, config }: PatternExportProps) {
  const PATTERN_WIDTH = 106 // Fixed width for all years
  const PATTERN_HEIGHT = 14 // Fixed height per year
  const BORDER_WIDTH = 2 // 2 squares wide borders
  const totalPatternHeight = data.yearData.length * PATTERN_HEIGHT + (data.yearData.length - 1) * BORDER_WIDTH
  const totalHeight = totalPatternHeight + (BORDER_WIDTH * 2) // Add top and bottom borders
  const totalWidth = PATTERN_WIDTH + (BORDER_WIDTH * 2) // Add left and right borders
  const totalSquares = data.yearData.length * (PATTERN_WIDTH * PATTERN_HEIGHT)
  const borderSquares = (totalWidth * BORDER_WIDTH * 2) + (totalPatternHeight * BORDER_WIDTH * 2) + ((data.yearData.length - 1) * BORDER_WIDTH * totalWidth)
  const colors = YARN_COLORS(config.borderStyle)

  // Generate a printable grid for all years (stacked)
  const getPrintableGrid = () => {
    return data.yearData.map((yearData) => {
      const pattern = generatePatternGrid(yearData, colors)
      let gridStr = ""
      for (let row = 0; row < pattern.gridRows; row++) {
        let rowStr = ''
        for (let col = 0; col < pattern.gridCols; col++) {
          const idx = row * pattern.gridCols + col
          const square = pattern.squares[idx]
          // Find the color key by matching the color name
          let colorKey = Object.entries(colors).find(([, v]) => v.name === square.color.name)?.[0]
          let colorKeyNum = colorKey !== undefined ? Number(colorKey) : 5 // fallback to border
          // Use indicator from the color object, using string key
          rowStr += colors[colorKeyNum as keyof typeof colors].indicator || '?'
        }
        gridStr += rowStr + '\n'
      }
      return gridStr
    }).join('')
  }

  const generateInstructions = () => {
    const borderYarn =
      config.borderStyle === 'light'
        ? 'Cream'
        : config.borderStyle === 'spooky'
        ? 'Pumpkin Orange'
        : 'Forest Green'

    const borderMode =
      config.borderStyle === 'light'
        ? 'Light'
        : config.borderStyle === 'spooky'
        ? 'Spooky'
        : 'Dark'

    const instructions = `
# ${data.username}'s GitHub Graphghan Pattern

## Materials Needed
- Worsted weight yarn in 5 colors:
  ${Object.entries(colors).map(([_, color]) => `  • ${color.name} (${color.hex}) - ${color.description}`).join('\n')}
- Size H/8 (5.0mm) crochet hook
- Yarn needle for sewing
- Scissors

## Finished Size
Approximately ${Math.round(totalWidth * 3)}" × ${Math.round(totalHeight * 3)}" (including 2-square wide borders)

## Pattern Notes
- This is a corner-to-corner (C2C) crochet pattern
- Each square in the pattern represents one day from ${data.username}'s GitHub activity
- Years are stacked vertically, newest (${data.years[0]}) at top, oldest (${data.years[data.years.length - 1]}) at bottom
- Pattern covers: ${config.years.join(', ')}
- Total commits represented: ${data.totalContributions}
- All borders are 2 squares wide

## Abbreviations (US terms):
- ch - chain
- dc - double crochet
- slst - slip stitch

## Instructions

### Corner-to-Corner Technique

Follow the pattern starting in the bottom left corner and working diagonally to the top right corner

R1 - ch 6, dc in 4th ch from hook, dc in next 2 ch, turn
R2 - ch6, dc in 4th ch from hook, dc in next 2 ch, slst in top of 3 ch loop in previous row, ch 3, 3dcs in the chain spaces, turn
R3 - ch6, dc in 4th ch from hook, dc in next 2 ch, slst in top of 3 ch loop in previous row, ch 3, 3dcs in the chain spaces, slst in top of 3 ch loop in previous row, ch 3, 3dcs in the chain spaces, turn
Continue in this pattern through increasing rows until you reach the full width of the pattern 
This blanket will not be a perfect square. Once you reach the full width, continue working in the established pattern but skip the final square.
Decreasing rows:
When you begin decreasing, turn and slst into the 3 dcs you just made AND into the top of the ch 3 loop. Ch3, 3dcs into the ch space, slst into the top of ch3 loop.

When switching colors, change on the second half of the last double crochet of the previous square

### Pattern Structure
${data.yearData.map(year =>
`- ${year.year}: ${PATTERN_WIDTH} × ${PATTERN_HEIGHT} squares (${year.totalContributions} commits)`
).join('\n')}

### Color Guide
- Follow the attached grid pattern
- Each cell = 1 C2C square
- Change colors as indicated in the pattern
- Years are separated by 4-square tall ${config.borderStyle} border sections
- Total pattern size: ${totalWidth} × ${totalHeight} squares (including borders)

### Pattern Grid (Printable)
Each symbol represents a yarn color:
${Object.values(colors).map(v => `${v.indicator} = ${v.name}`).join(', ')}

Each cell in the grid below is padded to a fixed width for easier reading. For best results, print this section using a monospace font (such as Courier or Consolas) or view in a code editor.

${getPrintableGrid()}

### Border (${borderMode} Mode)
All borders are 2 squares wide using ${borderYarn} yarn:
- Top border: 2 squares tall
- Bottom border: 2 squares tall  
- Left border: 2 squares wide
- Right border: 2 squares wide
- Between years: 4 squares total (2 squares above and below each year section)

Feel free to add an additional border around the entire blanket, such as:

R1: Join yarn in the middle of an edge, ch 1, sc into same st and each st around, working a cluster of 3 sc at each corner, slst into first sc to finish round.

R2: Ch 2, dc into same st and each st around, working a cluster of 3 dc at each corner, slst into first dc to finish round.

R3: Ch 1, sc into same st and each st around, working a cluster of 3 dc at each corner, slst into first sc to finish round. Bind off.

### Finishing
1. Weave in all ends securely
2. Block if desired for crisp edges
3. Enjoy your personalized commit graph blanket!

## Pattern Statistics
- Total squares: ${totalSquares}
- Border squares: ${borderSquares}
- Years stacked: ${data.yearData.length}
- Years included: ${config.years.join(', ')}
- Created from ${data.username}'s GitHub activity

Generated by Commit Graphghan Generator
    `.trim()

    return instructions
  }

  const downloadPattern = () => {
    const instructions = generateInstructions()
    const blob = new Blob([instructions], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.username}-github-graphghan-${config.years.join('-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <div>
          <h2 className="flex items-center gap-2">
            <FileIcon className="h-5 w-5" />
            Pattern Instructions
          </h2>
          <p>
            Complete instructions for creating your GitHub graphghan
          </p>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Pattern Details</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Size: {totalWidth} × {totalHeight} squares</li>
                <li>Finished: ~{Math.round(totalWidth)}" × {Math.round(totalHeight)}"</li>
                <li>Years: {config.years.join(', ')} (stacked)</li>
                <li>Total commits: {data.totalContributions}</li>
                <li>Border: {config.borderStyle} style</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Materials</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Worsted weight yarn (6 colors)</li>
                <li>Size H/8 (5.0mm) hook</li>
                <li>Yarn needle</li>
                <li>Scissors</li>
              </ul>
            </div>
          </div>

          <br />

          <div>
            <h4 className="font-medium mb-3">Yarn Color Guide</h4>
            <div className="grid gap-2">
              {Object.entries(colors).map(([level, color]) => (
                <div key={level} className="flex items-center gap-3 text-sm">
                  <div 
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="font-medium min-w-[120px]">{color.name}</span>
                  <span className="text-muted-foreground">{color.description}</span>
                </div>
              ))}
            </div>
          </div>

          <br />

          <div>
            <h4 className="font-medium mb-2">Next Steps</h4>
            <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
              <li>Download the complete pattern instructions</li>
              <li>Gather your materials and yarn colors</li>
              <li>Print the pattern for easy reference while crocheting</li>
              <li>Start from the bottom-left corner and work diagonally</li>
              <li>Follow the color chart square by square</li>
            </ol>
          </div>

          <Button onClick={downloadPattern} className="w-full" color="cyan" >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Download Complete Pattern
          </Button>
        </div>
      </Card>
    </div>
  )
}