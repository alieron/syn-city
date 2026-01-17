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
  onComplete: (result: GameResult) => void;
}

export default function GameScreen({ startWord, targetWord, playerName, onComplete }: Props) {
  const game = useGame(startWord, targetWord);
  const timer = useTimer(!game.isComplete);

  useEffect(() => {
    game.fetchWords(startWord);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only run on mount to initialize game
  }, []);

  useEffect(() => {
    if (game.isComplete) {
      onComplete({
        playerName,
        path: game.path,
        moves: game.path.length - 1,
        timeSeconds: timer.seconds,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only trigger on completion status change
  }, [game.isComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white rounded-t-2xl shadow-xl p-6 w-full max-w-6xl">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Player</p>
            <p className="text-xl font-bold text-purple-600">{playerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Target</p>
            <p className="text-2xl font-bold text-pink-600">{targetWord}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Time</p>
            <p className="text-2xl font-bold text-purple-600">{timer.formattedTime}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Moves</p>
            <p className="text-2xl font-bold text-pink-600">{game.path.length - 1}</p>
          </div>
        </div>
      </div>

      {/* Main Game Area with Interactive Graph */}
      <div className="bg-white shadow-xl w-full max-w-6xl rounded-b-2xl">
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
