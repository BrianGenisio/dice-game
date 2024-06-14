import React, { useState } from 'react';
import Dice from './Dice';
import { preRoll, postRoll, setAsideDice, endTurn, scoreDice } from './business-logic/gameLogic';
import { GameState, saveGameState } from './models/GameState';
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

  const [selectedDice, setSelectedDice] = useState<number[]>([]);
  const selectedDiceValues = selectedDice.map(index => gameState.diceValues[index]);
  const { totalScore: selectedDiceScore, scoringDetails } = scoreDice(selectedDiceValues);
  const { totalScore: diceValuesScore } = scoreDice(gameState.diceValues);

  const hasCutTheCheese = gameState.turnState === 'settingAside' && diceValuesScore === 0;

  const handleRollDice = async () => {
    // Start the roll
    const newGameState = preRoll(gameState, userId);
    await saveGameState(gameId, newGameState);

    // Wait for the roll to complete
    setTimeout(async () => {
      const newGameState = postRoll(gameState);
      await saveGameState(gameId, newGameState);
    }, 1000);
  };

  const handleDiceClick = (index: number) => {
    setSelectedDice((prevSelectedDice) => {
      if (prevSelectedDice.includes(index)) {
        return prevSelectedDice.filter((i) => i !== index);
      } else {
        return [...prevSelectedDice, index];
      }
    });
  };

  const handleSetAsideDice = async () => {
    const newGameState = setAsideDice(gameState, selectedDice);
    await saveGameState(gameId, newGameState);
    setSelectedDice([]); // Clear the selected dice after setting them aside
  };

  const handleEndTurn = async () => {
    const newGameState = endTurn(gameState, hasCutTheCheese);
    await saveGameState(gameId, newGameState);
  };

  const currentPlayer = gameState.currentPlayer;
  const rolling = gameState.rolling;
  const players = gameState.players;

  const currentPlayerName = players[currentPlayer - 1]?.name || 'Unknown Player';

  return (
    <>
      <h1>{currentPlayerName}'s Turn</h1>
      <div>
        <h2>Set Aside Dice:</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {gameState.scoringDice.map((value, index) => (
            <Dice
              key={index}
              value={value}
              rolling={false}
              selected={false}
              onClick={() => {}}
            />
          ))}
        </div>
        <h3>Points: {gameState.turnScore}</h3>
      </div>
      <div>
        <h2>Rolling Dice:</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {gameState.diceValues.map((value, index) => (
            <Dice
              key={index}
              value={value}
              rolling={gameState.rolling}
              selected={selectedDice.includes(index)}
              onClick={() => handleDiceClick(index)}
            />
          ))}
        </div>
        <div>
          <h3>Selected Dice Score: {selectedDiceScore}</h3>
          <ul>
            {scoringDetails.map((detail, idx) => (
              <li key={idx}>{detail.reason}: {detail.points} points</li>
            ))}
          </ul>
        </div>
        <div>
          {diceValuesScore === 0 && <h3>You cut the cheese</h3>}
        </div>
      </div>
      { (gameState.turnState === 'rolling' || gameState.turnState === 'deciding') && (
        <button
          onClick={handleRollDice}
          disabled={rolling || players[currentPlayer - 1]?.uid !== userId}
        >
          Roll Dice
        </button>
      )}
      {gameState.turnState === 'settingAside' && !hasCutTheCheese && (
        <button
          onClick={handleSetAsideDice}
          disabled={rolling || players[currentPlayer - 1]?.uid !== userId}
        >
          Set Aside Selected Dice
        </button>
      )}
      {(gameState.turnState === 'deciding' || hasCutTheCheese) && (
        <button onClick={handleEndTurn} disabled={rolling || players[currentPlayer - 1]?.uid !== userId}>
          End Turn
        </button>
      )}
      {players.map((player, index) => (
        <h2 key={index}>
          {player.name} Score: {player.score} {player.uid === userId && '(You)'} {(index + 1) === currentPlayer && '←'}
        </h2>
      ))}
    </>
  );
};

export default GameInProgress;
