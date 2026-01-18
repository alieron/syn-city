import { useState, useCallback } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import QuitScreen from './components/QuitScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import './App.css';

type Screen = 'start' | 'game' | 'end' | 'quit' | 'leaderboard';

interface GameConfig {
  startWord: string;
  targetWord: string;
  playerName: string;
  gameId: string;
  shortestPath?: string[];
  shortestPathString?: string;
  optimalDistance?: number;
}

interface LeaderboardEntry {
  playerName: string;
  timeSeconds: number;
  moves: number;
  optimalDistance: number;
  score: number;
}

function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameResult, setGameResult] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoaded, setLeaderboardLoaded] = useState(false);

  const startGame = (config: GameConfig) => {
    setGameConfig(config);
    setScreen('game');
  };

  const endGame = async (result: any) => {
    setGameResult(result);
    if (result.quit) {
      setScreen('quit');
    } else {
      // Record leaderboard entry in Redis
      if (result.playerName && result.timeSeconds !== undefined && result.moves !== undefined && result.optimalDistance) {
        try {
          await fetch('/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerName: result.playerName,
              timeSeconds: result.timeSeconds,
              moves: result.moves,
              optimalDistance: result.optimalDistance,
            }),
          });
        } catch (e) {
          // Optionally handle error
        }
      }
      setScreen('end');
    }
  };
  const showLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
        setLeaderboardLoaded(true);
      }
    } catch (e) {
      // Optionally handle error
    }
    setScreen('leaderboard');
  }, []);

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
        <EndScreen result={gameResult} onRestart={restart} onShowLeaderboard={showLeaderboard} />
      )}
      {screen === 'leaderboard' && (
        <LeaderboardScreen leaderboard={leaderboard} onRestart={restart} />
      )}
      {screen === 'quit' && gameResult && (
        <QuitScreen result={gameResult} onRestart={restart} />
      )}
    </div>
  );
}

export default App;