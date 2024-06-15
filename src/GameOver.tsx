import { GameState } from './models/GameState';
import { getUserId } from './models/Player';
import './Home.css'; // Import the CSS file for styling

interface GameOverProps {
  gameState: GameState;
}

const GameOver: React.FC<GameOverProps> = ({ gameState }) => {
  const { players } = gameState;
  const winner = players.reduce((prev, current) => (prev.score > current.score ? prev : current));
  const userId = getUserId();
  const isUserWinner = winner.uid === userId;

  return (
    <div className="centered-container">
      <img src="/Winner.webp" alt="Winner" className="header-image" />
      <h1 className="title">Game Over! {isUserWinner ? 'You' : `${winner.name}`} win{isUserWinner ? '' : 's'} with {winner.score} points!</h1>
      <h2>Final Scores:</h2>
      <ul className="score-list">
        {players.map((player, index) => (
          <li key={index} className="score-item">{player.name}: {player.score} points</li>
        ))}
      </ul>
    </div>
  );
}

export default GameOver;
