import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WaitingRoom from './WaitingRoom';
import { getUserId } from './models/GameState';

jest.mock('./models/GameState', () => ({
  getGameDocRef: jest.fn(),
  rollDice: jest.fn(),
  getUserId: jest.fn(),  // Add this line
  isCurrentUserInGame: jest.fn(),
}));

describe('WaitingRoom Component', () => {
  const mockOnAddPlayer = jest.fn();
  const mockOnStartGame = jest.fn();
  const maxPlayers = 3;

  beforeEach(() => {
    mockOnAddPlayer.mockClear();
    mockOnStartGame.mockClear();
    (getUserId as jest.Mock).mockReturnValue('1'); // Mock the return value of getUserId
  });

  test('renders the component with initial props', () => {
    render(<WaitingRoom createdBy='1' players={[]} onAddPlayer={mockOnAddPlayer} onStartGame={mockOnStartGame} maxPlayers={maxPlayers} />);

    expect(screen.getByText('Waiting Room')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByText('Add Player')).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  test('adds a player when Add Player button is clicked', () => {
    render(<WaitingRoom createdBy='1' players={[]} onAddPlayer={mockOnAddPlayer} onStartGame={mockOnStartGame} maxPlayers={maxPlayers} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'Player1' } });
    fireEvent.click(screen.getByText('Add Player'));

    expect(mockOnAddPlayer).toHaveBeenCalledWith('Player1');
    expect(screen.getByPlaceholderText('Enter your name')).toHaveValue('');
  });

  test('disables input and Add Player button when max players is reached', () => {
    const players = [
      { name: 'Player1', uid: '1', score: 0 },
      { name: 'Player2', uid: '2', score: 0 },
      { name: 'Player3', uid: '3', score: 0 }
    ];

    render(<WaitingRoom createdBy='1' players={players} onAddPlayer={mockOnAddPlayer} onStartGame={mockOnStartGame} maxPlayers={maxPlayers} />);

    expect(screen.queryByPlaceholderText('Enter your name')).not.toBeInTheDocument();
    expect(screen.queryByText('Add Player')).not.toBeInTheDocument();
  });

  test('calls onStartGame when Start Game button is clicked', () => {
    render(<WaitingRoom createdBy='1' players={[]} onAddPlayer={mockOnAddPlayer} onStartGame={mockOnStartGame} maxPlayers={maxPlayers} />);

    fireEvent.click(screen.getByText('Start Game'));

    expect(mockOnStartGame).toHaveBeenCalled();
  });

  test('renders the list of players', () => {
    const players = [{ name: 'Player1', uid: '1', score: 0 }, { name: 'Player2', uid: '2', score: 0 }];
    render(<WaitingRoom createdBy='1' players={players} onAddPlayer={mockOnAddPlayer} onStartGame={mockOnStartGame} maxPlayers={maxPlayers} />);

    players.forEach(player => {
      expect(screen.getByText(player.name)).toBeInTheDocument();
    });
  });
});
