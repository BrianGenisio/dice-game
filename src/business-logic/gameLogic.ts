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

export const endTurn = (gameState: GameState, cutTheCheese: boolean): GameState => {
  const newPlayers = cutTheCheese ? gameState.players : calculateNewScores(gameState);
  const newGameOver = newPlayers[gameState.currentPlayer - 1].score >= gameState.scoreGoal;
  const newCurrentPlayer = determineNextPlayer(gameState, newGameOver);

  return {
    ...gameState,
    players: newPlayers,
    currentPlayer: newCurrentPlayer,
    macroState: newGameOver ? 'gameOver' : 'inProgress',
    turnScore: 0,
    scoringDice: [],
    diceValues: [1, 1, 1, 1, 1, 1],  // Reset diceValues to six dice with value 1
    turnState: 'rolling'  // Set turnState back to rolling
  };
};

export const setAsideDice = (gameState: GameState, diceIndices: number[]): GameState => {
  if (gameState.macroState !== 'inProgress') {
    throw new Error('Game is not in progress');
  }

  const newScoringDice = [...gameState.scoringDice];
  const remainingDiceValues = gameState.diceValues.filter((_, index) => !diceIndices.includes(index));
  const diceToScore = diceIndices.map(index => {
    if (index < 0 || index >= gameState.diceValues.length) {
      throw new Error('Invalid dice index');
    }
    return gameState.diceValues[index];
  });

  const { totalScore: newScore } = scoreDice(diceToScore);
  const turnScore = gameState.turnScore + newScore;

  return {
    ...gameState,
    diceValues: remainingDiceValues,
    scoringDice: [...newScoringDice, ...diceToScore],
    turnScore,
    turnState: 'deciding'  // Update turn state to "deciding"
  };
};

export const scoreDice = (dice: number[]): { totalScore: number, unscoredDice: number[], scoringDetails: { reason: string, values: number[], points: number }[] } => {
  if (dice.length < 1) {
    return { totalScore: 0, unscoredDice: [], scoringDetails: [] };
  }

  if (dice.length > 6) {
    throw new Error('Invalid number of dice');
  }

  const diceCount = new Array(7).fill(0);
  dice.forEach(die => diceCount[die]++);

  let totalScore = 0;
  const scoringDetails: { reason: string, values: number[], points: number }[] = [];
  const unscoredDice: number[] = [];

  // Check for a straight
  if (dice.length === 6 && diceCount.slice(1).every(count => count === 1)) {
    return {
      totalScore: 1500,
      unscoredDice: [],
      scoringDetails: [{ reason: 'Straight', values: dice, points: 1500 }]
    };
  }

  // Check for three of a kind
  for (let i = 1; i <= 6; i++) {
    if (diceCount[i] >= 3) {
      const score = (i === 1 ? 1000 : i * 100);
      totalScore += score;
      scoringDetails.push({ reason: 'Three of a kind', values: Array(3).fill(i), points: score });
      diceCount[i] -= 3;
    }
  }

  // Check for single 1s and 5s
  if (diceCount[1] > 0) {
    const score = diceCount[1] * 100;
    totalScore += score;
    scoringDetails.push({ reason: 'Single 1s', values: Array(diceCount[1]).fill(1), points: score });
    diceCount[1] = 0;
  }

  if (diceCount[5] > 0) {
    const score = diceCount[5] * 50;
    totalScore += score;
    scoringDetails.push({ reason: 'Single 5s', values: Array(diceCount[5]).fill(5), points: score });
    diceCount[5] = 0;
  }

  // Collect unscored dice
  for (let i = 1; i <= 6; i++) {
    for (let j = 0; j < diceCount[i]; j++) {
      unscoredDice.push(i);
    }
  }

  return {
    totalScore,
    unscoredDice,
    scoringDetails
  };
};
