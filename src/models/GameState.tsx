export interface GameState {
  diceValues: number[];
  currentPlayer: number;
  scores: number[];
  gameOver: boolean;
  rolling: boolean;
  scoreGoal: number; // Added scoreGoal property
  numberOfPlayers: number; // New property added
}