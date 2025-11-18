import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { PatternExport } from '../components/PatternExport';
import type { ContributionData, PatternConfig } from '../types';

const mockContributionData: ContributionData = {
  username: 'testuser',
  totalContributions: 250,
  years: [2024],
  yearData: [
    {
      year: 2024,
      totalContributions: 250,
      weeks: 53,
      contributionCalendar: Array.from({ length: 53 }, (_, weekIndex) => ({
        contributionDays: Array.from({ length: 7 }, (_, dayIndex) => {
          const date = new Date(2024, 0, 1);
          date.setDate(date.getDate() + weekIndex * 7 + dayIndex);
          return {
            date: date.toISOString().split('T')[0],
            count: dayIndex * 2,
            level: (dayIndex % 5) as 0 | 1 | 2 | 3 | 4,
          };
        }),
      })),
    },
  ],
};

const mockConfig: PatternConfig = {
  borderStyle: 'light',
  squareSize: 2,
  years: [2024],
};

const renderPatternExport = (data: ContributionData, config: PatternConfig) => {
  return render(
    <Theme>
      <PatternExport data={data} config={config} />
    </Theme>
  );
};

describe('PatternExport', () => {
  describe('Component Rendering', () => {
    it('renders the pattern export component', () => {
      renderPatternExport(mockContributionData, mockConfig);
      
      expect(screen.getByText('Pattern Instructions')).toBeInTheDocument();
    });

    it('renders pattern details section', () => {
      renderPatternExport(mockContributionData, mockConfig);
      
      expect(screen.getByText('Pattern Details')).toBeInTheDocument();
      expect(screen.getByText(/Size:/i)).toBeInTheDocument();
      expect(screen.getByText(/Finished:/i)).toBeInTheDocument();
      expect(screen.getByText(/Years:/i)).toBeInTheDocument();
      expect(screen.getByText(/Total commits:/i)).toBeInTheDocument();
      expect(screen.getByText(/Border:/i)).toBeInTheDocument();
    });

    it('displays correct total contributions', () => {
      renderPatternExport(mockContributionData, mockConfig);
      
      expect(screen.getByText(/Total commits: 250/i)).toBeInTheDocument();
    });

    it('displays correct years', () => {
      renderPatternExport(mockContributionData, mockConfig);
      
      expect(screen.getByText(/Years: 2024/i)).toBeInTheDocument();
    });

    it('displays correct border style', () => {
      renderPatternExport(mockContributionData, mockConfig);
      
      expect(screen.getByText(/Border: light style/i)).toBeInTheDocument();
    });

    it('renders materials section', () => {
      renderPatternExport(mockContributionData, mockConfig);
      
      expect(screen.getByText('Materials')).toBeInTheDocument();
      expect(screen.getByText(/Worsted weight yarn/i)).toBeInTheDocument();
      expect(screen.getByText(/Size H\/8/i)).toBeInTheDocument();
      expect(screen.getByText(/Yarn needle/i)).toBeInTheDocument();
      expect(screen.getByText(/Scissors/i)).toBeInTheDocument();
    });

    it('renders yarn color guide', () => {
      renderPatternExport(mockContributionData, mockConfig);
      
      expect(screen.getByText('Yarn Color Guide')).toBeInTheDocument();
      expect(screen.getByText('Cream')).toBeInTheDocument();
      expect(screen.getByText('Light Green')).toBeInTheDocument();
      expect(screen.getByText('Border')).toBeInTheDocument();
    });

    it('renders next steps section', () => {
      renderPatternExport(mockContributionData, mockConfig);
      
      expect(screen.getByText('Next Steps')).toBeInTheDocument();
      expect(screen.getByText(/Download the complete pattern instructions/i)).toBeInTheDocument();
      expect(screen.getByText(/Gather your materials/i)).toBeInTheDocument();
    });

    it('renders download button', () => {
      renderPatternExport(mockContributionData, mockConfig);
      
      const downloadButton = screen.getByRole('button', { name: /Download Complete Pattern/i });
      expect(downloadButton).toBeInTheDocument();
    });
  });

  describe('Multiple Years', () => {
    it('displays multiple years correctly', () => {
      const multiYearData: ContributionData = {
        ...mockContributionData,
        years: [2024, 2023],
        totalContributions: 500,
        yearData: [
          mockContributionData.yearData[0],
          { ...mockContributionData.yearData[0], year: 2023, totalContributions: 250 },
        ],
      };
      const multiYearConfig: PatternConfig = {
        ...mockConfig,
        years: [2024, 2023],
      };

      renderPatternExport(multiYearData, multiYearConfig);
      
      expect(screen.getByText(/Years: 2024, 2023/i)).toBeInTheDocument();
      expect(screen.getByText(/Total commits: 500/i)).toBeInTheDocument();
    });
  });

  describe('Theme Variants', () => {
    it('renders with dark theme', () => {
      const darkConfig: PatternConfig = { ...mockConfig, borderStyle: 'dark' };
      renderPatternExport(mockContributionData, darkConfig);
      
      expect(screen.getByText(/Border: dark style/i)).toBeInTheDocument();
      expect(screen.getByText('Charcoal')).toBeInTheDocument();
    });

    it('renders with spooky theme', () => {
      const spookyConfig: PatternConfig = { ...mockConfig, borderStyle: 'spooky' };
      renderPatternExport(mockContributionData, spookyConfig);
      
      expect(screen.getByText(/Border: spooky style/i)).toBeInTheDocument();
      expect(screen.getByText('Light Orange')).toBeInTheDocument();
    });
  });

  describe('Download Functionality', () => {
    it('downloads pattern when button is clicked', () => {
      // Mock DOM methods
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
      
      // Mock anchor click
      const clickSpy = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'a') {
          element.click = clickSpy;
        }
        return element;
      });

      renderPatternExport(mockContributionData, mockConfig);
      
      const downloadButton = screen.getByRole('button', { name: /Download Complete Pattern/i });
      fireEvent.click(downloadButton);

      // Verify the download process
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

      // Clean up
      createElementSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('generates correct filename for download', () => {
      let capturedAnchor: HTMLAnchorElement | null = null;
      const originalCreateElement = document.createElement.bind(document);
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'a') {
          capturedAnchor = element as HTMLAnchorElement;
          element.click = vi.fn();
        }
        return element;
      });

      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      renderPatternExport(mockContributionData, mockConfig);
      
      const downloadButton = screen.getByRole('button', { name: /Download Complete Pattern/i });
      fireEvent.click(downloadButton);

      expect(capturedAnchor?.download).toBe('testuser-github-graphghan-2024.txt');

      // Clean up
      createElementSpy.mockRestore();
    });
  });

  describe('Pattern Details Display', () => {
    it('shows color swatches for each yarn color', () => {
      renderPatternExport(mockContributionData, mockConfig);
      
      // Check for yarn color names in the color guide
      expect(screen.getByText('Cream')).toBeInTheDocument();
      expect(screen.getByText('Light Green')).toBeInTheDocument();
      expect(screen.getByText('Medium Green')).toBeInTheDocument();
      expect(screen.getByText('Dark Green')).toBeInTheDocument();
      expect(screen.getByText('Forest Green')).toBeInTheDocument();
      expect(screen.getByText('Border')).toBeInTheDocument();
    });

    it('displays all yarn colors with descriptions', () => {
      renderPatternExport(mockContributionData, mockConfig);
      
      expect(screen.getByText(/Background color for days with no commits/i)).toBeInTheDocument();
      expect(screen.getByText(/1-3 commits/i)).toBeInTheDocument();
      expect(screen.getByText(/4-6 commits/i)).toBeInTheDocument();
      expect(screen.getByText(/7-9 commits/i)).toBeInTheDocument();
      expect(screen.getByText(/10\+ commits/i)).toBeInTheDocument();
    });
  });
});
