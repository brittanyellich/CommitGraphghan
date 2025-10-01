export interface ContributionDay {
    date: string
    count: number
    level: 0 | 1 | 2 | 3 | 4
  }
  
  export interface ContributionWeek {
    contributionDays: ContributionDay[]
  }
  
  export interface YearContributionData {
    year: number
    totalContributions: number
    weeks: number
    contributionCalendar: ContributionWeek[]
  }
  
  export interface ContributionData {
    username: string
    totalContributions: number
    yearData: YearContributionData[]
    years: number[]
  }
  
  export interface PatternConfig {
    borderStyle: 'light' | 'dark'
    squareSize: number
    years: number[]
  }
  
  export interface YarnColor {
    name: string
    hex: string
    level: number
    description: string
  }