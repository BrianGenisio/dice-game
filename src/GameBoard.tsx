import { useMemo } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router-dom';
import { getGameDocRef, rollDice, GameState, addPlayer, startGame } from './models/GameState';
import GameOver from './GameOver';
import GameInProgress from './GameInProgress';
import WaitingRoom from './WaitingRoom';

export default function GameBoard() {
  const { gameId } = useParams<{ gameId: string }>();

  const gameDocRef = useMemo(() => gameId ? getGameDocRef(gameId) : null, [gameId]);
  const [gameState, loading, error] = useDocumentData<GameState>(gameDocRef);

  if (!gameId) return <div>Error: Game ID is missing</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!gameState) return null;

  const handleRollDice = async () => {
    if (gameDocRef) {
      await rollDice(gameState, gameDocRef);
    }
  };

  const handleAddPlayer = async (playerName: string) => {
    if (gameDocRef) {
      await addPlayer(gameDocRef, playerName);
    }
  };

  const handleStartGame = async () => {
    if (gameDocRef) {
      await startGame(gameDocRef);
    }
  };

  return (
    <div>
      {gameState.state === 'waiting' ? (
        <WaitingRoom
          maxPlayers={gameState.maxPlayers}
          players={gameState.players}
          onAddPlayer={handleAddPlayer}
          onStartGame={handleStartGame}
        />
      ) : gameState.state === 'inProgress' ? (
        <GameInProgress
          currentPlayer={gameState.currentPlayer}
          rolling={gameState.rolling}
          diceValues={gameState.diceValues}
          scores={gameState.scores}
          players={gameState.players}  // Added this line
          onRollDice={handleRollDice}
        />
      ) : (
        <GameOver currentPlayer={gameState.currentPlayer} />
      )}
    </div>
  );
}
