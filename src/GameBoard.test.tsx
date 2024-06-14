import React from 'react';
import { screen, render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import GameBoard from './GameBoard';
import { GameState, getGameDocRef } from './models/GameState';

// Mock the necessary modules
jest.mock('react-firebase-hooks/firestore');
jest.mock('./models/GameState', () => ({
  getGameDocRef: jest.fn(),
  rollDice: jest.fn(),
  getUserId: jest.fn(),
}));

const mockUseDocumentData = useDocumentData as jest.Mock;
const mockGetGameDocRef = getGameDocRef as jest.Mock;

const inProgressGameState: GameState = {
  currentPlayer: 1,
  rolling: false,
  diceValues: [1, 2],
  macroState: 'inProgress',
  turnState: 'rolling',
  maxPlayers: 2,
  scoreGoal: 100,
  players: [
    { uid: '1', name: 'Player 1', score: 100 },
    { uid: '2', name: 'Player 2', score: 50 },
  ],
  createdBy: 'user-id', // Add a suitable user ID
  scoringDice: [1, 2], // Add appropriate dice values
  turnScore: 0 // Initialize turn score
};

describe('GameBoard', () => {
  const gameId = 'test-game-id';

  beforeEach(() => {
    mockGetGameDocRef.mockReturnValue({ id: gameId });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (children: React.ReactElement) => {
    return render(
      <MemoryRouter initialEntries={[`/games/${gameId}`]}>
        <Routes>
          <Route path="/games/:gameId" element={children} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders loading state', () => {
    mockUseDocumentData.mockReturnValue([undefined, true, undefined]);

    renderWithRouter(<GameBoard />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders error state', () => {
    const errorMessage = 'Test error';
    mockUseDocumentData.mockReturnValue([undefined, false, { message: errorMessage }]);

    renderWithRouter(<GameBoard />);

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  test('renders GameOver component when game is over', () => {
    const gameState: GameState = {
      currentPlayer: 1,
      rolling: false,
      diceValues: [1, 2],
      scoringDice: [1, 2],
      macroState: 'gameOver',
      turnState: 'rolling',
      maxPlayers: 2,
      scoreGoal: 100,
      players: [
        { uid: '1', name: 'Player 1', score: 100 },
        { uid: '2', name: 'Player 2', score: 50 },
      ],
      createdBy: 'user-id', // Assuming 'createdBy' is a string representing the user ID
      turnScore: 0, // Assuming 'turnScore' is a number, set to 0 or appropriate value
    };
    mockUseDocumentData.mockReturnValue([gameState, false, undefined]);

    renderWithRouter(<GameBoard />);

    expect(screen.getByText(/Game Over/)).toBeInTheDocument();
    const player1Elements = screen.getAllByText(/Player 1/);
    expect(player1Elements.length).toBeGreaterThan(0);
  });

  test('renders GameInProgress component when game is in progress', () => {
    mockUseDocumentData.mockReturnValue([inProgressGameState, false, undefined]);

    renderWithRouter(<GameBoard />);

    const playerTurnElement = screen.queryByText("Player 1's Turn");
    expect(playerTurnElement).toBeInTheDocument();
    expect(screen.getByText('Roll Dice')).toBeInTheDocument();
  });
});
