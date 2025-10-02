import type { ContributionData, YearContributionData } from '../types'

function getContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 8) return 3
  return 4
}

function getDatesInYear(year: number): string[] {
  const dates: string[] = []
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31)
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

function groupIntoWeeks(dailyData: Map<string, number>, year: number) {
  const weeks: { contributionDays: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] }[] = []
  const startDate = new Date(year, 0, 1)
  
  // Find the start of the first week (Sunday)
  const firstSunday = new Date(startDate)
  firstSunday.setDate(startDate.getDate() - startDate.getDay())
  
  let currentWeekStart = new Date(firstSunday)
  
  while (currentWeekStart.getFullYear() <= year) {
    const week = { contributionDays: [] as { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] }
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(currentWeekStart)
      currentDate.setDate(currentWeekStart.getDate() + i)
      
      const dateStr = currentDate.toISOString().split('T')[0]
      const count = dailyData.get(dateStr) || 0
      
      // Only include dates that are in the target year
      if (currentDate.getFullYear() === year) {
        week.contributionDays.push({
          date: dateStr,
          count,
          level: getContributionLevel(count)
        })
      }
    }
    
    if (week.contributionDays.length > 0) {
      weeks.push(week)
    }
    
    currentWeekStart.setDate(currentWeekStart.getDate() + 7)
    
    // Stop if we've gone past the year
    if (currentWeekStart.getFullYear() > year && currentWeekStart.getMonth() > 0) {
      break
    }
  }
  
  return weeks
}

export async function fetchGitHubContributions(
  username: string, 
  years: number[], 
  onProgress?: (progress: number) => void
): Promise<ContributionData> {
  if (!username) {
    throw new Error('Username is required')
  }

  if (!years.length) {
    throw new Error('At least one year must be selected')
  }

  const token = sessionStorage.getItem('github_token')

  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {}

  const sortedYears = [...years].sort()
  onProgress?.(20)

  try {
    // Fetch recent events to get some contribution data
    // Note: This is limited but works without authentication
    // We'll fetch contributions for the most recent year (or the first in sortedYears)
    // GitHub's API only allows one year at a time via from/to arguments
    // Fetch contribution data for each selected year
    const eventsByYear: Record<number, any> = {}

    for (const year of sortedYears) {
      const graphqlQuery = {
        query: `
          query($userName:String!, $from:DateTime!, $to:DateTime!) { 
            user(login: $userName){
              contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      contributionCount
                      date
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { 
          userName: username,
          from: `${year}-01-01T00:00:00Z`,
          to: `${year}-12-31T23:59:59Z`
        }
      }

      const eventsResponse = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(graphqlQuery)
      })

      if (!eventsResponse.ok) {
        throw new Error(`Failed to fetch user contributions for year ${year}: ${eventsResponse.status}`)
      }

      eventsByYear[year] = await eventsResponse.json()
      onProgress?.(30 + Math.floor((sortedYears.indexOf(year) / sortedYears.length) * 20))
    }

    // Merge all years' data into a single structure for further processing
    // Use the most recent year for the "calendar" variable as before
    const weeks = []
    let totalContributions = 0
    for (const year of sortedYears) {
        const calendar = eventsByYear[year]?.data?.user?.contributionsCollection?.contributionCalendar
        if (calendar) {
            weeks.push(...calendar.weeks)
            totalContributions += calendar.totalContributions
        }
    }

    onProgress?.(70)

    // Build daily contributions map from the calendar weeks
    const dailyContributions = new Map<string, number>()
    for (const week of weeks) {
      for (const day of week.contributionDays) {
        dailyContributions.set(day.date, day.contributionCount)
      }
    }

    // Fill in all dates for the requested years with 0 if missing
    for (const year of sortedYears) {
      const yearDates = getDatesInYear(year)
      yearDates.forEach(date => {
        if (!dailyContributions.has(date)) {
          dailyContributions.set(date, 0)
        }
      })
    }

    onProgress?.(90)

    // Organize data by year, sort years descending (most recent first)
    const sortedYearsDesc = [...sortedYears].sort((a, b) => b - a)
    const yearData: YearContributionData[] = sortedYearsDesc.map(year => {
      const yearWeeks = groupIntoWeeks(dailyContributions, year)
      const yearContributions = Array.from(dailyContributions.entries())
        .filter(([date]) => date.startsWith(year.toString()))
        .reduce((sum, [, count]) => sum + count, 0)
      
      return {
        year,
        totalContributions: yearContributions,
        weeks: yearWeeks.length,
        contributionCalendar: yearWeeks
      }
    })

    const contributionData: ContributionData = {
      username,
      totalContributions,
      years: sortedYearsDesc,
      yearData
    }

    onProgress?.(100)
    return contributionData

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch GitHub contributions')
  }
}