import React, { useState } from 'react';

interface WaitingRoomProps {
  players: string[];
  onAddPlayer: (playerName: string) => void;
  onStartGame: () => void;
  maxPlayers: number;
}

export default function WaitingRoom({ players, onAddPlayer, onStartGame, maxPlayers }: WaitingRoomProps) {
  const [playerName, setPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (playerName && players.length < maxPlayers) {
      onAddPlayer(playerName);
      setPlayerName('');
    }
  };

  return (
    <div>
      <h2>Waiting Room</h2>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter your name"
        disabled={players.length >= maxPlayers}
      />
      <button onClick={handleAddPlayer} disabled={players.length >= maxPlayers}>Add Player</button>
      <button onClick={onStartGame}>Start Game</button>
    </div>
  );
}
