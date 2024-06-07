import { createGame, getGameDocRef, rollDice, addPlayer } from './GameState';
import { setDoc, doc, getFirestore, getDoc, arrayUnion, updateDoc } from 'firebase/firestore'; // Add updateDoc import
import { v4 as uuidv4 } from 'uuid';
import { GameState } from './GameState'; // Import the existing GameState type

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  setDoc: jest.fn(),
  doc: jest.fn(),
  getFirestore: jest.fn(),
  getDoc: jest.fn(),
  arrayUnion: jest.fn(), // Mock arrayUnion
  updateDoc: jest.fn(), // Mock updateDoc
}));

// Mock UUID function
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

// Mock getGameDocRef
jest.mock('./GameState', () => ({
  ...jest.requireActual('./GameState'),
  getGameDocRef: jest.fn(),
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
    const maxPlayers = 4;
    const scoreGoal = 100;

    const gameId = await createGame(maxPlayers, scoreGoal);

    expect(gameId).toBe(mockGameId);
    expect(doc).toHaveBeenCalledWith(mockFirestore, 'games', mockGameId);
    expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
      diceValues: Array(6).fill(1),
      currentPlayer: 1,
      scores: Array(maxPlayers).fill(0),
      rolling: false,
      scoreGoal,
      maxPlayers,
      players: [],
      state: 'waiting',
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
    const initialGameState: GameState = {
      diceValues: [1, 1, 1, 1, 1, 1],
      currentPlayer: 1,
      scores: [0, 0],
      rolling: false,
      scoreGoal: 100,
      maxPlayers: 2,
      players: [],
      state: 'inProgress',
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
        maxPlayers: 2,
        players: [],
        state: 'inProgress',
      })
    );
  });
});

describe('addPlayer', () => {
  const mockGameId = 'testGameId';
  const mockDocRef = { id: mockGameId, withConverter: jest.fn().mockReturnThis() };
  const mockFirestore = {}; // Mock Firestore instance

  beforeEach(() => {
    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (getFirestore as jest.Mock).mockReturnValue(mockFirestore);
    (getDoc as jest.Mock).mockImplementation((docRef) => {
      if (docRef.id === mockGameId) {
        return Promise.resolve({
          data: () => ({
            players: ['Player1'],
            scores: [0],
          }),
        });
      }
      return Promise.resolve({
        data: () => ({
          players: [],
          scores: [],
        }),
      });
    });
    (getGameDocRef as jest.Mock).mockReturnValue(mockDocRef); // Add this line
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a player to the game', async () => {
    const gameDocRef = getGameDocRef(mockGameId);
    if (!gameDocRef) throw new Error('Game document reference is null');

    await addPlayer(gameDocRef, 'Player1');

    const gameSnapshot = await getDoc(gameDocRef);
    const gameState = gameSnapshot.data();

    expect(gameState?.players).toContain('Player1');
    expect(gameState?.scores).toContain(0);
  });
});
