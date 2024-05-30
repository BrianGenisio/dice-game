import './Dice.css'; // Ensure you have a Dice.css file in the same directory

function Dice({ roll, value }: { roll: () => void, value: number }) {
  const renderDiceFace = (value: number) => {
    const dots = Array.from({ length: value }, (_, i) => <span key={i} className="dot"></span>);
    return <div className="face">{dots}</div>;
  };

  return (
    <div className="dice" onClick={roll}>
      {renderDiceFace(value)}
    </div>
  );
}

export default Dice;