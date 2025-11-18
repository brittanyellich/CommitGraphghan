import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FAQ from '../components/FAQ';

describe('FAQ', () => {
  it('renders the FAQ component', () => {
    render(<FAQ />);
    
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });

  it('renders all FAQ questions', () => {
    render(<FAQ />);
    
    expect(screen.getByText('How do I use this app?')).toBeInTheDocument();
    expect(screen.getByText("What's a graphghan?")).toBeInTheDocument();
    expect(screen.getByText('Is my GitHub data stored?')).toBeInTheDocument();
    expect(screen.getByText('Where can I report bugs or request features?')).toBeInTheDocument();
  });

  it('renders all FAQ answers', () => {
    render(<FAQ />);
    
    expect(screen.getByText(/Connect your GitHub account/i)).toBeInTheDocument();
    expect(screen.getByText(/A graphghan is another way of describing/i)).toBeInTheDocument();
    expect(screen.getByText(/This website doesn't store any data/i)).toBeInTheDocument();
  });

  it('renders external link to C2C crochet tutorial', () => {
    render(<FAQ />);
    
    const link = screen.getByRole('link', { name: /learn more about the basics of a C2C pattern here!/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://www.craftematics.com/crochet/corner-to-corner');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders external link to GitHub repository', () => {
    render(<FAQ />);
    
    const link = screen.getByRole('link', { name: /GitHub repository/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://github.com/brittanyellich/commitgraphghan');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has proper structure with heading and list', () => {
    const { container } = render(<FAQ />);
    
    expect(container.querySelector('h1')).toBeInTheDocument();
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('applies max-width container styling', () => {
    const { container } = render(<FAQ />);
    
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('max-w-2xl', 'mx-auto');
  });
});
