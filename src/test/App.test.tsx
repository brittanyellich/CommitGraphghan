import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <Theme>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Theme>
    );
    // Basic smoke test to ensure the app renders
    expect(document.body).toBeTruthy();
  });
});
