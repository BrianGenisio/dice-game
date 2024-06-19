import { v4 as uuidv4 } from 'uuid';
import { GameState } from "../models/GameState";
import { addPlayer, createGame, postRoll, preRoll, setAsideDice, scoreDice } from "./gameLogic";

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('rollDice', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should update game state correctly after rolling dice', async () => {
    const players = [{ uid: '1', name: 'Player 1', score: 0 }];
    const initialGameState: GameState = {
      diceValues: [1, 1, 1, 1, 1, 1],
      currentPlayer: 1,
      rolling: false,
      scoreGoal: 100,
      maxPlayers: 2,
      players,
      macroState: 'inProgress',
      createdBy: '1',
      scoringDice: [],
      turnScore: 0,
      turnState: 'rolling',
      deck: [],
      currentCard: null,
      discardedCards: []
    };

    let gameState = preRoll(initialGameState, "1");

    expect(gameState).toStrictEqual({ ...initialGameState, rolling: true });

    gameState = postRoll(gameState);

    expect(gameState).toStrictEqual({
      createdBy: "1",
      rolling: false,
      currentPlayer: expect.any(Number),
      diceValues: expect.any(Array),
      maxPlayers: 2,
      scoreGoal: 100,
      players,
      macroState: 'inProgress',
      scoringDice: [],
      turnScore: 0,
      turnState: 'settingAside',
      currentCard: null,
      deck: [],
      discardedCards: [], // Added this line
    });
  });
});

describe('createGame', () => {
  const mockGameId = 'testgameid';

  beforeEach(() => {
    (uuidv4 as jest.Mock).mockReturnValue(`${mockGameId}-uuid`);
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => key === 'userId' ? '1' : null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new game with the correct initial state', async () => {
    const maxPlayers = 4;
    const scoreGoal = 100;

    const { gameId, initialState } = createGame(maxPlayers, scoreGoal, "abc");

    expect(gameId).toBe(mockGameId);
    expect(initialState).toStrictEqual({
      diceValues: Array(6).fill(1),
      currentPlayer: 1,
      rolling: false,
      scoreGoal,
      maxPlayers,
      players: [],
      macroState: 'waiting',
      createdBy: 'abc',
      scoringDice: [],
      turnScore: 0,
      turnState: 'rolling',
      currentCard: null,
      deck: expect.any(Array),
      discardedCards: [] // Added this line
    });
  });
});

describe('addPlayer', () => {
  it('should add a player to the game', async () => {
    const initialGameState: GameState = {
      diceValues: [],
      currentPlayer: 1,
      rolling: false,
      scoreGoal: 100,
      maxPlayers: 4,
      macroState: 'waiting',
      createdBy: 'abc',
      players: [],
      scoringDice: [],
      turnScore: 0,
      turnState: 'rolling',
      deck: [],
      currentCard: null,
      discardedCards: []
    };

    const gameState = addPlayer(initialGameState, 'Player2', "abc");

    expect(gameState?.players).toContainEqual({
      name: 'Player2',
      score: 0,
      uid: 'abc',
    });
  });
});

describe('setAsideDice', () => {
  let initialGameState: GameState;
  beforeEach(() => {
    initialGameState = {
      diceValues: [1, 2, 3, 4, 5, 6],
      currentPlayer: 1,
      rolling: false,
      scoreGoal: 100,
      deck: [],
      currentCard: null,
      maxPlayers: 4,
      players: [
        { uid: 'player1', name: 'Player 1', score: 0 },
        { uid: 'player2', name: 'Player 2', score: 0 }
      ],
      macroState: 'inProgress',
      createdBy: 'player1',
      scoringDice: [],
      turnScore: 0,
      turnState: 'rolling',
      discardedCards: [] // Added this line
    };
  });

  it('should set aside the specified dice and update the turn score', () => {
    const diceIndices = [0, 4]; // Indices to set aside
    const newGameState = setAsideDice(initialGameState, diceIndices);

    const expectedScoringDice = [1, 5]; // Values at indices 1, 3, 5
    const expectedRemainingDice = [2, 3, 4, 6]; // Remaining dice values

    expect(newGameState.scoringDice).toEqual(expectedScoringDice);
    expect(newGameState.turnScore).toBe(150); // Sum of values at indices 1, 3, 5
    expect(newGameState.diceValues).toEqual(expectedRemainingDice);
  });

  it('should throw an error if the game is not in progress', () => {
    initialGameState.macroState = 'waiting';
    expect(() => setAsideDice(initialGameState, [0])).toThrow('Game is not in progress');
  });

  it('should throw an error if an invalid dice index is provided', () => {
    expect(() => setAsideDice(initialGameState, [6])).toThrow('Invalid dice index');
  });
});

describe('scoreDice', () => {
  test('should throw an error for empty dice array', () => {
    const result = scoreDice([]);
    expect(result).toEqual({ totalScore: 0, unscoredDice: [], scoringDetails: [] });
  });

  test('should throw an error for too many dice', () => {
    expect(() => scoreDice([1, 2, 3, 4, 5, 6, 7])).toThrow('Invalid number of dice');
  });

  test('should score a straight correctly', () => {
    const result = scoreDice([1, 2, 3, 4, 5, 6]);
    expect(result).toEqual({
      totalScore: 1500,
      unscoredDice: [],
      scoringDetails: [
        {
          reason: 'Straight',
          values: [1, 2, 3, 4, 5, 6],
          points: 1500, // Add this line
        },
      ],
    });
  });

  test('should score three of a kind correctly', () => {
    const result = scoreDice([1, 1, 1, 2, 3, 4]);
    expect(result).toEqual({
      totalScore: 1000,
      unscoredDice: [2, 3, 4],
      scoringDetails: [
        {
          reason: 'Three of a kind',
          values: [1, 1, 1],
          points: 1000, // Add this line
        },
      ],
    });
  });

  test('should score single 1s and 5s correctly', () => {
    const result = scoreDice([1, 5, 2, 3, 6, 6]);
    expect(result).toEqual({
      totalScore: 150,
      unscoredDice: [2, 3, 6, 6],
      scoringDetails: [
        { reason: 'Single 1s', values: [1], points: 100 },
        { reason: 'Single 5s', values: [5], points: 50 }
      ]
    });
  });

  test('should score a combination of three of a kind and single 1s and 5s correctly', () => {
    const result = scoreDice([1, 1, 1, 5, 5, 2]);
    expect(result).toEqual({
      totalScore: 1100,
      unscoredDice: [2],
      scoringDetails: [
        { reason: 'Three of a kind', values: [1, 1, 1], points: 1000 },
        { reason: 'Single 5s', values: [5, 5], points: 100 }
      ]
    });
  });

  test('should return unscored dice correctly', () => {
    const result = scoreDice([2, 3, 4, 6]);
    expect(result).toEqual({
      totalScore: 0,
      unscoredDice: [2, 3, 4, 6],
      scoringDetails: []
    });
  });
});