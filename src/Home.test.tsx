import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import { createGame } from './models/GameState';

// Mock the createGame function
jest.mock('./models/GameState', () => ({
  createGame: jest.fn(),
}));

// Mock the useNavigate hook
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the Home component', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Create a New Game')).toBeInTheDocument();
    expect(screen.getByLabelText('Number of Players:')).toBeInTheDocument();
    expect(screen.getByLabelText('Score Goal:')).toBeInTheDocument();
    expect(screen.getByText('Create Game')).toBeInTheDocument();
  });

  test('updates number of players and score goal', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const numberOfPlayersInput = screen.getByLabelText('Number of Players:');
    const scoreGoalInput = screen.getByLabelText('Score Goal:');

    fireEvent.change(numberOfPlayersInput, { target: { value: '4' } });
    fireEvent.change(scoreGoalInput, { target: { value: '200' } });

    expect(numberOfPlayersInput).toHaveValue(4);
    expect(scoreGoalInput).toHaveValue(200);
  });

  test('calls createGame and navigates on button click', async () => {
    (createGame as jest.Mock).mockResolvedValue('12345');

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const createGameButton = screen.getByText('Create Game');
    fireEvent.click(createGameButton);

    expect(createGame).toHaveBeenCalledWith(2, 100);
    await screen.findByText('Create Game'); // Wait for the async function to complete
    expect(mockedNavigate).toHaveBeenCalledWith('/games/12345');
  });
});
