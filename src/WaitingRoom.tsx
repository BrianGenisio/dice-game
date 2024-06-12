import { useState } from 'react';
import { getUserId } from './models/Player';
import { isCurrentUserInGame, startGame } from "./business-logic/gameLogic";
import { saveGameState } from './models/GameState';
import { addPlayer } from './business-logic/gameLogic';
import { GameState } from './models/GameState';

interface WaitingRoomProps {
  gameId: string;
  gameState: GameState;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ gameId, gameState }) => {
  const [playerName, setPlayerName] = useState('');
  const currentUserId = getUserId();
  const isPlayerInGame = isCurrentUserInGame(gameState.players, currentUserId);

  const handleAddPlayer = async (playerName: string) => {
    const newGameState = addPlayer(gameState, playerName, currentUserId);
    await saveGameState(gameId, newGameState);
  };

  const handleStartGame = async () => {
    const newGameState = startGame(gameState, currentUserId);
    await saveGameState(gameId, newGameState);
  };

  return (
    <div>
      <h2>Waiting Room</h2>
      <ul>
        {gameState.players.map((player, index) => (
          <li key={index} style={{ fontWeight: player.uid === currentUserId ? 'bold' : 'normal' }}>
            {player.name}
          </li>
        ))}
      </ul>
      {!(gameState.players.length >= gameState.maxPlayers || isPlayerInGame) && (
        <>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
          />
          <button onClick={() => handleAddPlayer(playerName)}>Add Player</button>
        </>
      )}
      {currentUserId === gameState.createdBy ? (
        <button onClick={handleStartGame}>Start Game</button>
      ) : (
        isPlayerInGame && <p>Waiting for the game creator to start the game...</p>
      )}
    </div>
  );
};

export default WaitingRoom;
