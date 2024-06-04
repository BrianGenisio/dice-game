import { useMemo } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import Dice from './Dice';
import { GameState } from './models/GameState';
import { useParams } from 'react-router-dom';

export default function GameBoard() {
  const { gameId } = useParams();

  const gameDocRef = useMemo(() => {
    if (!gameId) return null;
    return doc(db, 'games', gameId).withConverter<GameState>({
      toFirestore: (gameState: GameState) => gameState,
      fromFirestore: (snapshot) => snapshot.data() as GameState
    });
  }, [gameId]);

  const [gameState, loading, error] = useDocumentData<GameState>(gameDocRef);

  if (!gameId) {
    return <div>Error: Game ID is missing</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!gameState) return null;

  const rollDice = async () => {
    if (gameState.gameOver || gameState.rolling || !gameDocRef) return;
    await setDoc(gameDocRef, { ...gameState, rolling: true });

    setTimeout(() => {
      const newValues = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
      const totalNewValue = newValues.reduce((acc, value) => acc + value, 0);
      const newScores = [...gameState.scores];
      newScores[gameState.currentPlayer - 1] += totalNewValue;
      const newGameOver = newScores[gameState.currentPlayer - 1] >= gameState.scoreGoal;
      const newCurrentPlayer = gameState.currentPlayer === gameState.numberOfPlayers ? 1 : gameState.currentPlayer + 1;

      setDoc(gameDocRef, {
        ...gameState,
        diceValues: newValues,
        scores: newScores,
        gameOver: newGameOver,
        rolling: false,
        currentPlayer: newGameOver ? gameState.currentPlayer : newCurrentPlayer,
      });
    }, 1000);
  };

  return (
    <div>
      {gameState.gameOver ? (
        <h1>Game Over! Player {gameState.currentPlayer} wins!</h1>
      ) : (
        <>
          <h1>Player {gameState.currentPlayer}'s Turn</h1>
          <button onClick={rollDice} disabled={gameState.rolling}>Roll Dice</button>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {gameState.diceValues.map((value, index) => (
              <Dice key={index} value={value} rolling={gameState.rolling} />
            ))}
          </div>
          {gameState.scores.map((score, index) => (
            <h2 key={index}>Player {index + 1} Score: {score}</h2>
          ))}
        </>
      )}
    </div>
  );
}
