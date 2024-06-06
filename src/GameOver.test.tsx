import React from 'react';
import { render, screen } from '@testing-library/react';
import GameOver from './GameOver';

describe('GameOver Component', () => {
  it('renders the correct message for player 1', () => {
    render(<GameOver currentPlayer={1} />);
    expect(screen.getByText('Game Over! Player 1 wins!')).toBeInTheDocument();
  });

  it('renders the correct message for player 2', () => {
    render(<GameOver currentPlayer={2} />);
    expect(screen.getByText('Game Over! Player 2 wins!')).toBeInTheDocument();
  });
});
