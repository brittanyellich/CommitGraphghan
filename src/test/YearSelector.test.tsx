import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { YearSelector } from '../components/YearSelector';

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
  const currentYear = new Date().getFullYear();

  it('renders with selected years', () => {
    const onYearsChange = vi.fn();
    renderYearSelector({
      selectedYears: [currentYear],
      onYearsChange,
    });

    expect(screen.getByText('Select Years')).toBeInTheDocument();
    expect(screen.getByText(currentYear.toString())).toBeInTheDocument();
  });

  it('renders 10 year buttons', () => {
    const onYearsChange = vi.fn();
    renderYearSelector({
      selectedYears: [currentYear],
      onYearsChange,
    });

    // Check that 10 years are rendered (current year - 9 to current year)
    for (let i = 0; i < 10; i++) {
      const year = currentYear - i;
      expect(screen.getByText(year.toString())).toBeInTheDocument();
    }
  });

  it('calls onYearsChange when adding a year', () => {
    const onYearsChange = vi.fn();
    renderYearSelector({
      selectedYears: [currentYear],
      onYearsChange,
    });

    const previousYear = currentYear - 1;
    const yearButton = screen.getByText(previousYear.toString());
    fireEvent.click(yearButton);

    expect(onYearsChange).toHaveBeenCalledWith([previousYear, currentYear]);
  });

  it('calls onYearsChange when removing a year', () => {
    const onYearsChange = vi.fn();
    renderYearSelector({
      selectedYears: [currentYear, currentYear - 1],
      onYearsChange,
    });

    const currentYearButton = screen.getByText(currentYear.toString());
    fireEvent.click(currentYearButton);

    expect(onYearsChange).toHaveBeenCalledWith([currentYear - 1]);
  });

  it('does not allow removing the last selected year', () => {
    const onYearsChange = vi.fn();
    renderYearSelector({
      selectedYears: [currentYear],
      onYearsChange,
    });

    const currentYearButton = screen.getByText(currentYear.toString());
    fireEvent.click(currentYearButton);

    // Should not call onYearsChange when trying to remove the last year
    expect(onYearsChange).not.toHaveBeenCalled();
  });

  it('sorts years in ascending order when adding', () => {
    const onYearsChange = vi.fn();
    renderYearSelector({
      selectedYears: [currentYear],
      onYearsChange,
    });

    const olderYear = currentYear - 5;
    const yearButton = screen.getByText(olderYear.toString());
    fireEvent.click(yearButton);

    // Should sort years in ascending order
    expect(onYearsChange).toHaveBeenCalledWith([olderYear, currentYear]);
  });

  it('disables all buttons when disabled prop is true', () => {
    const onYearsChange = vi.fn();
    renderYearSelector({
      selectedYears: [currentYear],
      onYearsChange,
      disabled: true,
    });

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('shows multi-year message when multiple years selected', () => {
    const years = [currentYear - 2, currentYear - 1, currentYear];
    const onYearsChange = vi.fn();
    renderYearSelector({
      selectedYears: years,
      onYearsChange,
    });

    expect(
      screen.getByText(
        `Creating a ${years.length}-year pattern (${years[0]} - ${years[years.length - 1]})`
      )
    ).toBeInTheDocument();
  });

  it('does not show multi-year message when only one year selected', () => {
    const onYearsChange = vi.fn();
    renderYearSelector({
      selectedYears: [currentYear],
      onYearsChange,
    });

    expect(
      screen.queryByText(/Creating a.*-year pattern/)
    ).not.toBeInTheDocument();
  });

  it('renders calendar icon', () => {
    const onYearsChange = vi.fn();
    const { container } = renderYearSelector({
      selectedYears: [currentYear],
      onYearsChange,
    });

    // Check for SVG icon (CalendarIcon)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('applies correct styling for selected years', () => {
    const onYearsChange = vi.fn();
    renderYearSelector({
      selectedYears: [currentYear],
      onYearsChange,
    });

    const selectedButton = screen.getByText(currentYear.toString());
    expect(selectedButton).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('applies correct styling for unselected years', () => {
    const onYearsChange = vi.fn();
    renderYearSelector({
      selectedYears: [currentYear],
      onYearsChange,
    });

    const unselectedButton = screen.getByText((currentYear - 1).toString());
    expect(unselectedButton).toHaveClass('bg-transparent', 'text-foreground');
  });
});
