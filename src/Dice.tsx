import './Dice.css'; // Ensure you have a Dice.css file in the same directory

function Dice({ value, rolling }: { value: number, rolling: boolean }) {
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

    const dots = positions[value].map((pos, i) => <span key={i} className={`dot ${pos}`}></span>);
    return <div className="face">{dots}</div>;
  };

  return (
    <div className={`dice ${rolling ? 'rolling' : ''}`}>
      {renderDiceFace(value)}
    </div>
  );
}

export default Dice;
