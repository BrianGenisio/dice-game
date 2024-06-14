import { v4 as uuidv4 } from 'uuid';
import { GameState } from '../models/GameState';
import { Player } from "../models/Player";

const NUMBER_OF_DICE = 6;
const INITIAL_DICE_VALUE = 1;

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

  return { ...gameState, macroState: 'inProgress' };
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
    macroState: 'waiting',
    turnState: 'rolling',
    createdBy,
    scoringDice: [],
    turnScore: 0
  };
  return { gameId, initialState };
};

const rollDiceValues = (numDice: number): number[] => Array.from({ length: numDice }, () => Math.floor(Math.random() * 6) + 1);

const calculateNewScores = (gameState: GameState): Player[] => {
  const newPlayers = [...gameState.players];
  newPlayers[gameState.currentPlayer - 1].score += gameState.turnScore;
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

  if (gameState.macroState === 'gameOver' || gameState.rolling) {
    return gameState;
  }

  return { ...gameState, rolling: true };
};

export const postRoll = (gameState: GameState): GameState => {
  const numDiceToRoll = 6 - gameState.scoringDice.length;
  const newValues = rollDiceValues(numDiceToRoll);

  return {
    ...gameState,
    diceValues: newValues,
    rolling: false,
    turnState: 'settingAside',  // Update turn state to "settingAside"
  };
};

export const endTurn = (gameState: GameState): GameState => {
  const newPlayers = calculateNewScores(gameState);
  const newGameOver = newPlayers[gameState.currentPlayer - 1].score >= gameState.scoreGoal;
  const newCurrentPlayer = determineNextPlayer(gameState, newGameOver);

  return {
    ...gameState,
    players: newPlayers,
    currentPlayer: newCurrentPlayer,
    macroState: newGameOver ? 'gameOver' : 'inProgress',
    turnScore: 0,
    scoringDice: [],
    diceValues: [1, 1, 1, 1, 1, 1]  // Reset diceValues to six dice with value 1
  };
};

export const setAsideDice = (gameState: GameState, diceIndices: number[]): GameState => {
  if (gameState.macroState !== 'inProgress') {
    throw new Error('Game is not in progress');
  }

  const newScoringDice = [...gameState.scoringDice];
  const remainingDiceValues = gameState.diceValues.filter((_, index) => !diceIndices.includes(index));
  let turnScore = gameState.turnScore;

  diceIndices.forEach(index => {
    if (index < 0 || index >= gameState.diceValues.length) {
      throw new Error('Invalid dice index');
    }

    newScoringDice.push(gameState.diceValues[index]);
    turnScore += gameState.diceValues[index];
  });

  return {
    ...gameState,
    diceValues: remainingDiceValues,
    scoringDice: newScoringDice,
    turnScore,
    turnState: 'deciding'  // Update turn state to "deciding"
  };
};

