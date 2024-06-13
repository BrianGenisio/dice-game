import React, { useEffect, useState } from 'react';
import './Dice.css';

interface DiceProps {
  value: number;
  rolling: boolean;
  selected: boolean;
  onClick: () => void;
}

const Dice: React.FC<DiceProps> = ({ value, rolling, selected, onClick }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (rolling) {
      interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 100);
    } else {
      setDisplayValue(value);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rolling, value]);

  const renderDiceFace = (value: number) => {
    const positions = [
      [], // 0 dots (not used)
      ['center'], // 1 dot
      ['top-left', 'bottom-right'], // 2 dots
      ['top-left', 'center', 'bottom-right'], // 3 dots
      ['top-left', 'top-right', 'bottom-left', 'bottom-right'], // 4 dots
      ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'], // 5 dots
      ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'], // 6 dots
    ];

    return (
      <div className="face">
        {positions[value].map((pos, i) => (
          <span key={i} data-testid={`dot-${pos}`} className={`dot ${pos}`}></span>
        ))}
      </div>
    );
  };

  return (
    <div
      data-testid="dice"
      className={`dice ${rolling ? 'rolling' : ''} ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {renderDiceFace(displayValue)}
    </div>
  );
};

export default Dice;
