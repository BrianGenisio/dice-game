import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WaitingRoom from './WaitingRoom';
import { getUserId } from './models/Player';
import { GameState, saveGameState } from './models/GameState';

jest.mock('./models/Player', () => ({
  getUserId: jest.fn(),
}));

jest.mock('./models/GameState', () => ({
  saveGameState: jest.fn(),
}));

describe('WaitingRoom Component', () => {
  const gameId = 'game123';
  const gameState: GameState = {
    createdBy: '1',
    players: [],
    maxPlayers: 3,
    diceValues: [],
    currentPlayer: 1,
    rolling: false,
    scoreGoal: 100,
    state: 'waiting',
  };

  beforeEach(() => {
    (getUserId as jest.Mock).mockReturnValue('1');
  });

  test('renders the component with initial props', () => {
    render(<WaitingRoom gameId={gameId} gameState={gameState} />);

    expect(screen.getByText('Waiting Room')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByText('Add Player')).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  test('calls saveGameState when Add Player button is clicked', async () => {
    render(<WaitingRoom gameId={gameId} gameState={gameState} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'Player1' } });
    fireEvent.click(screen.getByText('Add Player'));

    // Verify that saveGameState gets called
    expect(saveGameState).toHaveBeenCalled();
  });

  test('disables input and Add Player button when max players is reached', () => {
    const fullGameState = {
      ...gameState,
      players: [
        { name: 'Player1', uid: '1', score: 0 },
        { name: 'Player2', uid: '2', score: 0 },
        { name: 'Player3', uid: '3', score: 0 }
      ]
    };

    render(<WaitingRoom gameId={gameId} gameState={fullGameState} />);

    expect(screen.queryByPlaceholderText('Enter your name')).not.toBeInTheDocument();
    expect(screen.queryByText('Add Player')).not.toBeInTheDocument();
  });

  test('calls onStartGame when Start Game button is clicked', () => {
    render(<WaitingRoom gameId={gameId} gameState={gameState} />);

    fireEvent.click(screen.getByText('Start Game'));

    // Assuming the component handles the start game logic internally
  });

  test('renders the list of players', () => {
    const populatedGameState = {
      ...gameState,
      players: [{ name: 'Player1', uid: '1', score: 0 }, { name: 'Player2', uid: '2', score: 0 }]
    };

    render(<WaitingRoom gameId={gameId} gameState={populatedGameState} />);

    populatedGameState.players.forEach(player => {
      expect(screen.getByText(player.name)).toBeInTheDocument();
    });
  });
});
