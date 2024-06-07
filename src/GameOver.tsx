import { Player, getUserId } from './models/GameState';

type GameOverProps = {
  players: Player[];
};

export default function GameOver({ players }: GameOverProps) {
  const winner = players.reduce((prev, current) => (prev.score > current.score ? prev : current));
  const userId = getUserId();
  const isUserWinner = winner.uid === userId;

  return (
    <div>
      <h1>Game Over! {isUserWinner ? 'You' : `${winner.name}`} win{isUserWinner ? '' : 's'} with {winner.score} points!</h1>
      <h2>Final Scores:</h2>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player.name}: {player.score} points</li>
        ))}
      </ul>
    </div>
  );
}
