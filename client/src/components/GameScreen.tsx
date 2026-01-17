import WordGraph from './WordGraph';
import BubbleGraph from './BubbleGraph';
import { useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { useTimer } from '../hooks/useTimer';

interface Props {
  startWord: string;
  targetWord: string;
  playerName: string;
  onComplete: (result: any) => void;
}

export default function GameScreen({ startWord, targetWord, playerName, onComplete }: Props) {
  const game = useGame(startWord, targetWord);
  const timer = useTimer(!game.isComplete);

  useEffect(() => {
    game.fetchSynonyms(startWord);
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
  }, [game.isComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="bg-white rounded-t-2xl shadow-xl p-6 w-full max-w-2xl">
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

      {/* Bubble Graph */}
      <div className="bg-white shadow-xl w-full max-w-2xl">
        <BubbleGraph
          previousWord={game.path.length > 1 ? game.path[game.path.length - 2] : null}
          currentWord={game.currentWord}
          targetWord={targetWord}
          synonyms={game.synonyms}
          isLoading={game.isLoading}
          onSelectWord={game.selectWord}
        />
      </div>

      {/* Word Relationship Graph */}
      <div className="bg-white shadow-xl p-6 w-full max-w-2xl">
        <p className="text-sm text-gray-600 mb-2">Your Journey:</p>
        <WordGraph 
          path={game.path} 
          currentWord={game.currentWord}
          targetWord={targetWord}
        />
      </div>

      {/* Path Tracker */}
      <div className="bg-white rounded-b-2xl shadow-xl p-6 w-full max-w-2xl">
        <p className="text-sm text-gray-600 mb-2">Your path:</p>
        <div className="flex flex-wrap gap-2">
          {game.path.map((word, index) => (
            <div key={index} className="flex items-center">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                {word}
              </span>
              {index < game.path.length - 1 && (
                <span className="text-gray-400 mx-2">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
