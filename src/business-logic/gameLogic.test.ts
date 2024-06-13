import { v4 as uuidv4 } from 'uuid';
import { GameState } from "../models/GameState";
import { addPlayer, createGame, postRoll, preRoll, setAsideDice } from "./gameLogic";

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
      state: 'inProgress',
      createdBy: '1',
      scoringDice: [],
      turnScore: 0,
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
      state: 'inProgress',
      scoringDice: [],
      turnScore: 0,
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
      state: 'waiting',
      createdBy: 'abc',
      scoringDice: [],
      turnScore: 0,
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
      state: 'waiting',
      createdBy: 'abc',
      players: [],
      scoringDice: [],
      turnScore: 0,
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
      maxPlayers: 4,
      players: [
        { uid: 'player1', name: 'Player 1', score: 0 },
        { uid: 'player2', name: 'Player 2', score: 0 }
      ],
      state: 'inProgress',
      createdBy: 'player1',
      scoringDice: [],
      turnScore: 0
    };
  });

  it('should set aside the specified dice and update the turn score', () => {
    const diceIndices = [1, 3, 5]; // Indices to set aside
    const newGameState = setAsideDice(initialGameState, diceIndices);

    const expectedScoringDice = [2, 4, 6]; // Values at indices 1, 3, 5
    const expectedRemainingDice = [1, 3, 5]; // Remaining dice values

    expect(newGameState.scoringDice).toEqual(expectedScoringDice);
    expect(newGameState.turnScore).toBe(2 + 4 + 6); // Sum of values at indices 1, 3, 5
    expect(newGameState.diceValues).toEqual(expectedRemainingDice);
  });

  it('should throw an error if the game is not in progress', () => {
    initialGameState.state = 'waiting';
    expect(() => setAsideDice(initialGameState, [0])).toThrow('Game is not in progress');
  });

  it('should throw an error if an invalid dice index is provided', () => {
    expect(() => setAsideDice(initialGameState, [6])).toThrow('Invalid dice index');
  });
});