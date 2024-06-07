import React from 'react';
import Dice from './Dice';
import { Player, getUserId } from './models/GameState';

type GameInProgressProps = {
  currentPlayer: number;
  rolling: boolean;
  diceValues: number[];
  players: Player[];
  onRollDice: () => void;
};

const GameInProgress: React.FC<GameInProgressProps> = ({
  currentPlayer,
  rolling,
  diceValues,
  players,
  onRollDice,
}) => {
  const userId = getUserId();
  const currentPlayerName = players[currentPlayer - 1]?.name || 'Unknown Player';

  return (
    <>
      <h1>{currentPlayerName}'s Turn</h1>
      <button onClick={onRollDice} disabled={rolling || players[currentPlayer - 1]?.uid !== userId}>Roll Dice</button>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        {diceValues.map((value, index) => (
          <Dice key={index} value={value} rolling={rolling} />
        ))}
      </div>
      {players.map((player, index) => (
        <h2 key={index}>
          {player.name} Score: {player.score} {player.uid === userId && '(You)'} {(index + 1) === currentPlayer && '←'}
        </h2>
      ))}
    </>
  );
};

export default GameInProgress;
