import WordGraph from './WordGraph';
import { useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { useTimer } from '../hooks/useTimer';

interface GameResult {
  playerName: string;
  path: string[];
  moves: number;
  timeSeconds: number;
}

interface Props {
  startWord: string;
  targetWord: string;
  playerName: string;
  gameId: string;
  onComplete: (result: GameResult) => void;
}

export default function GameScreen({ startWord, targetWord, playerName, gameId, onComplete }: Props) {
  const game = useGame(startWord, targetWord, gameId);
  const timer = useTimer(!game.isComplete);

  useEffect(() => {
    game.fetchWords(startWord);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (game.isComplete) {
      onComplete({
        playerName,
        path: game.path,
        moves: game.clickCount,
        timeSeconds: timer.seconds,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.isComplete]);

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