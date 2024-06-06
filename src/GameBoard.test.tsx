import React from 'react';
import { screen, fireEvent, render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import GameBoard from './GameBoard';
import { getGameDocRef, rollDice } from './models/GameState';

// Mock the necessary modules
jest.mock('react-firebase-hooks/firestore');
jest.mock('./models/GameState', () => ({
  getGameDocRef: jest.fn(),
  rollDice: jest.fn(),
}));

const mockUseDocumentData = useDocumentData as jest.Mock;
const mockGetGameDocRef = getGameDocRef as jest.Mock;
const mockRollDice = rollDice as jest.Mock;

describe('GameBoard', () => {
  const gameId = 'test-game-id';

  beforeEach(() => {
    mockGetGameDocRef.mockReturnValue({ id: gameId });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (children: React.ReactElement) => {
    return render(<MemoryRouter initialEntries={[`/games/${gameId}`]}>
        <Routes>
            <Route path="/games/:gameId" element={children} />
        </Routes>
    </MemoryRouter>);
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
    const gameState = { gameOver: true, currentPlayer: 'Player 1' };
    mockUseDocumentData.mockReturnValue([gameState, false, undefined]);

    renderWithRouter(<GameBoard />);

    expect(screen.getByText(/Game Over/)).toBeInTheDocument();
    expect(screen.getByText(/Player 1/)).toBeInTheDocument();
  });

  test('renders GameInProgress component when game is in progress', () => {
    const gameState = {
      gameOver: false,
      currentPlayer: 1,
      rolling: false,
      diceValues: [1, 2],
      scores: [10, 5], // Ensure this is an array
    };
    mockUseDocumentData.mockReturnValue([gameState, false, undefined]);

    renderWithRouter(<GameBoard />);

    const playerTurnElements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes("Player 1's Turn") || false;
    });
    expect(playerTurnElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Roll Dice')).toBeInTheDocument();
  });

  test('calls rollDice when Roll Dice button is clicked', async () => {
    const gameState = {
      gameOver: false,
      currentPlayer: 'Player 1',
      rolling: false,
      diceValues: [1, 2],
      scores: [10, 5], // Updated to be an array
    };
    mockUseDocumentData.mockReturnValue([gameState, false, undefined]);

    renderWithRouter(<GameBoard />);

    const rollButton = screen.getByText('Roll Dice');
    fireEvent.click(rollButton);

    expect(mockRollDice).toHaveBeenCalledWith(gameState, { id: gameId });
  });
});
