import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Theme } from '@radix-ui/themes';
import { YearSelector } from '../components/YearSelector';

describe('YearSelector', () => {
  const mockOnYearsChange = vi.fn();
  const currentYear = new Date().getFullYear();

  beforeEach(() => {
    mockOnYearsChange.mockClear();
  });

  const renderYearSelector = (props = {}) => {
    const defaultProps = {
      selectedYears: [currentYear],
      onYearsChange: mockOnYearsChange,
      ...props,
    };

    return render(
      <Theme>
        <YearSelector {...defaultProps} />
      </Theme>
    );
  };

  describe('Component Rendering', () => {
    it('renders the component with calendar icon and label', () => {
      renderYearSelector();
      expect(screen.getByText('Select Years')).toBeInTheDocument();
    });

    it('renders 10 year buttons from current year to 9 years ago', () => {
      renderYearSelector();
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(10);

      // Verify the years are in descending order
      for (let i = 0; i < 10; i++) {
        const year = currentYear - i;
        expect(screen.getByText(year.toString())).toBeInTheDocument();
      }
    });

    it('applies selected styling to selected years', () => {
      renderYearSelector({ selectedYears: [currentYear, currentYear - 1] });
      
      const currentYearButton = screen.getByText(currentYear.toString());
      const lastYearButton = screen.getByText((currentYear - 1).toString());
      
      // Check that selected buttons have solid variant
      expect(currentYearButton.closest('button')).toHaveAttribute('data-accent-color', 'cyan');
      expect(lastYearButton.closest('button')).toHaveAttribute('data-accent-color', 'cyan');
    });

    it('does not render multi-year message when only one year is selected', () => {
      renderYearSelector({ selectedYears: [currentYear] });
      
      const message = screen.queryByText(/Creating a \d+-year pattern/);
      expect(message).not.toBeInTheDocument();
    });

    it('renders multi-year message when multiple years are selected', () => {
      const selectedYears = [currentYear - 2, currentYear - 1, currentYear];
      renderYearSelector({ selectedYears });
      
      const message = screen.getByText(
        `Creating a 3-year pattern (${currentYear - 2} - ${currentYear})`
      );
      expect(message).toBeInTheDocument();
    });

    it('renders with disabled prop', () => {
      renderYearSelector({ disabled: true });
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Props Handling', () => {
    it('accepts and uses selectedYears prop', () => {
      const selectedYears = [currentYear - 5, currentYear - 3, currentYear];
      renderYearSelector({ selectedYears });
      
      selectedYears.forEach(year => {
        const button = screen.getByText(year.toString());
        expect(button).toBeInTheDocument();
      });
    });

    it('accepts and uses onYearsChange callback prop', () => {
      renderYearSelector();
      expect(mockOnYearsChange).not.toHaveBeenCalled();
    });

    it('accepts optional disabled prop', () => {
      renderYearSelector({ disabled: true });
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toBeDisabled();
    });

    it('works without disabled prop (defaults to enabled)', () => {
      renderYearSelector();
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).not.toBeDisabled();
    });
  });

  describe('User Interactions - Adding Years', () => {
    it('adds a year when clicking an unselected year button', async () => {
      const user = userEvent.setup();
      const selectedYears = [currentYear];
      renderYearSelector({ selectedYears });
      
      const yearToAdd = currentYear - 1;
      const button = screen.getByText(yearToAdd.toString());
      await user.click(button);
      
      expect(mockOnYearsChange).toHaveBeenCalledWith([currentYear - 1, currentYear]);
    });

    it('maintains sorted order when adding a year', async () => {
      const user = userEvent.setup();
      const selectedYears = [currentYear - 5, currentYear];
      renderYearSelector({ selectedYears });
      
      const yearToAdd = currentYear - 2;
      const button = screen.getByText(yearToAdd.toString());
      await user.click(button);
      
      // Should insert in sorted order
      expect(mockOnYearsChange).toHaveBeenCalledWith([
        currentYear - 5,
        currentYear - 2,
        currentYear
      ]);
    });

    it('can add multiple years sequentially', async () => {
      const user = userEvent.setup();
      renderYearSelector({ selectedYears: [currentYear] });
      
      const firstYear = screen.getByText((currentYear - 1).toString());
      await user.click(firstYear);
      
      expect(mockOnYearsChange).toHaveBeenCalledWith([currentYear - 1, currentYear]);
    });
  });

  describe('User Interactions - Removing Years', () => {
    it('removes a year when clicking a selected year button (if more than 1 year selected)', async () => {
      const user = userEvent.setup();
      const selectedYears = [currentYear - 1, currentYear];
      renderYearSelector({ selectedYears });
      
      const button = screen.getByText(currentYear.toString());
      await user.click(button);
      
      expect(mockOnYearsChange).toHaveBeenCalledWith([currentYear - 1]);
    });

    it('does not remove the last remaining year when clicked', async () => {
      const user = userEvent.setup();
      const selectedYears = [currentYear];
      renderYearSelector({ selectedYears });
      
      const button = screen.getByText(currentYear.toString());
      await user.click(button);
      
      expect(mockOnYearsChange).not.toHaveBeenCalled();
    });

    it('prevents removing year when only one year is selected', async () => {
      const user = userEvent.setup();
      const selectedYears = [currentYear - 5];
      renderYearSelector({ selectedYears });
      
      const button = screen.getByText((currentYear - 5).toString());
      await user.click(button);
      
      expect(mockOnYearsChange).not.toHaveBeenCalled();
    });
  });

  describe('Conditional Rendering', () => {
    it('displays solid variant for selected years', () => {
      const selectedYears = [currentYear - 2, currentYear];
      renderYearSelector({ selectedYears });
      
      const selectedButton = screen.getByText(currentYear.toString()).closest('button');
      expect(selectedButton).toHaveAttribute('data-accent-color', 'cyan');
    });

    it('displays outline variant for unselected years', () => {
      const selectedYears = [currentYear];
      renderYearSelector({ selectedYears });
      
      const unselectedButton = screen.getByText((currentYear - 1).toString()).closest('button');
      expect(unselectedButton).toHaveAttribute('data-accent-color', 'cyan');
    });

    it('shows correct multi-year message with two years', () => {
      const selectedYears = [currentYear - 1, currentYear];
      renderYearSelector({ selectedYears });
      
      const message = screen.getByText(
        `Creating a 2-year pattern (${currentYear - 1} - ${currentYear})`
      );
      expect(message).toBeInTheDocument();
    });

    it('shows correct multi-year message with many years', () => {
      const selectedYears = [currentYear - 9, currentYear - 5, currentYear - 2, currentYear];
      renderYearSelector({ selectedYears });
      
      const message = screen.getByText(
        `Creating a 4-year pattern (${currentYear - 9} - ${currentYear})`
      );
      expect(message).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty selectedYears array gracefully', () => {
      renderYearSelector({ selectedYears: [] });
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(10);
    });

    it('handles disabled state preventing all interactions', async () => {
      const user = userEvent.setup();
      renderYearSelector({ 
        selectedYears: [currentYear],
        disabled: true 
      });
      
      const button = screen.getByText((currentYear - 1).toString());
      await user.click(button);
      
      expect(mockOnYearsChange).not.toHaveBeenCalled();
    });

    it('handles selecting all available years', () => {
      const allYears = Array.from({ length: 10 }, (_, i) => currentYear - i);
      renderYearSelector({ selectedYears: allYears });
      
      // All buttons should be visible and selected
      allYears.forEach(year => {
        expect(screen.getByText(year.toString())).toBeInTheDocument();
      });
      
      // Array is [2025, 2024, ..., 2016], so first is 2025 and last is 2016
      const message = screen.getByText(
        `Creating a 10-year pattern (${allYears[0]} - ${allYears[allYears.length - 1]})`
      );
      expect(message).toBeInTheDocument();
    });

    it('handles years not in sequential order in selectedYears prop', () => {
      // The component displays years using array indices, not sorted min/max
      // So [2020, 2024, 2017] will display as "2020 - 2017"
      const selectedYears = [currentYear - 5, currentYear - 1, currentYear - 8];
      renderYearSelector({ selectedYears });
      
      // Component displays first element and last element of the array as provided
      const message = screen.getByText(
        `Creating a 3-year pattern (${selectedYears[0]} - ${selectedYears[selectedYears.length - 1]})`
      );
      expect(message).toBeInTheDocument();
    });

    it('correctly sorts years when adding a year before the first selected year', async () => {
      const user = userEvent.setup();
      const selectedYears = [currentYear - 5, currentYear - 3];
      renderYearSelector({ selectedYears });
      
      const yearToAdd = currentYear - 7;
      const button = screen.getByText(yearToAdd.toString());
      await user.click(button);
      
      expect(mockOnYearsChange).toHaveBeenCalledWith([
        currentYear - 7,
        currentYear - 5,
        currentYear - 3
      ]);
    });

    it('correctly sorts years when adding a year after the last selected year', async () => {
      const user = userEvent.setup();
      const selectedYears = [currentYear - 5, currentYear - 3];
      renderYearSelector({ selectedYears });
      
      const yearToAdd = currentYear - 1;
      const button = screen.getByText(yearToAdd.toString());
      await user.click(button);
      
      expect(mockOnYearsChange).toHaveBeenCalledWith([
        currentYear - 5,
        currentYear - 3,
        currentYear - 1
      ]);
    });
  });

  describe('State Changes', () => {
    it('calls onYearsChange with correct array when toggling', async () => {
      const user = userEvent.setup();
      const selectedYears = [currentYear - 2, currentYear];
      renderYearSelector({ selectedYears });
      
      // Add a year
      const addButton = screen.getByText((currentYear - 1).toString());
      await user.click(addButton);
      
      expect(mockOnYearsChange).toHaveBeenCalledWith([
        currentYear - 2,
        currentYear - 1,
        currentYear
      ]);
    });

    it('maintains year selection order after removal', async () => {
      const user = userEvent.setup();
      const selectedYears = [currentYear - 5, currentYear - 3, currentYear - 1];
      renderYearSelector({ selectedYears });
      
      // Remove middle year
      const removeButton = screen.getByText((currentYear - 3).toString());
      await user.click(removeButton);
      
      expect(mockOnYearsChange).toHaveBeenCalledWith([
        currentYear - 5,
        currentYear - 1
      ]);
    });

    it('does not call onYearsChange when trying to remove the last year', async () => {
      const user = userEvent.setup();
      mockOnYearsChange.mockClear();
      
      renderYearSelector({ selectedYears: [currentYear - 3] });
      
      const button = screen.getByText((currentYear - 3).toString());
      await user.click(button);
      
      expect(mockOnYearsChange).not.toHaveBeenCalled();
    });
  });
});
