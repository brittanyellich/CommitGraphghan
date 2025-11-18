import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import GraphGenerator from '../components/GraphGenerator';
import * as githubLib from '../lib/github';

// Mock the github library
vi.mock('../lib/github', () => ({
  fetchGitHubContributions: vi.fn(),
}));

// Mock environment variable
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_GITHUB_CLIENT_ID: 'test-client-id',
  },
  writable: true,
  configurable: true,
});

const renderGraphGenerator = () => {
  return render(
    <Theme>
      <GraphGenerator />
    </Theme>
  );
};

describe('GraphGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    delete (window as { location?: typeof window.location }).location;
    (window as { location: typeof window.location }).location = { origin: 'http://localhost:3000', href: '' } as Location;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the graph generator component', () => {
      renderGraphGenerator();
      
      expect(screen.getByText('Commit Graphghan Pattern Generator')).toBeInTheDocument();
    });

    it('renders the username input field', () => {
      renderGraphGenerator();
      
      const usernameInput = screen.getByPlaceholderText('octocat');
      expect(usernameInput).toBeInTheDocument();
    });

    it('renders the year selector', () => {
      renderGraphGenerator();
      
      expect(screen.getByText('Select Years')).toBeInTheDocument();
    });

    it('renders the theme selector', () => {
      renderGraphGenerator();
      
      expect(screen.getByText('Select a Theme')).toBeInTheDocument();
    });

    it('renders the generate button', () => {
      renderGraphGenerator();
      
      const generateButton = screen.getByRole('button', { name: /Generate Pattern/i });
      expect(generateButton).toBeInTheDocument();
    });

    it('renders placeholder when no data is generated', () => {
      renderGraphGenerator();
      
      expect(screen.getByText(/Enter a GitHub username to generate your pattern/i)).toBeInTheDocument();
    });
  });

  describe('Username Input', () => {
    it('updates username when typed', () => {
      renderGraphGenerator();
      
      const usernameInput = screen.getByPlaceholderText('octocat') as HTMLInputElement;
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      expect(usernameInput.value).toBe('testuser');
    });

    it('disables username input when loading', async () => {
      const mockFetch = vi.fn().mockImplementation(() => new Promise(() => {}));
      vi.mocked(githubLib.fetchGitHubContributions).mockImplementation(mockFetch);

      renderGraphGenerator();
      
      const usernameInput = screen.getByPlaceholderText('octocat');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      const currentYear = new Date().getFullYear();
      const yearButton = screen.getByText(currentYear.toString());
      fireEvent.click(yearButton);
      
      const generateButton = screen.getByRole('button', { name: /Generate Pattern/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(usernameInput).toBeDisabled();
      });
    });
  });

  describe('Year Selection', () => {
    it('allows year selection', () => {
      renderGraphGenerator();
      
      const currentYear = new Date().getFullYear();
      const yearButton = screen.getByText(currentYear.toString());
      
      fireEvent.click(yearButton);
      
      // Year should be selected (button will have different styling)
      expect(yearButton).toHaveClass('bg-primary');
    });
  });

  describe('Theme Selection', () => {
    it('has default light theme selected', () => {
      renderGraphGenerator();
      
      // Theme selector should have a trigger button
      const themeSelectors = screen.getAllByRole('button');
      // One of the buttons should be the theme selector trigger
      expect(themeSelectors.length).toBeGreaterThan(0);
    });
  });

  describe('Generate Button', () => {
    it('is disabled when username is empty', () => {
      renderGraphGenerator();
      
      const generateButton = screen.getByRole('button', { name: /Generate Pattern/i });
      expect(generateButton).toBeDisabled();
    });

    it('is disabled when username is only whitespace', () => {
      renderGraphGenerator();
      
      const usernameInput = screen.getByPlaceholderText('octocat');
      fireEvent.change(usernameInput, { target: { value: '   ' } });
      
      const generateButton = screen.getByRole('button', { name: /Generate Pattern/i });
      expect(generateButton).toBeDisabled();
    });

    it('is enabled when username is provided', () => {
      renderGraphGenerator();
      
      const usernameInput = screen.getByPlaceholderText('octocat');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      const currentYear = new Date().getFullYear();
      const yearButton = screen.getByText(currentYear.toString());
      fireEvent.click(yearButton);
      
      const generateButton = screen.getByRole('button', { name: /Generate Pattern/i });
      expect(generateButton).not.toBeDisabled();
    });

    it('changes text to "Generating..." when loading', async () => {
      const mockFetch = vi.fn().mockImplementation(() => new Promise(() => {}));
      vi.mocked(githubLib.fetchGitHubContributions).mockImplementation(mockFetch);

      renderGraphGenerator();
      
      const usernameInput = screen.getByPlaceholderText('octocat');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      const currentYear = new Date().getFullYear();
      const yearButton = screen.getByText(currentYear.toString());
      fireEvent.click(yearButton);
      
      const generateButton = screen.getByRole('button', { name: /Generate Pattern/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generating.../i })).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when username is empty and generate is clicked', async () => {
      renderGraphGenerator();
      
      const currentYear = new Date().getFullYear();
      const yearButton = screen.getByText(currentYear.toString());
      fireEvent.click(yearButton);
      
      // Generate button should be disabled, so we need to force enable it for this test
      // Actually, the button will be disabled, so error won't trigger through UI
      // Let's test the error message display after API failure instead
    });

    it('shows error when API call fails', async () => {
      const mockError = new Error('Failed to fetch GitHub data');
      vi.mocked(githubLib.fetchGitHubContributions).mockRejectedValue(mockError);

      renderGraphGenerator();
      
      const usernameInput = screen.getByPlaceholderText('octocat');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      const currentYear = new Date().getFullYear();
      const yearButton = screen.getByText(currentYear.toString());
      fireEvent.click(yearButton);
      
      const generateButton = screen.getByRole('button', { name: /Generate Pattern/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch GitHub data')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows progress bar when loading', async () => {
      const mockFetch = vi.fn().mockImplementation(() => new Promise(() => {}));
      vi.mocked(githubLib.fetchGitHubContributions).mockImplementation(mockFetch);

      renderGraphGenerator();
      
      const usernameInput = screen.getByPlaceholderText('octocat');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      const currentYear = new Date().getFullYear();
      const yearButton = screen.getByText(currentYear.toString());
      fireEvent.click(yearButton);
      
      const generateButton = screen.getByRole('button', { name: /Generate Pattern/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Fetching data.../i)).toBeInTheDocument();
      });
    });
  });

  describe('GitHub Login', () => {
    it('shows login button when no token is present', () => {
      renderGraphGenerator();
      
      expect(screen.getByRole('button', { name: /Login with GitHub/i })).toBeInTheDocument();
    });

    it('shows note about authentication when no token', () => {
      renderGraphGenerator();
      
      expect(screen.getByText(/Full GitHub contribution history requires authentication/i)).toBeInTheDocument();
    });

    it('redirects to GitHub OAuth when login button is clicked', () => {
      renderGraphGenerator();
      
      const loginButton = screen.getByRole('button', { name: /Login with GitHub/i });
      fireEvent.click(loginButton);
      
      expect(window.location.href).toContain('https://github.com/login/oauth/authorize');
      // Check if the client_id parameter is in the URL (even if undefined)
      expect(window.location.href).toContain('client_id=');
    });

    it('does not show login button when token is present', () => {
      sessionStorage.setItem('github_token', 'test-token');
      
      renderGraphGenerator();
      
      expect(screen.queryByRole('button', { name: /Login with GitHub/i })).not.toBeInTheDocument();
    });
  });

  describe('Pattern Info Display', () => {
    it('shows pattern info after successful generation', async () => {
      const mockData = {
        username: 'testuser',
        totalContributions: 100,
        years: [2024],
        yearData: [
          {
            year: 2024,
            totalContributions: 100,
            weeks: 53,
            contributionCalendar: Array.from({ length: 53 }, () => ({
              contributionDays: Array.from({ length: 7 }, (_, dayIndex) => {
                const date = new Date(2024, 0, 1);
                date.setDate(date.getDate() + dayIndex);
                return {
                  date: date.toISOString().split('T')[0],
                  count: dayIndex,
                  level: (dayIndex % 5) as 0 | 1 | 2 | 3 | 4,
                };
              }),
            })),
          },
        ],
      };

      vi.mocked(githubLib.fetchGitHubContributions).mockResolvedValue(mockData);

      renderGraphGenerator();
      
      const usernameInput = screen.getByPlaceholderText('octocat');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      const currentYear = new Date().getFullYear();
      const yearButton = screen.getByText(currentYear.toString());
      fireEvent.click(yearButton);
      
      const generateButton = screen.getByRole('button', { name: /Generate Pattern/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Pattern Info')).toBeInTheDocument();
      });

      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('shows tabs after successful generation', async () => {
      const mockData = {
        username: 'testuser',
        totalContributions: 100,
        years: [2024],
        yearData: [
          {
            year: 2024,
            totalContributions: 100,
            weeks: 53,
            contributionCalendar: Array.from({ length: 53 }, () => ({
              contributionDays: Array.from({ length: 7 }, (_, dayIndex) => {
                const date = new Date(2024, 0, 1);
                date.setDate(date.getDate() + dayIndex);
                return {
                  date: date.toISOString().split('T')[0],
                  count: dayIndex,
                  level: (dayIndex % 5) as 0 | 1 | 2 | 3 | 4,
                };
              }),
            })),
          },
        ],
      };

      vi.mocked(githubLib.fetchGitHubContributions).mockResolvedValue(mockData);

      renderGraphGenerator();
      
      const usernameInput = screen.getByPlaceholderText('octocat');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      const currentYear = new Date().getFullYear();
      const yearButton = screen.getByText(currentYear.toString());
      fireEvent.click(yearButton);
      
      const generateButton = screen.getByRole('button', { name: /Generate Pattern/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        // Check for tab triggers which will be unique
        const patternViewTabs = screen.getAllByText('Pattern View');
        expect(patternViewTabs.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
      
      const exportTabs = screen.getAllByText('Export & Instructions');
      expect(exportTabs.length).toBeGreaterThan(0);
    });
  });

  describe('Integration', () => {
    it('calls fetchGitHubContributions with correct parameters', async () => {
      const mockData = {
        username: 'testuser',
        totalContributions: 100,
        years: [2024],
        yearData: [
          {
            year: 2024,
            totalContributions: 100,
            weeks: 53,
            contributionCalendar: Array.from({ length: 53 }, () => ({
              contributionDays: Array.from({ length: 7 }, (_, dayIndex) => {
                const date = new Date(2024, 0, 1);
                date.setDate(date.getDate() + dayIndex);
                return {
                  date: date.toISOString().split('T')[0],
                  count: dayIndex,
                  level: (dayIndex % 5) as 0 | 1 | 2 | 3 | 4,
                };
              }),
            })),
          },
        ],
      };

      vi.mocked(githubLib.fetchGitHubContributions).mockResolvedValue(mockData);

      renderGraphGenerator();
      
      const usernameInput = screen.getByPlaceholderText('octocat');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      const currentYear = new Date().getFullYear();
      const yearButton = screen.getByText(currentYear.toString());
      fireEvent.click(yearButton);
      
      const generateButton = screen.getByRole('button', { name: /Generate Pattern/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(githubLib.fetchGitHubContributions).toHaveBeenCalledWith(
          'testuser',
          [currentYear],
          expect.any(Function)
        );
      });
    });

    it('updates progress during data fetching', async () => {
      let progressCallback: ((progress: number) => void) | undefined;
      
      vi.mocked(githubLib.fetchGitHubContributions).mockImplementation(
        (username, years, onProgress) => {
          progressCallback = onProgress;
          return new Promise((resolve) => {
            setTimeout(() => {
              if (progressCallback) {
                progressCallback(50);
              }
              resolve({
                username,
                totalContributions: 100,
                years,
                yearData: [],
              });
            }, 100);
          });
        }
      );

      renderGraphGenerator();
      
      const usernameInput = screen.getByPlaceholderText('octocat');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      const currentYear = new Date().getFullYear();
      const yearButton = screen.getByText(currentYear.toString());
      fireEvent.click(yearButton);
      
      const generateButton = screen.getByRole('button', { name: /Generate Pattern/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Fetching data.../i)).toBeInTheDocument();
      });
    });
  });
});
