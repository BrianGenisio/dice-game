import { useMemo } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router-dom';

import { getGameDocRef, GameState } from './models/GameState';

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

  return (
    <div>
      {gameState.macroState === 'waiting' ? (
        <WaitingRoom
          gameId={gameId}
          gameState={gameState}
        />
      ) : gameState.macroState === 'inProgress' ? (
        <GameInProgress
          gameId={gameId}
          gameState={gameState}
        />
      ) : (
        <GameOver gameState={gameState} />
      )}
    </div>
  );
}
