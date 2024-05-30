import { useState } from 'react';
import Dice from './Dice';

interface GameBoardProps {
  numberOfPlayers: number;
}

export default function GameBoard({ numberOfPlayers }: GameBoardProps) {
  const [diceValues, setDiceValues] = useState(Array.from({ length: 6 }, () => 1));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState(Array.from({ length: numberOfPlayers }, () => 0));

  const rollDice = () => {
    const newValues = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
    setDiceValues(newValues);
    updateScore(newValues.reduce((acc, value) => acc + value, 0));
  };

  const updateScore = (totalNewValue: number) => {
    setScores(prevScores => {
      const newScores = [...prevScores];
      newScores[currentPlayer - 1] += totalNewValue;
      return newScores;
    });
    switchPlayer();
  };

  const switchPlayer = () => {
    setCurrentPlayer(currentPlayer === numberOfPlayers ? 1 : currentPlayer + 1);
  };

  return (
    <div>
      <h1>Player {currentPlayer}'s Turn</h1>
      <button onClick={rollDice}>Roll Dice</button>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        {diceValues.map((value, index) => (
          <Dice key={index} value={value} />
        ))}
      </div>
      {scores.map((score, index) => (
        <h2 key={index}>Player {index + 1} Score: {score}</h2>
      ))}
    </div>
  );
}
