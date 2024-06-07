import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame } from './models/GameState';

const NumberInput = ({ label, value, onChange }: { label: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <label>
    {label}
    <input type="number" value={value} onChange={onChange} />
  </label>
);

function Home() {
  const [maxNumberOfPlayers, setMaxNumberOfPlayers] = useState(2);
  const [scoreGoal, setScoreGoal] = useState(100);
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    const gameId = await createGame(maxNumberOfPlayers, scoreGoal);
    navigate(`/games/${gameId}`);
  };

  return (
    <div>
      <h1>Create a New Game</h1>
      <NumberInput label="Maximum Number of Players:" value={maxNumberOfPlayers} onChange={(e) => setMaxNumberOfPlayers(Number(e.target.value))} />
      <NumberInput label="Score Goal:" value={scoreGoal} onChange={(e) => setScoreGoal(Number(e.target.value))} />
      <button onClick={handleCreateGame}>Create Game</button>
    </div>
  );
}

export default Home;
