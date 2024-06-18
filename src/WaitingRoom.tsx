import { useState } from 'react';
import { getUserId } from './models/Player';
import { isCurrentUserInGame, startGame } from "./business-logic/gameLogic";
import { saveGameState } from './models/GameState';
import { addPlayer } from './business-logic/gameLogic';
import { GameState } from './models/GameState';
import './Home.css';

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
    <div className="waiting-room-container centered-container">
      <img src="/Waiting-Room.webp" alt="Waiting Room" className="header-image" />
      <h2 className="title">Waiting Room</h2>
      <ul className="player-list" style={{ textAlign: 'center' }}>
        {gameState.players.map((player, index) => (
          <li key={index} className={`player-item ${player.uid === currentUserId ? 'current-player' : ''}`}>
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
            className="number-input"
          />
          <button onClick={() => handleAddPlayer(playerName)} className="create-game-button" style={{ marginRight: '10px' }}>Add Player</button>
        </>
      )}
      {currentUserId === gameState.createdBy ? (
        <button
          onClick={handleStartGame}
          className="create-game-button"
          style={{ marginTop: '10px' }}
          disabled={gameState.players.length === 0}
        >
          Start Game
        </button>
      ) : (
        isPlayerInGame && <p>Waiting for the game creator to start the game...</p>
      )}
    </div>
  );
};

export default WaitingRoom;
