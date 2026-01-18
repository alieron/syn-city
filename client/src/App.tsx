import { useState } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import QuitScreen from './components/QuitScreen';
import './App.css';

type Screen = 'start' | 'game' | 'end' | 'quit';

interface GameConfig {
  startWord: string;
  targetWord: string;
  playerName: string;
  gameId: string;
  shortestPath?: string[];
  shortestPathString?: string;
  optimalDistance?: number;
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
    if (result.quit) {
      setScreen('quit');
    } else {
      setScreen('end');
    }
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
          shortestPath={gameConfig.shortestPath}
          shortestPathString={gameConfig.shortestPathString}
          optimalDistance={gameConfig.optimalDistance}
          onComplete={endGame}
        />
      )}
      {screen === 'end' && gameResult && (
        <EndScreen result={gameResult} onRestart={restart} />
      )}
      {screen === 'quit' && gameResult && (
        <QuitScreen result={gameResult} onRestart={restart} />
      )}
    </div>
  );
}

export default App;