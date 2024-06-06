import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders create game button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Create Game/i);

  expect(buttonElement).toBeInTheDocument();
});
