import React from 'react';
import Dice from './Dice';
import { preRoll, postRoll } from './business-logic/gameLogic';
import { GameState, getGameDocRef, saveGameState } from './models/GameState';
import { getUserId } from './models/Player';

type GameInProgressProps = {
  gameId: string;
  gameState: GameState;
};

const GameInProgress: React.FC<GameInProgressProps> = ({
  gameId,
  gameState,
}) => {
  const userId = getUserId();
  const gameDocRef = getGameDocRef(gameId);

  const handleRollDice = async () => {
    if (gameDocRef) {
      // Start the roll
      const newGameState = preRoll(gameState, userId);
      await saveGameState(gameId, newGameState);

      // Wait for the roll to complete
      setTimeout(async () => {
        const newGameState = postRoll(gameState);
        await saveGameState(gameId, newGameState);
      }, 1000);
    }
  };

  const currentPlayer = gameState.currentPlayer;
  const rolling = gameState.rolling;
  const diceValues = gameState.diceValues;
  const players = gameState.players;

  const currentPlayerName = players[currentPlayer - 1]?.name || 'Unknown Player';

  return (
    <>
      <h1>{currentPlayerName}'s Turn</h1>
      <button onClick={handleRollDice} disabled={rolling || players[currentPlayer - 1]?.uid !== userId}>Roll Dice</button>
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
