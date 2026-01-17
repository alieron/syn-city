import { useState } from 'react';
import StartScreen from './components/StartScreen';
import './App.css';

type Screen = 'start' | 'game' | 'end';

interface GameConfig {
  startWord: string;
  targetWord: string;
  playerName: string;
}

function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);

  const startGame = (config: GameConfig) => {
    setGameConfig(config);
    setScreen('game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      {screen === 'start' && <StartScreen onStart={startGame} />}
      {screen === 'game' && gameConfig && (
        <div className="flex items-center justify-center min-h-screen text-white text-2xl">
          Game Screen Coming Soon!
          <br />
          Start: {gameConfig.startWord} → Target: {gameConfig.targetWord}
        </div>
      )}
    </div>
  );
}

export default App;
