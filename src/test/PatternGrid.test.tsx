import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { PatternGrid, YARN_COLORS, generatePatternGrid } from '../components/PatternGrid';
import type { ContributionData, PatternConfig } from '../types';

const mockContributionData: ContributionData = {
  username: 'testuser',
  totalContributions: 100,
  years: [2024],
  yearData: [
    {
      year: 2024,
      totalContributions: 100,
      weeks: 53,
      contributionCalendar: Array.from({ length: 53 }, (_, weekIndex) => ({
        contributionDays: Array.from({ length: 7 }, (_, dayIndex) => {
          const date = new Date(2024, 0, 1);
          date.setDate(date.getDate() + weekIndex * 7 + dayIndex);
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

const mockConfig: PatternConfig = {
  borderStyle: 'light',
  squareSize: 2,
  years: [2024],
};

const renderPatternGrid = (data: ContributionData, config: PatternConfig) => {
  return render(
    <Theme>
      <PatternGrid data={data} config={config} />
    </Theme>
  );
};

describe('PatternGrid', () => {
  describe('Component Rendering', () => {
    it('renders the pattern grid component', () => {
      renderPatternGrid(mockContributionData, mockConfig);
      
      expect(screen.getByText(/Yarn Colors/i)).toBeInTheDocument();
    });

    it('renders color legend', () => {
      renderPatternGrid(mockContributionData, mockConfig);
      
      expect(screen.getByText('Cream')).toBeInTheDocument();
      expect(screen.getByText('Light Green')).toBeInTheDocument();
      expect(screen.getByText('Medium Green')).toBeInTheDocument();
      expect(screen.getByText('Dark Green')).toBeInTheDocument();
      expect(screen.getByText('Forest Green')).toBeInTheDocument();
      expect(screen.getByText('Border')).toBeInTheDocument();
    });

    it('renders years information', () => {
      renderPatternGrid(mockContributionData, mockConfig);
      
      expect(screen.getByText(/Years: 2024/i)).toBeInTheDocument();
    });

    it('renders pattern size information', () => {
      renderPatternGrid(mockContributionData, mockConfig);
      
      expect(screen.getByText(/Pattern size:/i)).toBeInTheDocument();
      expect(screen.getByText(/Each year:/i)).toBeInTheDocument();
      expect(screen.getByText(/Border:/i)).toBeInTheDocument();
    });

    it('renders estimated finished size', () => {
      renderPatternGrid(mockContributionData, mockConfig);
      
      expect(screen.getByText(/Estimated finished size:/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Years', () => {
    it('renders multiple years stacked', () => {
      const multiYearData: ContributionData = {
        ...mockContributionData,
        years: [2024, 2023],
        yearData: [
          mockContributionData.yearData[0],
          { ...mockContributionData.yearData[0], year: 2023 },
        ],
      };

      renderPatternGrid(multiYearData, { ...mockConfig, years: [2024, 2023] });
      
      expect(screen.getByText(/Years: 2024, 2023/i)).toBeInTheDocument();
    });
  });

  describe('Theme Variants', () => {
    it('renders with light theme colors', () => {
      renderPatternGrid(mockContributionData, mockConfig);
      
      expect(screen.getByText('Cream')).toBeInTheDocument();
    });

    it('renders with dark theme colors', () => {
      const darkConfig: PatternConfig = { ...mockConfig, borderStyle: 'dark' };
      renderPatternGrid(mockContributionData, darkConfig);
      
      expect(screen.getByText('Charcoal')).toBeInTheDocument();
    });

    it('renders with spooky theme colors', () => {
      const spookyConfig: PatternConfig = { ...mockConfig, borderStyle: 'spooky' };
      renderPatternGrid(mockContributionData, spookyConfig);
      
      expect(screen.getByText('Light Orange')).toBeInTheDocument();
    });
  });
});

describe('YARN_COLORS', () => {
  it('returns light theme colors', () => {
    const colors = YARN_COLORS('light');
    
    expect(colors[0].name).toBe('Cream');
    expect(colors[1].name).toBe('Light Green');
    expect(colors[2].name).toBe('Medium Green');
    expect(colors[3].name).toBe('Dark Green');
    expect(colors[4].name).toBe('Forest Green');
    expect(colors[5].name).toBe('Border');
  });

  it('returns dark theme colors', () => {
    const colors = YARN_COLORS('dark');
    
    expect(colors[0].name).toBe('Charcoal');
    expect(colors[1].name).toBe('Light Green');
    expect(colors[5].name).toBe('Border');
  });

  it('returns spooky theme colors', () => {
    const colors = YARN_COLORS('spooky');
    
    expect(colors[0].name).toBe('Charcoal');
    expect(colors[1].name).toBe('Light Orange');
    expect(colors[2].name).toBe('Medium Orange');
    expect(colors[3].name).toBe('Dark Orange');
    expect(colors[4].name).toBe('Burnt Orange');
  });

  it('returns default colors for unknown theme', () => {
    const colors = YARN_COLORS('unknown');
    
    expect(colors[0].name).toBe('Cream');
    expect(colors[1].name).toBe('Light Green');
  });

  it('includes hex colors for all themes', () => {
    const lightColors = YARN_COLORS('light');
    const darkColors = YARN_COLORS('dark');
    const spookyColors = YARN_COLORS('spooky');

    Object.values(lightColors).forEach((color) => {
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
    });

    Object.values(darkColors).forEach((color) => {
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
    });

    Object.values(spookyColors).forEach((color) => {
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('includes description for all color levels', () => {
    const colors = YARN_COLORS('light');
    
    expect(colors[0].description).toContain('no commits');
    expect(colors[1].description).toContain('1-3 commits');
    expect(colors[2].description).toContain('4-6 commits');
    expect(colors[3].description).toContain('7-9 commits');
    expect(colors[4].description).toContain('10+ commits');
    expect(colors[5].description).toContain('Border');
  });

  it('includes indicators for all color levels', () => {
    const colors = YARN_COLORS('light');
    
    expect(colors[0].indicator).toBe('0');
    expect(colors[1].indicator).toBe('1');
    expect(colors[2].indicator).toBe('2');
    expect(colors[3].indicator).toBe('3');
    expect(colors[4].indicator).toBe('4');
    expect(colors[5].indicator).toBe('B');
  });
});

describe('generatePatternGrid', () => {
  const colors = YARN_COLORS('light');
  const yearData = mockContributionData.yearData[0];

  it('generates grid with correct dimensions', () => {
    const result = generatePatternGrid(yearData, colors);
    
    expect(result.gridCols).toBe(110);
    expect(result.gridRows).toBe(18);
    expect(result.squares.length).toBe(110 * 18);
  });

  it('includes total contributions', () => {
    const result = generatePatternGrid(yearData, colors);
    
    expect(result.totalContributions).toBe(yearData.totalContributions);
  });

  it('creates squares with border color', () => {
    const result = generatePatternGrid(yearData, colors);
    
    // Check that border squares exist
    const borderSquares = result.squares.filter((sq) => sq.isBorder);
    expect(borderSquares.length).toBeGreaterThan(0);
  });

  it('creates squares with contribution data', () => {
    const result = generatePatternGrid(yearData, colors);
    
    // Check that non-border squares exist
    const dataSquares = result.squares.filter((sq) => !sq.isBorder);
    expect(dataSquares.length).toBeGreaterThan(0);
  });

  it('assigns correct color levels to squares', () => {
    const result = generatePatternGrid(yearData, colors);
    
    // Check that squares have various color levels
    const dataSquares = result.squares.filter((sq) => !sq.isBorder);
    const levels = new Set(dataSquares.map((sq) => sq.level));
    expect(levels.size).toBeGreaterThan(1);
  });

  it('includes date and count information for data squares', () => {
    const result = generatePatternGrid(yearData, colors);
    
    const dataSquares = result.squares.filter((sq) => !sq.isBorder);
    expect(dataSquares.length).toBeGreaterThan(0);
    
    dataSquares.forEach((square) => {
      if (square.date) {
        expect(square.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof square.count).toBe('number');
      }
    });
  });
});
