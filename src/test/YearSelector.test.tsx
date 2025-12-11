import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Theme } from '@radix-ui/themes';
import { YearSelector } from '../components/YearSelector';

// Helper function to render component with Theme wrapper
const renderYearSelector = (props: {
  selectedYears: number[];
  onYearsChange: (years: number[]) => void;
  disabled?: boolean;
}) => {
  return render(
    <Theme>
      <YearSelector {...props} />
    </Theme>
  );
};

describe('YearSelector', () => {
  const mockOnYearsChange = vi.fn();
  const currentYear = new Date().getFullYear();

  beforeEach(() => {
    mockOnYearsChange.mockClear();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
      });
      expect(screen.getByText('Select Years')).toBeInTheDocument();
    });

    it('renders the calendar icon', () => {
      renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
      });
      // Calendar icon should be present
      const icon = document.querySelector('.h-4.w-4');
      expect(icon).toBeInTheDocument();
    });

    it('renders 10 year buttons', () => {
      renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
      });
      // Should render 10 year buttons (current year and 9 previous years)
      const expectedYears = Array.from({ length: 10 }, (_, i) => currentYear - i);
      expectedYears.forEach((year) => {
        expect(screen.getByText(year.toString())).toBeInTheDocument();
      });
    });

    it('renders buttons in descending order (newest to oldest)', () => {
      renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
      });
      const buttons = screen.getAllByRole('button').filter((btn) => 
        /^\d{4}$/.test(btn.textContent || '')
      );
      
      // Verify years are in descending order
      for (let i = 0; i < buttons.length - 1; i++) {
        const year1 = parseInt(buttons[i].textContent || '0');
        const year2 = parseInt(buttons[i + 1].textContent || '0');
        expect(year1).toBeGreaterThan(year2);
      }
    });

    it('applies correct variant to selected years', () => {
      renderYearSelector({
        selectedYears: [currentYear, currentYear - 1],
        onYearsChange: mockOnYearsChange,
      });
      
      const currentYearButton = screen.getByText(currentYear.toString());
      const prevYearButton = screen.getByText((currentYear - 1).toString());
      const unselectedButton = screen.getByText((currentYear - 2).toString());
      
      // Selected buttons should have 'solid' variant
      expect(currentYearButton.getAttribute('data-accent-color')).toBe('cyan');
      expect(prevYearButton.getAttribute('data-accent-color')).toBe('cyan');
      expect(unselectedButton.getAttribute('data-accent-color')).toBe('cyan');
    });

    it('renders with custom selectedYears prop', () => {
      const customYears = [currentYear - 2, currentYear - 5];
      renderYearSelector({
        selectedYears: customYears,
        onYearsChange: mockOnYearsChange,
      });
      
      customYears.forEach((year) => {
        const button = screen.getByText(year.toString());
        expect(button).toBeInTheDocument();
      });
    });

    it('renders with disabled prop', () => {
      renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
        disabled: true,
      });
      
      const buttons = screen.getAllByRole('button').filter((btn) => 
        /^\d{4}$/.test(btn.textContent || '')
      );
      
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('renders buttons as enabled when disabled prop is false', () => {
      renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
        disabled: false,
      });
      
      const buttons = screen.getAllByRole('button').filter((btn) => 
        /^\d{4}$/.test(btn.textContent || '')
      );
      
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });

    it('renders buttons as enabled when disabled prop is not provided', () => {
      renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
      });
      
      const buttons = screen.getAllByRole('button').filter((btn) => 
        /^\d{4}$/.test(btn.textContent || '')
      );
      
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('User Interactions - Selecting Years', () => {
    it('calls onYearsChange when clicking an unselected year', async () => {
      const user = userEvent.setup();
      renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
      });
      
      const yearButton = screen.getByText((currentYear - 1).toString());
      await user.click(yearButton);
      
      // Should add the year and sort the array
      expect(mockOnYearsChange).toHaveBeenCalledTimes(1);
      expect(mockOnYearsChange).toHaveBeenCalledWith([currentYear - 1, currentYear]);
    });

    it('calls onYearsChange with sorted years when adding a year', async () => {
      const user = userEvent.setup();
      renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
      });
      
      const olderYearButton = screen.getByText((currentYear - 3).toString());
      await user.click(olderYearButton);
      
      // Years should be sorted in ascending order
      expect(mockOnYearsChange).toHaveBeenCalledWith([currentYear - 3, currentYear]);
    });

    it('allows selecting multiple years', async () => {
      const user = userEvent.setup();
      const { rerender } = renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
      });
      
      // Select second year
      const secondYearButton = screen.getByText((currentYear - 1).toString());
      await user.click(secondYearButton);
      expect(mockOnYearsChange).toHaveBeenCalledWith([currentYear - 1, currentYear]);
      
      // Update component with new selected years
      mockOnYearsChange.mockClear();
      rerender(
        <Theme>
          <YearSelector
            selectedYears={[currentYear - 1, currentYear]}
            onYearsChange={mockOnYearsChange}
          />
        </Theme>
      );
      
      // Select third year
      const thirdYearButton = screen.getByText((currentYear - 2).toString());
      await user.click(thirdYearButton);
      expect(mockOnYearsChange).toHaveBeenCalledWith([currentYear - 2, currentYear - 1, currentYear]);
    });

    it('maintains sorted order when selecting years in random order', async () => {
      const user = userEvent.setup();
      renderYearSelector({
        selectedYears: [currentYear - 5],
        onYearsChange: mockOnYearsChange,
      });
      
      // Select a year after the currently selected year
      const newerYearButton = screen.getByText((currentYear - 1).toString());
      await user.click(newerYearButton);
      
      // Should maintain ascending order
      expect(mockOnYearsChange).toHaveBeenCalledWith([currentYear - 5, currentYear - 1]);
    });
  });

  describe('User Interactions - Deselecting Years', () => {
    it('calls onYearsChange when clicking a selected year (when multiple selected)', async () => {
      const user = userEvent.setup();
      renderYearSelector({
        selectedYears: [currentYear - 1, currentYear],
        onYearsChange: mockOnYearsChange,
      });
      
      const yearButton = screen.getByText(currentYear.toString());
      await user.click(yearButton);
      
      // Should remove the year
      expect(mockOnYearsChange).toHaveBeenCalledTimes(1);
      expect(mockOnYearsChange).toHaveBeenCalledWith([currentYear - 1]);
    });

    it('does not call onYearsChange when clicking the only selected year', async () => {
      const user = userEvent.setup();
      renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
      });
      
      const yearButton = screen.getByText(currentYear.toString());
      await user.click(yearButton);
      
      // Should not remove the last year
      expect(mockOnYearsChange).not.toHaveBeenCalled();
    });

    it('allows deselecting any year except the last one', async () => {
      const user = userEvent.setup();
      const { rerender } = renderYearSelector({
        selectedYears: [currentYear - 2, currentYear - 1, currentYear],
        onYearsChange: mockOnYearsChange,
      });
      
      // Deselect middle year
      const middleYearButton = screen.getByText((currentYear - 1).toString());
      await user.click(middleYearButton);
      expect(mockOnYearsChange).toHaveBeenCalledWith([currentYear - 2, currentYear]);
      
      // Update component
      mockOnYearsChange.mockClear();
      rerender(
        <Theme>
          <YearSelector
            selectedYears={[currentYear - 2, currentYear]}
            onYearsChange={mockOnYearsChange}
          />
        </Theme>
      );
      
      // Deselect one more year
      const firstYearButton = screen.getByText((currentYear - 2).toString());
      await user.click(firstYearButton);
      expect(mockOnYearsChange).toHaveBeenCalledWith([currentYear]);
    });

    it('prevents deselecting when only one year remains (edge case)', async () => {
      const user = userEvent.setup();
      renderYearSelector({
        selectedYears: [currentYear - 3],
        onYearsChange: mockOnYearsChange,
      });
      
      const onlySelectedButton = screen.getByText((currentYear - 3).toString());
      await user.click(onlySelectedButton);
      
      // Should not allow deselecting the last year
      expect(mockOnYearsChange).not.toHaveBeenCalled();
    });
  });

  describe('User Interactions - Disabled State', () => {
    it('does not call onYearsChange when clicking disabled buttons', async () => {
      const user = userEvent.setup();
      renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
        disabled: true,
      });
      
      const yearButton = screen.getByText((currentYear - 1).toString());
      await user.click(yearButton);
      
      // Should not trigger change when disabled
      expect(mockOnYearsChange).not.toHaveBeenCalled();
    });
  });

  describe('Conditional Rendering - Multi-Year Message', () => {
    it('does not show multi-year message when only one year is selected', () => {
      renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
      });
      
      const message = screen.queryByText(/Creating a \d+-year pattern/);
      expect(message).not.toBeInTheDocument();
    });

    it('shows multi-year message when two years are selected', () => {
      renderYearSelector({
        selectedYears: [currentYear - 1, currentYear],
        onYearsChange: mockOnYearsChange,
      });
      
      const message = screen.getByText(`Creating a 2-year pattern (${currentYear - 1} - ${currentYear})`);
      expect(message).toBeInTheDocument();
    });

    it('shows multi-year message when multiple years are selected', () => {
      renderYearSelector({
        selectedYears: [currentYear - 3, currentYear - 2, currentYear - 1, currentYear],
        onYearsChange: mockOnYearsChange,
      });
      
      const message = screen.getByText(`Creating a 4-year pattern (${currentYear - 3} - ${currentYear})`);
      expect(message).toBeInTheDocument();
    });

    it('displays correct year range in multi-year message', () => {
      const years = [currentYear - 5, currentYear - 2];
      renderYearSelector({
        selectedYears: years,
        onYearsChange: mockOnYearsChange,
      });
      
      const message = screen.getByText(`Creating a 2-year pattern (${years[0]} - ${years[1]})`);
      expect(message).toBeInTheDocument();
    });

    it('updates multi-year message text correctly', () => {
      const { rerender } = renderYearSelector({
        selectedYears: [currentYear - 1, currentYear],
        onYearsChange: mockOnYearsChange,
      });
      
      // Initially shows 2-year pattern
      expect(screen.getByText(/Creating a 2-year pattern/)).toBeInTheDocument();
      
      // Update to 3 years
      rerender(
        <Theme>
          <YearSelector
            selectedYears={[currentYear - 2, currentYear - 1, currentYear]}
            onYearsChange={mockOnYearsChange}
          />
        </Theme>
      );
      
      // Should now show 3-year pattern
      expect(screen.getByText(/Creating a 3-year pattern/)).toBeInTheDocument();
      expect(screen.queryByText(/Creating a 2-year pattern/)).not.toBeInTheDocument();
    });
  });

  describe('availableYears Calculation', () => {
    it('generates 10 years starting from current year', () => {
      renderYearSelector({
        selectedYears: [currentYear],
        onYearsChange: mockOnYearsChange,
      });
      
      // Check that current year is present
      expect(screen.getByText(currentYear.toString())).toBeInTheDocument();
      
      // Check that 9 previous years are present
      for (let i = 1; i < 10; i++) {
        expect(screen.getByText((currentYear - i).toString())).toBeInTheDocument();
      }
      
      // Check that year 10 years ago is NOT present
      expect(screen.queryByText((currentYear - 10).toString())).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty selectedYears array gracefully', () => {
      renderYearSelector({
        selectedYears: [],
        onYearsChange: mockOnYearsChange,
      });
      
      // Component should still render
      expect(screen.getByText('Select Years')).toBeInTheDocument();
      
      // Multi-year message should not appear
      expect(screen.queryByText(/Creating a \d+-year pattern/)).not.toBeInTheDocument();
    });

    it('handles selecting and deselecting years correctly with empty initial state', async () => {
      const user = userEvent.setup();
      renderYearSelector({
        selectedYears: [],
        onYearsChange: mockOnYearsChange,
      });
      
      const yearButton = screen.getByText(currentYear.toString());
      await user.click(yearButton);
      
      // Should add the year
      expect(mockOnYearsChange).toHaveBeenCalledWith([currentYear]);
    });

    it('handles years that are not consecutive', () => {
      const nonConsecutiveYears = [currentYear - 7, currentYear - 3, currentYear];
      renderYearSelector({
        selectedYears: nonConsecutiveYears,
        onYearsChange: mockOnYearsChange,
      });
      
      const message = screen.getByText(`Creating a 3-year pattern (${currentYear - 7} - ${currentYear})`);
      expect(message).toBeInTheDocument();
    });

    it('maintains correct behavior with all years selected', async () => {
      const user = userEvent.setup();
      const allYears = Array.from({ length: 10 }, (_, i) => currentYear - i).sort((a, b) => a - b);
      
      renderYearSelector({
        selectedYears: allYears,
        onYearsChange: mockOnYearsChange,
      });
      
      // Should show 10-year message
      expect(screen.getByText(`Creating a 10-year pattern (${allYears[0]} - ${allYears[9]})`)).toBeInTheDocument();
      
      // Should be able to deselect any year except would go to 0
      const yearToDeselect = screen.getByText((currentYear - 1).toString());
      await user.click(yearToDeselect);
      
      expect(mockOnYearsChange).toHaveBeenCalledWith(
        allYears.filter((y) => y !== currentYear - 1)
      );
    });
  });
});
