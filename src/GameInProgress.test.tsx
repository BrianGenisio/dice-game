import { render, screen, fireEvent } from '@testing-library/react';
import GameInProgress from './GameInProgress';
import { getUserId } from './models/Player'; // Import the function to be mocked
import { GameState } from './models/GameState';

jest.mock('./models/Player', () => ({
  getUserId: jest.fn(),
}));

describe('GameInProgress', () => {
  const gameState: GameState = {
    currentPlayer: 1,
    rolling: false,
    diceValues: [1, 2, 3],
    players: [
      { uid: '1', name: 'Player 1', score: 10 },
      { uid: '2', name: 'Player 2', score: 20 },
    ],
    scoreGoal: 100,
    maxPlayers: 4,
    state: 'inProgress',
    createdBy: '1',
  };

  beforeEach(() => {
    (getUserId as jest.Mock).mockReturnValue('1'); // Mock the return value of getUserId
  });

  it('renders the current player\'s turn', () => {
    render(<GameInProgress gameId='1' gameState={gameState} />);
    expect(screen.getByText("Player 1's Turn")).toBeInTheDocument();
  });

  it('renders the roll dice button and handles click', () => {
    render(<GameInProgress gameId='1' gameState={{ ...gameState, rolling: false }} />);
    const button = screen.getByText('Roll Dice');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    // Assuming the component has its own way to handle the click event
  });

  it('disables the roll dice button when rolling', () => {
    render(<GameInProgress gameId='1' gameState={{ ...gameState, rolling: true }} />);
    const button = screen.getByText('Roll Dice');
    expect(button).toBeDisabled();
  });

  it('renders the dice values', () => {
    render(<GameInProgress gameId='1' gameState={gameState} />);
    const diceElements = screen.getAllByTestId('dice');
    expect(diceElements).toHaveLength(gameState.diceValues.length);
    // Additional checks can be added here to verify the structure of each dice if needed
  });

  it('renders the player scores', () => {
    render(<GameInProgress gameId='1' gameState={gameState} />);
    const scoreElements = screen.getAllByText(/Score:/);
    expect(scoreElements).toHaveLength(gameState.players.length);
    scoreElements.forEach((element, index) => {
      expect(element).toHaveTextContent(`Player ${index + 1} Score: ${gameState.players[index].score}`);
    });
  });
});
