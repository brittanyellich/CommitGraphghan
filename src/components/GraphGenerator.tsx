import { useState } from 'react'
import { Button, TextField, Badge, Tabs, Card, Progress, AlertDialog, Select } from '@radix-ui/themes'
import { ExclamationTriangleIcon, GitHubLogoIcon, Pencil2Icon } from "@radix-ui/react-icons"
import { PatternGrid } from './PatternGrid'
import { YearSelector } from './YearSelector'
import { PatternExport } from './PatternExport'
import { fetchGitHubContributions } from '../lib/github'
import type { ContributionData, PatternConfig } from '../types'

function GraphGenerator() {
  const [username, setUsername] = useState('')
  const [selectedYears, setSelectedYears] = useState<number[]>([])
  const [borderStyle, setBorderStyle] = useState<'light' | 'dark'>('light')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contributionData, setContributionData] = useState<ContributionData | null>(null)
  const [progress, setProgress] = useState(0)

  const handleGenerate = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username')
      return
    }

    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      const data = await fetchGitHubContributions(username, selectedYears || [], (p) => setProgress(p))
      setContributionData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const handleGitHubLogin = () => {
    // Get this from env variable
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = window.location.origin + '/callback';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user`;
  };

  const patternConfig: PatternConfig = {
    borderStyle: borderStyle || 'light',
    squareSize: 2, // 2x2 squares for each commit day
    years: selectedYears || []
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Commit Graphghan Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Transform your GitHub commit graph into a beautiful corner-to-corner crochet pattern
          </p>
        </div>

        <div className="grid gap-6 grid-cols-3">
          <div className="col-span-1 space-y-6">
            <Card>
              <div>
                  <h2 className="flex items-center gap-2">
                    <GitHubLogoIcon className="h-5 w-5" />
                    Generate Pattern
                  </h2>
                  
                <p>
                  Enter a GitHub username to create your graphghan pattern. Due to API limitations, recent activity and simulated data will be used for demonstration.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  {/* <Label htmlFor="username">GitHub Username</Label> */}
                  <TextField.Root 
                    placeholder="octocat" 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="font-mono" 
                    disabled={loading}>
                  </TextField.Root>
                </div>

                <YearSelector
                  selectedYears={selectedYears || []}
                  onYearsChange={setSelectedYears}
                  disabled={loading}
                />

                <div className="space-y-2">
                  {/* <Label htmlFor="border-style">Border Style</Label> */}
                  <Select.Root value={borderStyle} onValueChange={(value: 'light' | 'dark') => setBorderStyle(value)}>
                    <Select.Trigger>
                      {/* <Select.Label /> */}
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="light">Light Border</Select.Item>
                      <Select.Item value="dark">Dark Border</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>

                {loading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Fetching data...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                {error && (
                  <AlertDialog.Root>
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertDialog.Description>{error}</AlertDialog.Description>
                  </AlertDialog.Root>
                )}

                <AlertDialog.Root>
                  <GitHubLogoIcon className="h-4 w-4" />
                  <AlertDialog.Description>
                    <strong>Note:</strong> Full GitHub contribution history requires authentication. This demo uses recent public activity and simulated data to show pattern generation.
                  </AlertDialog.Description>
                </AlertDialog.Root>

                <Button 
                  onClick={handleGenerate} 
                  disabled={loading || !username.trim()}
                  className="w-full"
                >
                  {loading ? 'Generating...' : 'Generate Pattern'}
                </Button>

                <Button
                 onClick={handleGitHubLogin}
                 className="w-full"
                >
                  Login with GitHub
                </Button>
              </div>
            </Card>

            {contributionData && (
              <Card>
                <div>
                  <h2 className="flex items-center gap-2">
                    <Pencil2Icon className="h-5 w-5" />
                    Pattern Info
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Username:</span>
                    <Badge variant="outline" className="font-mono">{contributionData.username}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Years:</span>
                    <Badge variant="outline">{(selectedYears || []).join(', ')}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Size:</span>
                    <Badge variant="outline">
                      {106 + 4} x {(selectedYears || []).length * 14 + ((selectedYears || []).length + 1) * 2} squares
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total commits:</span>
                    <Badge variant="outline">{contributionData.totalContributions}</Badge>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="col-span-2">
            {contributionData ? (
              <Tabs.Root defaultValue="pattern" className="space-y-4">
                <Tabs.List className="grid w-full grid-cols-2">
                  <Tabs.Trigger value="pattern">Pattern View</Tabs.Trigger>
                  <Tabs.Trigger value="export">Export & Instructions</Tabs.Trigger>
                </Tabs.List>
                
                <Tabs.Content value="pattern">
                  <Card>
                    <div>
                      <h2>Crochet Pattern Preview</h2>
                      <p>
                        Each 2×2 square represents one day. Darker squares indicate more commits. Years are stacked with the most recent at the top. Each year is 106 squares wide × 14 squares tall.
                      </p>
                    </div>
                    <div>
                      <PatternGrid 
                        data={contributionData} 
                        config={patternConfig}
                      />
                    </div>
                  </Card>
                </Tabs.Content>

                <Tabs.Content value="export">
                  <PatternExport 
                    data={contributionData}
                    config={patternConfig}
                  />
                </Tabs.Content>
              </Tabs.Root>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <GitHubLogoIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Enter a GitHub username to generate your pattern
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GraphGenerator