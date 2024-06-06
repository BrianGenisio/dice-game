import { createGame, getGameDocRef, rollDice } from './GameState';
import { setDoc, doc, getFirestore } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  setDoc: jest.fn(),
  doc: jest.fn(),
  getFirestore: jest.fn(),
}));

// Mock UUID function
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('createGame', () => {
  const mockGameId = 'testgameid';
  const mockDocRef = { id: mockGameId };
  const mockFirestore = {}; // Mock Firestore instance

  beforeEach(() => {
    (uuidv4 as jest.Mock).mockReturnValue(`${mockGameId}-uuid`);
    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (getFirestore as jest.Mock).mockReturnValue(mockFirestore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new game with the correct initial state', async () => {
    const numberOfPlayers = 4;
    const scoreGoal = 100;

    const gameId = await createGame(numberOfPlayers, scoreGoal);

    expect(gameId).toBe(mockGameId);
    expect(doc).toHaveBeenCalledWith(mockFirestore, 'games', mockGameId);
    expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
      diceValues: Array(6).fill(1),
      currentPlayer: 1,
      scores: Array(numberOfPlayers).fill(0),
      gameOver: false,
      rolling: false,
      scoreGoal,
      numberOfPlayers,
    });
  });
});

describe('rollDice', () => {
  const mockGameId = 'testGameId';
  const mockDocRef = { id: mockGameId, withConverter: jest.fn().mockReturnThis() };
  const mockFirestore = {}; // Mock Firestore instance

  beforeEach(() => {
    jest.useFakeTimers(); // Use fake timers
    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (getFirestore as jest.Mock).mockReturnValue(mockFirestore);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers(); // Restore real timers
  });

  it('should update game state correctly after rolling dice', async () => {
    const gameId = 'testGameId';
    const gameDocRef = getGameDocRef(gameId);
    const initialGameState = {
      diceValues: [1, 1, 1, 1, 1, 1],
      currentPlayer: 1,
      scores: [0, 0],
      gameOver: false,
      rolling: false,
      scoreGoal: 10,
      numberOfPlayers: 2,
    };

    // Mock setDoc to resolve immediately
    (setDoc as jest.Mock).mockResolvedValueOnce(undefined);

    // Call rollDice
    await rollDice(initialGameState, gameDocRef!);

    // Verify setDoc was called with rolling: true
    expect(setDoc).toHaveBeenCalledWith(gameDocRef, { ...initialGameState, rolling: true });

    // Fast-forward time to simulate the delay
    jest.advanceTimersByTime(1000);

    // Verify setDoc was called again with updated game state
    expect(setDoc).toHaveBeenCalledWith(
      gameDocRef,
      expect.objectContaining({
        rolling: false,
        currentPlayer: expect.any(Number),
        diceValues: expect.any(Array),
        scores: expect.any(Array),
        gameOver: expect.any(Boolean),
      })
    );
  });
});