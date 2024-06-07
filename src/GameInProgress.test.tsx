import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameInProgress from './GameInProgress';
import { getUserId } from './models/GameState'; // Import the function to be mocked

jest.mock('./models/GameState', () => ({
  getUserId: jest.fn(),
}));

describe('GameInProgress', () => {
  const defaultProps = {
    currentPlayer: 1,
    rolling: false,
    diceValues: [1, 2, 3],
    players: [
      { uid: '1', name: 'Player 1', score: 10 },
      { uid: '2', name: 'Player 2', score: 20 },
    ],
    onRollDice: jest.fn(),
  };

  beforeEach(() => {
    (getUserId as jest.Mock).mockReturnValue('1'); // Mock the return value of getUserId
  });

  it('renders the current player\'s turn', () => {
    render(<GameInProgress {...defaultProps} />);
    expect(screen.getByText("Player 1's Turn")).toBeInTheDocument();
  });

  it('renders the roll dice button and handles click', () => {
    render(<GameInProgress {...defaultProps} rolling={false} />);
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
    const scoreElements = screen.getAllByText(/Score:/);
    expect(scoreElements).toHaveLength(defaultProps.players.length);
    scoreElements.forEach((element, index) => {
      expect(element).toHaveTextContent(`Player ${index + 1} Score: ${defaultProps.players[index].score}`);
    });
  });
});
