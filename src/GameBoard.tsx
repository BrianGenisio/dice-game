import { useState, useMemo } from 'react';
import Dice from './Dice';

interface GameBoardProps {
  numberOfPlayers: number;
  scoreGoal: number;
}

export default function GameBoard({ numberOfPlayers, scoreGoal }: GameBoardProps) {
  const initialScores = useMemo(() => Array.from({ length: numberOfPlayers }, () => 0), [numberOfPlayers]);
  const [diceValues, setDiceValues] = useState(Array.from({ length: 6 }, () => 1));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState(initialScores);
  const [gameOver, setGameOver] = useState(false);
  const [rolling, setRolling] = useState(false);

  const rollDice = () => {
    if (gameOver) return;
    setRolling(true);
    setTimeout(() => {
      const newValues = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
      setDiceValues(newValues);
      updateScore(newValues.reduce((acc, value) => acc + value, 0));
      setRolling(false);
    }, 1000); // Roll for 1 second
  };

  const updateScore = (totalNewValue: number) => {
    setScores(prevScores => {
      const newScores = [...prevScores];
      newScores[currentPlayer - 1] += totalNewValue;
      if (newScores[currentPlayer - 1] >= scoreGoal) {
        setGameOver(true);
      }
      return newScores;
    });
    if (!gameOver) {
      switchPlayer();
    }
  };

  const switchPlayer = () => {
    setCurrentPlayer(currentPlayer === numberOfPlayers ? 1 : currentPlayer + 1);
  };

  return (
    <div>
      {gameOver ? (
        <h1>Game Over! Player {currentPlayer} wins!</h1>
      ) : (
        <>
          <h1>Player {currentPlayer}'s Turn</h1>
          <button onClick={rollDice}>Roll Dice</button>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {diceValues.map((value, index) => (
              <Dice key={index} value={value} rolling={rolling} />
            ))}
          </div>
          {scores.map((score, index) => (
            <h2 key={index}>Player {index + 1} Score: {score}</h2>
          ))}
        </>
      )}
    </div>
  );
}
