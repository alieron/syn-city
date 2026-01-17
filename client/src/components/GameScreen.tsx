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

      {/* Current Word */}
      <div className="bg-white shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-2">Current Word</p>
          <h2 className="text-5xl font-bold text-gray-800">{game.currentWord}</h2>
        </div>

        {/* Synonyms */}
        {game.isLoading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-4">Loading synonyms...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {game.synonyms.map((synonym, index) => (
              <button
                key={index}
                onClick={() => game.selectWord(synonym.word)}
                disabled={synonym.word === 'No synonyms found' || synonym.word === 'Error loading synonyms'}
                className="bg-gradient-to-r from-purple-400 to-pink-400 text-white p-4 rounded-lg font-semibold hover:scale-105 transition transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-left"
              >
                <div className="font-bold text-lg mb-1">{synonym.word}</div>
                <div className="text-sm text-white/90 line-clamp-2">
                  {synonym.definition}
                </div>
              </button>
            ))}
          </div>
        )}
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
