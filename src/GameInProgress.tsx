import React from 'react';
import Dice from './Dice';

type GameInProgressProps = {
  currentPlayer: number;
  rolling: boolean;
  diceValues: number[];
  scores: number[];
  onRollDice: () => void;
};

const GameInProgress: React.FC<GameInProgressProps> = ({
  currentPlayer,
  rolling,
  diceValues,
  scores,
  onRollDice,
}) => {
  return (
    <>
      <h1>Player {currentPlayer}'s Turn</h1>
      <button onClick={onRollDice} disabled={rolling}>Roll Dice</button>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        {diceValues.map((value, index) => (
          <Dice key={index} value={value} rolling={rolling} />
        ))}
      </div>
      {scores.map((score, index) => (
        <h2 key={index}>Player {index + 1} Score: {score}</h2>
      ))}
    </>
  );
};

export default GameInProgress;
