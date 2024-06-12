import { v4 as uuidv4 } from 'uuid';
import { GameState } from "../models/GameState";
import { addPlayer, createGame, postRoll, preRoll } from "./gameLogic";

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
    };

    const gameState = addPlayer(initialGameState, 'Player2', "abc");

    expect(gameState?.players).toContainEqual({
      name: 'Player2',
      score: 0,
      uid: 'abc',
    });
  });
});