import './App.css';
import GameBoard from './GameBoard';


function App() {
  return (
    <div className="App">
      <GameBoard numberOfPlayers={3} scoreGoal={100} />

    </div>
  );
}

export default App;

