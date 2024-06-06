import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameInProgress from './GameInProgress';

describe('GameInProgress', () => {
  const defaultProps = {
    currentPlayer: 1,
    rolling: false,
    diceValues: [1, 2, 3],
    scores: [10, 20],
    onRollDice: jest.fn(),
  };

  it('renders the current player\'s turn', () => {
    render(<GameInProgress {...defaultProps} />);
    expect(screen.getByText("Player 1's Turn")).toBeInTheDocument();
  });

  it('renders the roll dice button and handles click', () => {
    render(<GameInProgress {...defaultProps} />);
    const button = screen.getByText('Roll Dice');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(defaultProps.onRollDice).toHaveBeenCalled();
  });

  it('disables the roll dice button when rolling', () => {
    render(<GameInProgress {...defaultProps} rolling={true} />);
    const button = screen.getByText('Roll Dice');
    expect(button).toBeDisabled();
  });

  it('renders the dice values', () => {
    render(<GameInProgress {...defaultProps} />);
    const diceElements = screen.getAllByTestId('dice');
    expect(diceElements).toHaveLength(defaultProps.diceValues.length);
    // Additional checks can be added here to verify the structure of each dice if needed
  });

  it('renders the player scores', () => {
    render(<GameInProgress {...defaultProps} />);
    defaultProps.scores.forEach((score, index) => {
      expect(screen.getByText(`Player ${index + 1} Score: ${score}`)).toBeInTheDocument();
    });
  });
});
