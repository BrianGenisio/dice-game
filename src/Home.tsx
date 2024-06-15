import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveGameState } from './models/GameState';
import { getUserId } from './models/Player';
import { createGame } from './business-logic/gameLogic';
import './Home.css'; // Import the CSS file for styling

const NumberInput = ({ label, value, onChange }: { label: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <label className="number-input">
    {label}
    <input type="number" value={value} onChange={onChange} />
  </label>
);

function Home() {
  const [maxNumberOfPlayers, setMaxNumberOfPlayers] = useState(2);
  const [scoreGoal, setScoreGoal] = useState(5000);
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    const userId = getUserId();
    const { gameId, initialState } = await createGame(maxNumberOfPlayers, scoreGoal, userId);
    await saveGameState(gameId, initialState);
    navigate(`/games/${gameId}`);
  };

  return (
    <div className="centered-container">
      <img src="/Pass-the-cheese.webp" alt="Pass the Cheese" className="header-image" />
      <h1 className="title">Create a New Game</h1>
      <NumberInput label="Maximum Number of Players:" value={maxNumberOfPlayers} onChange={(e) => setMaxNumberOfPlayers(Number(e.target.value))} />
      <NumberInput label="Score Goal:" value={scoreGoal} onChange={(e) => setScoreGoal(Number(e.target.value))} />
      <button onClick={handleCreateGame} className="create-game-button">Create Game</button>
    </div>
  );
}

export default Home;
