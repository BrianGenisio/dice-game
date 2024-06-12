import { GameState } from './models/GameState';
import { getUserId } from './models/Player';

interface GameOverProps {
  gameState: GameState;
}

const GameOver: React.FC<GameOverProps> = ({ gameState }) => {
  const { players } = gameState;
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

export default GameOver;
