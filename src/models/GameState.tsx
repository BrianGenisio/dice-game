export interface GameState {
  diceValues: number[];
  currentPlayer: number;
  scores: number[];
  gameOver: boolean;
  rolling: boolean;
}