import React from 'react';
import { Player } from './models/Player';
import './Scoreboard.css';

type ScoreboardProps = {
  players: Player[];
  currentPlayer: number;
  userId: string;
};

const Scoreboard: React.FC<ScoreboardProps> = ({ players, currentPlayer, userId }) => {
  return (
    <div className="scoreboard">
      <h2 className="scoreboard-title">Scoreboard</h2>
      <ul className="player-list">
        {players.map((player, index) => (
          <li key={index} className={`player-item ${index + 1 === currentPlayer ? 'current-player' : ''} ${player.uid === userId ? 'user-player' : ''}`}>
            <span className="player-name">{player.name}</span>
            <span className="player-score">{player.score}</span>
            {player.uid === userId && <span className="player-you" style={{ position: 'absolute', right: '10px' }}>(You)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Scoreboard;
