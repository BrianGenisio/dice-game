import React, { useState } from 'react';
import { Player, isCurrentUserInGame, getUserId } from './models/GameState';

interface WaitingRoomProps {
  players: Player[];
  onAddPlayer: (playerName: string) => void;
  onStartGame: () => void;
  maxPlayers: number;
}

export default function WaitingRoom({ players, onAddPlayer, onStartGame, maxPlayers }: WaitingRoomProps) {
  const [playerName, setPlayerName] = useState('');
  const currentUserId = getUserId();

  const isPlayerInGame = isCurrentUserInGame(players);

  const handleAddPlayer = () => {
    if (playerName && players.length < maxPlayers && !isPlayerInGame) {
      onAddPlayer(playerName);
      setPlayerName('');
    }
  };

  return (
    <div>
      <h2>Waiting Room</h2>
      <ul>
        {players.map((player, index) => (
          <li key={index} style={{ fontWeight: player.uid === currentUserId ? 'bold' : 'normal' }}>
            {player.name}
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter your name"
        disabled={players.length >= maxPlayers || isPlayerInGame}
      />
      <button onClick={handleAddPlayer} disabled={players.length >= maxPlayers || isPlayerInGame}>Add Player</button>
      <button onClick={onStartGame}>Start Game</button>
    </div>
  );
}
