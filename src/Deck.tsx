import React, { useCallback } from 'react';
import { GameState } from './models/GameState';
import { drawCard } from './business-logic/gameLogic';
import { saveGameState } from './models/GameState';
import './Deck.css';

type DeckProps = {
  gameState: GameState;
  gameId: string;
};

const Deck: React.FC<DeckProps> = ({ gameState, gameId }) => {
  const { currentCard, deck = [] } = gameState;

  const handleDeckClick = useCallback(async () => {
    const updatedGameState = drawCard(gameState);
    await saveGameState(gameId, updatedGameState);
  }, [gameState, gameId]);

  return (
    <div className="deck-container" onClick={handleDeckClick}>
      {currentCard ? (
        <div className="card">
          <h3>{currentCard.name}</h3>
          <div className="tooltip">
            <span className="tooltiptext">{currentCard.description}</span>
          </div>
        </div>
      ) : (
        <div className="card back">
          <p>Draw a Card</p>
        </div>
      )}
      <div className="deck">
        <p>{deck.length} cards remaining</p>
      </div>
    </div>
  );
};

export default Deck;
