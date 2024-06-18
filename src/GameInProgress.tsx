import React, { useState } from 'react';
import Dice from './Dice';
import { preRoll, postRoll, setAsideDice, endTurn, scoreDice } from './business-logic/gameLogic';
import { GameState, saveGameState } from './models/GameState';
import { getUserId } from './models/Player';
import './Home.css'; // Import the CSS file
import Scoreboard from './Scoreboard';

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
  const { totalScore: selectedDiceScore, unscoredDice, scoringDetails } = scoreDice(selectedDiceValues);
  const { totalScore: diceValuesScore } = scoreDice(gameState.diceValues);

  const hasPassedTheCheese = gameState.diceValues.length === 0;
  const hasCutTheCheese = gameState.turnState === 'settingAside' && (diceValuesScore === 0 || hasPassedTheCheese);

  const currentPlayer = gameState.currentPlayer;
  const rolling = gameState.rolling;
  const players = gameState.players;

  const currentPlayerName = players[currentPlayer - 1]?.name || 'Unknown Player';
  const isCurrentUser = players[currentPlayer - 1]?.uid === userId;

  const handleRollDice = async () => {
    const newGameState = preRoll(gameState, userId);
    await saveGameState(gameId, newGameState);

    setTimeout(async () => {
      const newGameState = postRoll(gameState);
      await saveGameState(gameId, newGameState);
    }, 1000);
  };

  const handleDiceClick = (index: number) => {
    if (isCurrentUser && gameState.turnState === 'settingAside') {
      setSelectedDice((prevSelectedDice) => {
        if (prevSelectedDice.includes(index)) {
          return prevSelectedDice.filter((i) => i !== index);
        } else {
          return [...prevSelectedDice, index];
        }
      });
    }
  };

  const handleSetAsideDice = async () => {
    const newGameState = setAsideDice(gameState, selectedDice);
    await saveGameState(gameId, newGameState);
    setSelectedDice([]);
  };

  const handleEndTurn = async () => {
    const newGameState = endTurn(gameState, hasCutTheCheese);
    await saveGameState(gameId, newGameState);
  };

  return (
    <div className="game-container">
      <h1 className="title">{currentPlayerName}'s Turn</h1>
      {gameState.scoringDice.length > 0 && (
        <div className="dice-section set-aside-section">
          <h2>Set Aside: {gameState.turnScore} points</h2>
          <div className="dice-container">
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
        </div>
      )}
      <div className="dice-section">
        <div className="dice-container">
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
        {isCurrentUser && selectedDice.length > 0 && (
          <div>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {scoringDetails.map((detail, idx) => (
                <li key={idx}>{detail.reason}: {detail.points} points</li>
              ))}
            </ul>
            <h3>Total: {selectedDiceScore}</h3>
          </div>
        )}
        <div>
          {hasCutTheCheese && <h3>💨 You cut the cheese 💨</h3>}
          {hasPassedTheCheese && (
            <h3>
              🎉 Congratulations! You passed the cheese! 🎉
              <br />
              You got a 500 point bonus!
            </h3>
          )}
        </div>
      </div>
      {isCurrentUser && (
        <div className="button-container">
          { (gameState.turnState === 'rolling' || gameState.turnState === 'deciding') && !hasPassedTheCheese && (
            <button
              className="create-game-button"
              onClick={handleRollDice}
              disabled={rolling || !isCurrentUser}
            >
              Roll Dice
            </button>
          )}
          {gameState.turnState === 'settingAside' && !hasCutTheCheese && (
            <button
              className="create-game-button"
              onClick={handleSetAsideDice}
              disabled={rolling || !isCurrentUser || unscoredDice.length > 0 || selectedDice.length === 0}
            >
              Set Aside Selected Dice
            </button>
          )}
          {(gameState.turnState === 'deciding' || hasCutTheCheese) && (
            <button
              className="create-game-button"
              onClick={handleEndTurn}
              disabled={rolling || !isCurrentUser}
            >
              End Turn
            </button>
          )}
        </div>
      )}
      <Scoreboard players={players} currentPlayer={currentPlayer} userId={userId} />
    </div>
  );
};

export default GameInProgress;
