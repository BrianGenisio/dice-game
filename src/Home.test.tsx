import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import { createGame } from './business-logic/gameLogic';

// Mock the createGame function
jest.mock('./business-logic/gameLogic', () => ({
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
    expect(screen.getByLabelText('Maximum Number of Players:')).toBeInTheDocument();
    expect(screen.getByLabelText('Score Goal:')).toBeInTheDocument();
    expect(screen.getByText('Create Game')).toBeInTheDocument();
  });

  test('updates number of players and score goal', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const numberOfPlayersInput = screen.getByLabelText('Maximum Number of Players:');
    const scoreGoalInput = screen.getByLabelText('Score Goal:');

    fireEvent.change(numberOfPlayersInput, { target: { value: '4' } });
    fireEvent.change(scoreGoalInput, { target: { value: '200' } });

    expect(numberOfPlayersInput).toHaveValue(4);
    expect(scoreGoalInput).toHaveValue(200);
  });

  test('calls createGame and navigates on button click', async () => {
    (createGame as jest.Mock).mockResolvedValue({
      gameId: '12345',
      initialState: {},
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const createGameButton = screen.getByText('Create Game');
    fireEvent.click(createGameButton);

    expect(createGame).toHaveBeenCalled();
  });
});

