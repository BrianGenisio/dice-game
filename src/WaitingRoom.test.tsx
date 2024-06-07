import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WaitingRoom from './WaitingRoom';

describe('WaitingRoom Component', () => {
  const mockOnAddPlayer = jest.fn();
  const mockOnStartGame = jest.fn();
  const maxPlayers = 3;

  beforeEach(() => {
    mockOnAddPlayer.mockClear();
    mockOnStartGame.mockClear();
  });

  test('renders the component with initial props', () => {
    render(<WaitingRoom players={[]} onAddPlayer={mockOnAddPlayer} onStartGame={mockOnStartGame} maxPlayers={maxPlayers} />);

    expect(screen.getByText('Waiting Room')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByText('Add Player')).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  test('adds a player when Add Player button is clicked', () => {
    render(<WaitingRoom players={[]} onAddPlayer={mockOnAddPlayer} onStartGame={mockOnStartGame} maxPlayers={maxPlayers} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'Player1' } });
    fireEvent.click(screen.getByText('Add Player'));

    expect(mockOnAddPlayer).toHaveBeenCalledWith('Player1');
    expect(screen.getByPlaceholderText('Enter your name')).toHaveValue('');
  });

  test('disables input and Add Player button when max players is reached', () => {
    render(<WaitingRoom players={['Player1', 'Player2', 'Player3']} onAddPlayer={mockOnAddPlayer} onStartGame={mockOnStartGame} maxPlayers={maxPlayers} />);

    expect(screen.getByPlaceholderText('Enter your name')).toBeDisabled();
    expect(screen.getByText('Add Player')).toBeDisabled();
  });

  test('calls onStartGame when Start Game button is clicked', () => {
    render(<WaitingRoom players={[]} onAddPlayer={mockOnAddPlayer} onStartGame={mockOnStartGame} maxPlayers={maxPlayers} />);

    fireEvent.click(screen.getByText('Start Game'));

    expect(mockOnStartGame).toHaveBeenCalled();
  });

  test('renders the list of players', () => {
    const players = ['Player1', 'Player2'];
    render(<WaitingRoom players={players} onAddPlayer={mockOnAddPlayer} onStartGame={mockOnStartGame} maxPlayers={maxPlayers} />);

    players.forEach(player => {
      expect(screen.getByText(player)).toBeInTheDocument();
    });
  });
});
