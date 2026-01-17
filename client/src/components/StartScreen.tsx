import { useState } from 'react';

interface Props {
  onStart: (config: { startWord: string; targetWord: string; playerName: string }) => void;
}

export default function StartScreen({ onStart }: Props) {
  const [name, setName] = useState('');

  // Mock puzzles (backend will provide these later)
  const puzzles = [
    { id: 1, start: 'happy', end: 'sad', difficulty: 'easy' },
    { id: 2, start: 'big', end: 'small', difficulty: 'medium' },
    { id: 3, start: 'begin', end: 'finish', difficulty: 'hard' },
  ];

  const handleStart = (puzzle: typeof puzzles[0]) => {
    if (!name.trim()) {
      alert('Please enter your name!');
      return;
    }
    onStart({
      startWord: puzzle.start,
      targetWord: puzzle.end,
      playerName: name,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          🎯 Synonym Sprint
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Race through synonyms to reach the target word!
        </p>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-6 focus:outline-none focus:border-purple-500"
        />

        <h2 className="text-xl font-semibold mb-4">Choose a puzzle:</h2>
        
        <div className="space-y-3">
          {puzzles.map((puzzle) => (
            <button
              key={puzzle.id}
              onClick={() => handleStart(puzzle)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg hover:opacity-90 transition"
            >
              <div className="flex justify-between items-center px-4">
                <span className="font-semibold">
                  {puzzle.start} → {puzzle.end}
                </span>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {puzzle.difficulty}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
