import React from 'react';
import { render, screen } from '@testing-library/react';
import GameOver from './GameOver';
import { Player } from './models/GameState';

const players: Player[] = [
  { uid: '1', name: 'Player 1', score: 100 },
  { uid: '2', name: 'Player 2', score: 50 }
];

describe('GameOver Component', () => {
  it('renders the correct message for player 1', () => {
    render(<GameOver players={players} />);
    expect(screen.getByText(/Game Over! Player 1 wins with 100 points!/i)).toBeInTheDocument();
  });

  it('renders the final scores', () => {
    render(<GameOver players={players} />);
    expect(screen.getByText(/Final Scores:/i)).toBeInTheDocument();
    expect(screen.getByText(/Player 1: 100 points/i)).toBeInTheDocument();
    expect(screen.getByText(/Player 2: 50 points/i)).toBeInTheDocument();
  });
});
