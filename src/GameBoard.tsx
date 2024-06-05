import { useMemo } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router-dom';
import { getGameDocRef, rollDice, GameState } from './models/GameState';
import GameOver from './GameOver';
import GameInProgress from './GameInProgress';

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

  return (
    <div>
      {gameState.gameOver ? (
        <GameOver currentPlayer={gameState.currentPlayer} />
      ) : (
        <GameInProgress
          currentPlayer={gameState.currentPlayer}
          rolling={gameState.rolling}
          diceValues={gameState.diceValues}
          scores={gameState.scores}
          onRollDice={handleRollDice}
        />
      )}
    </div>
  );
}
