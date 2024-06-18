import React from 'react';

type HelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose} style={{ position: 'absolute', top: '-50px', right: '-15px' }}>&times;</span>
        <h2>Game Rules</h2>
        <ul>
          <li>The game is played with 6 dice.</li>
          <li>Players take turns rolling the dice and setting aside scoring dice.</li>
          <li>Scoring combinations include:</li>
          <ul>
            <li>Straight (1-2-3-4-5-6): 1500 points</li>
            <li>Three of a kind:</li>
            <ul>
              <li>Three 1s: 1000 points</li>
              <li>Three 2s: 200 points</li>
              <li>Three 3s: 300 points</li>
              <li>Three 4s: 400 points</li>
              <li>Three 5s: 500 points</li>
              <li>Three 6s: 600 points</li>
            </ul>
            <li>Single 1s: 100 points each</li>
            <li>Single 5s: 50 points each</li>
          </ul>
          <li>Players must set aside at least one scoring die after each roll.</li>
          <li>If a player cannot set aside any scoring dice, their turn ends and they score no points for that turn.</li>
          <li>The first player to reach the score goal wins the game.</li>
          <li>Scoring with all of them grants a bonus roll.</li>
          <li>Passing the cheese (using all dice in a turn) grants a 500 point bonus.</li>
          <li>Cutting the cheese (rolling the dice but not scoring) ends the turn with no points.</li>
        </ul>
      </div>
    </div>
  );
};

export default HelpModal;
