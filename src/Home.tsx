import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

function Home() {
  const [numberOfPlayers, setNumberOfPlayers] = useState(2);
  const [scoreGoal, setScoreGoal] = useState(100);
  const navigate = useNavigate();

  const createGame = async () => {
    const gameId = uuidv4().split('-')[0]; // Shorten the UUID
    const gameDocRef = doc(db, 'games', gameId);
    const initialScores = Array.from({ length: numberOfPlayers }, () => 0);
    const initialState = {
      diceValues: Array.from({ length: 6 }, () => 1),
      currentPlayer: 1,
      scores: initialScores,
      gameOver: false,
      rolling: false,
      scoreGoal,
      numberOfPlayers,
    };
    await setDoc(gameDocRef, initialState);
    navigate(`/games/${gameId}`);
  };

  return (
    <div>
      <h1>Create a New Game</h1>
      <label>
        Number of Players:
        <input type="number" value={numberOfPlayers} onChange={(e) => setNumberOfPlayers(Number(e.target.value))} />
      </label>
      <label>
        Score Goal:
        <input type="number" value={scoreGoal} onChange={(e) => setScoreGoal(Number(e.target.value))} />
      </label>
      <button onClick={createGame}>Create Game</button>
    </div>
  );
}

export default Home;
