import { useState } from 'react';
import Dice from './Dice';

export default function GameBoard() {
  const [diceValue, setDiceValue] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState([0, 0]); // scores for player 1 and player 2

  const rollDice = () => {
    const newValue = Math.floor(Math.random() * 6) + 1;
    setDiceValue(newValue);
    updateScore(newValue);
  };

  const updateScore = (newValue: number) => {
    const newScores = [...scores];
    newScores[currentPlayer - 1] += newValue;
    setScores(newScores);
    switchPlayer();
  };

  const switchPlayer = () => {
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  return (
    <div>
      <h1>Player {currentPlayer}'s Turn</h1>
      <Dice roll={rollDice} value={diceValue} />
      <h2>Player 1 Score: {scores[0]}</h2>
      <h2>Player 2 Score: {scores[1]}</h2>
    </div>
  );
}
