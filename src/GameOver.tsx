type GameOverProps = {
  currentPlayer: number;
};

export default function GameOver({ currentPlayer }: GameOverProps) {
  return <h1>Game Over! Player {currentPlayer} wins!</h1>;
}
