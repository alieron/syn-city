import { useState } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import './App.css';

type Screen = 'start' | 'game' | 'end';

interface GameConfig {
  startWord: string;
  targetWord: string;
  playerName: string;
  gameId: string;
}

function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameResult, setGameResult] = useState<any>(null);

  const startGame = (config: GameConfig) => {
    setGameConfig(config);
    setScreen('game');
  };

  const endGame = (result: any) => {
    setGameResult(result);
    setScreen('end');
  };

  const restart = () => {
    setGameConfig(null);
    setGameResult(null);
    setScreen('start');
  };

  return (
    <div className="min-h-screen bg-maroon-950">
      {screen === 'start' && <StartScreen onStart={startGame} />}
      {screen === 'game' && gameConfig && (
        <GameScreen
          startWord={gameConfig.startWord}
          targetWord={gameConfig.targetWord}
          playerName={gameConfig.playerName}
          gameId={gameConfig.gameId}
          onComplete={endGame}
        />
      )}
      {screen === 'end' && gameResult && (
        <EndScreen result={gameResult} onRestart={restart} />
      )}
    </div>
  );
}

export default App;