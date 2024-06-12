import { v4 as uuidv4 } from 'uuid';
import { GameState } from '../models/GameState';
import { Player } from "../models/Player";

const NUMBER_OF_DICE = 6;
const INITIAL_DICE_VALUE = 1;
const ROLL_DELAY_MS = 1000;

export const isCurrentUserInGame = (players: Player[], currentUserId: string): boolean => {
  return players.some(player => player.uid === currentUserId);
};

export const addPlayer = (gameState: GameState, playerName: string, userId: string): GameState => {
  if (gameState.players.length >= gameState.maxPlayers) {
    throw new Error('Maximum number of players reached');
  }

  if (isCurrentUserInGame(gameState.players, userId)) {
    throw new Error('User is already in the game');
  }

  const newPlayer: Player = { uid: userId, name: playerName, score: 0 };
  const updatedPlayers = [...gameState.players, newPlayer];
  return { ...gameState, players: updatedPlayers };
};

export const startGame = (gameState: GameState, currentUserId: string): GameState => {
  if (gameState.createdBy !== currentUserId) {
    throw new Error('Only the game creator can start the game');
  }

  return { ...gameState, state: 'inProgress' };
};

export const createGame = (maxPlayers: number, scoreGoal: number, createdBy: string): { gameId: string, initialState: GameState } => {
  const gameId = uuidv4().split('-')[0];
  const initialState: GameState = {
    diceValues: Array(NUMBER_OF_DICE).fill(INITIAL_DICE_VALUE),
    currentPlayer: 1,
    rolling: false,
    scoreGoal,
    maxPlayers,
    players: [],
    state: 'waiting',
    createdBy,
  };
  return { gameId, initialState };
};

const rollDiceValues = (): number[] => Array.from({ length: NUMBER_OF_DICE }, () => Math.floor(Math.random() * NUMBER_OF_DICE) + 1);

const calculateNewScores = (gameState: GameState, newValues: number[]): Player[] => {
  const newPlayers = [...gameState.players];
  const totalNewValue = newValues.reduce((acc, value) => acc + value, 0);
  newPlayers[gameState.currentPlayer - 1].score += totalNewValue;
  return newPlayers;
};

const determineNextPlayer = (gameState: GameState, newGameOver: boolean): number => {
  return newGameOver ? gameState.currentPlayer : (gameState.currentPlayer % gameState.players.length) + 1;
};

export const preRoll = (gameState: GameState, currentUserId: string): GameState => {
  const currentPlayerId = gameState.players[gameState.currentPlayer - 1].uid;

  if (currentUserId !== currentPlayerId) {
    throw new Error('It is not your turn to roll the dice');
  }

  if (gameState.state === 'gameOver' || gameState.rolling) {
    return gameState;
  }

  return { ...gameState, rolling: true };
};

export const postRoll = (gameState: GameState): GameState => {
  const newValues = rollDiceValues();
  const newPlayers = calculateNewScores(gameState, newValues);
  const newGameOver = newPlayers[gameState.currentPlayer - 1].score >= gameState.scoreGoal;
  const newCurrentPlayer = determineNextPlayer(gameState, newGameOver);

  return {
    ...gameState,
    diceValues: newValues,
    players: newPlayers,
    rolling: false,
    currentPlayer: newCurrentPlayer,
    state: newGameOver ? 'gameOver' : 'inProgress',
  };
};
