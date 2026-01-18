import WordGraph from './WordGraph';
import Thermometer from './Thermometer';
import { useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { useTimer } from '../hooks/useTimer';

interface GameResult {
  playerName: string;
  path: string[];
  moves: number;
  timeSeconds: number;
  proximity?: number;
  shortestPathString?: string;
  optimalDistance?: number;
  quit?: boolean;
}

interface Props {
  startWord: string;
  targetWord: string;
  playerName: string;
  gameId: string;
  shortestPath?: string[];
  shortestPathString?: string;
  optimalDistance?: number;
  onComplete: (result: GameResult) => void;
}

export default function GameScreen({ startWord, targetWord, playerName, gameId, shortestPath, shortestPathString, optimalDistance, onComplete }: Props) {
  const game = useGame(startWord, targetWord, gameId, shortestPath, shortestPathString, optimalDistance);
  const timer = useTimer(!game.isComplete);

  useEffect(() => {
    game.fetchWords(startWord);
    if (shortestPath && shortestPathString) {
      console.log('Shortest path length:', shortestPath.length - 1);
      console.log('Shortest path (solution):', shortestPathString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortestPath, shortestPathString]);

  useEffect(() => {
    if (game.isComplete) {
      onComplete({
        playerName,
        path: game.path,
        moves: game.clickCount,
        timeSeconds: timer.seconds,
        proximity: game.proximity,
        shortestPathString: game.shortestPathString,
        optimalDistance: game.optimalDistance,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.isComplete]);

  const handleQuit = () => {
    onComplete({
      playerName,
      path: game.path,
      moves: game.clickCount,
      timeSeconds: timer.seconds,
      proximity: game.proximity,
      shortestPathString: game.shortestPathString,
      optimalDistance: game.optimalDistance,
      quit: true,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-maroon-50">
      {/* Header */}
      <div className="bg-white rounded-t-2xl shadow-xl p-6 w-full max-w-6xl border-2 border-maroon-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-maroon-700">Player</p>
            <p className="text-xl font-bold text-maroon-900">{playerName}</p>
          </div>
          <div>
            <p className="text-sm text-maroon-700">Target</p>
            <p className="text-2xl font-bold text-maroon-900">{targetWord}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-maroon-700">Time</p>
            <p className="text-2xl font-bold text-maroon-900">{timer.formattedTime}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-maroon-700">Moves</p>
            <p className="text-2xl font-bold text-maroon-900">{game.clickCount}</p>
          </div>
        </div>
        {/* Quit Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleQuit}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            Quit
          </button>
        </div>
      </div>


      {/* Main Game Area with Interactive Graph */}
      <div className="bg-white shadow-xl w-full max-w-6xl rounded-b-2xl border-2 border-t-0 border-maroon-200">
        <WordGraph
          path={game.path}
          currentWord={game.currentWord}
          targetWord={targetWord}
          words={game.words}
          proximity={game.proximity}
          isLoading={game.isLoading}
          onSelectWord={game.selectWord}
          onRevertToWord={game.revertToWord}
        />
      </div>
    </div>
  );
}