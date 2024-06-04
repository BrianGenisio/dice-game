import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import GameBoard from './GameBoard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games/:gameId" element={<GameBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
