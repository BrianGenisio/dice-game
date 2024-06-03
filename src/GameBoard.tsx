import { useEffect, useMemo } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import Dice from './Dice';
import { GameState } from './models/GameState';

interface GameBoardProps {
  numberOfPlayers: number;
  scoreGoal: number;
}

export default function GameBoard({ numberOfPlayers, scoreGoal }: GameBoardProps) {
  const gameDocRef = useMemo(() => doc(db, 'games', 'game2').withConverter<GameState>({
    toFirestore: (gameState: GameState) => gameState,
    fromFirestore: (snapshot) => snapshot.data() as GameState
  }), []); // Removed 'db' from the dependency array
  const [gameState, loading, error] = useDocumentData<GameState>(gameDocRef);

  useEffect(() => {
    if (!loading && !gameState) {
      const initialScores = Array.from({ length: numberOfPlayers }, () => 0);
      const initialState: GameState = {
        diceValues: Array.from({ length: 6 }, () => 1),
        currentPlayer: 1,
        scores: initialScores,
        gameOver: false,
        rolling: false,
      };
      setDoc(gameDocRef, initialState).catch((err) => {
        console.error('Error setting initial state:', err);
      });
    }
  }, [loading, gameState, numberOfPlayers, gameDocRef]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!gameState) return null;

  const rollDice = async () => {
    if (gameState.gameOver || gameState.rolling) return;
    await setDoc(gameDocRef, { ...gameState, rolling: true });

    setTimeout(() => {
      const newValues = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
      const totalNewValue = newValues.reduce((acc, value) => acc + value, 0);
      const newScores = [...gameState.scores];
      newScores[gameState.currentPlayer - 1] += totalNewValue;
      const newGameOver = newScores[gameState.currentPlayer - 1] >= scoreGoal;
      const newCurrentPlayer = gameState.currentPlayer === numberOfPlayers ? 1 : gameState.currentPlayer + 1;

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
