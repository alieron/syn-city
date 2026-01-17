import { useState, useEffect, useRef } from 'react';

interface SynonymWithDefinition {
  word: string;
  definition: string;
}

interface Props {
  previousWord: string | null;
  currentWord: string;
  targetWord: string;
  synonyms: SynonymWithDefinition[];
  isLoading: boolean;
  onSelectWord: (word: string) => void;
}

export default function BubbleGraph({
  previousWord,
  currentWord,
  targetWord,
  synonyms,
  isLoading,
  onSelectWord,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const clickTimeoutRef = useRef<number | undefined>(undefined);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleSynonymClick = (synonym: SynonymWithDefinition, index: number) => {
    if (synonym.word === 'No synonyms found' || synonym.word === 'Error loading synonyms') {
      return;
    }
    setSelectedIndex(index);
    
    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    // Delay the word selection to allow animation to play
    clickTimeoutRef.current = window.setTimeout(() => {
      onSelectWord(synonym.word);
      setSelectedIndex(null);
      clickTimeoutRef.current = undefined;
    }, 400);
  };

  // Calculate positions for synonym bubbles in an arc pattern
  const getSynonymPosition = (index: number, total: number) => {
    const arcWidth = 70; // Percentage of container width
    const arcHeight = 30; // Vertical offset from bottom
    const startAngle = -30; // Degrees
    const endAngle = 30; // Degrees
    
    const angleRange = endAngle - startAngle;
    const angle = startAngle + (angleRange * index) / Math.max(total - 1, 1);
    const radians = (angle * Math.PI) / 180;
    
    const centerX = 50;
    const x = centerX + Math.sin(radians) * arcWidth / 2;
    const y = 70 + Math.cos(radians) * arcHeight;
    
    return { x, y };
  };

  const isTargetWord = (word: string) => word.toLowerCase() === targetWord.toLowerCase();

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {/* Lines from current word to synonyms */}
        {!isLoading && synonyms.length > 0 && synonyms[0].word !== 'No synonyms found' && (
          <>
            {synonyms.map((_, index) => {
              const pos = getSynonymPosition(index, synonyms.length);
              const opacity = selectedIndex !== null && selectedIndex !== index ? 0 : 0.3;
              return (
                <line
                  key={`line-current-${index}`}
                  x1="50%"
                  y1="50%"
                  x2={`${pos.x}%`}
                  y2={`${pos.y}%`}
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  opacity={opacity}
                  className="transition-opacity duration-300"
                />
              );
            })}
          </>
        )}
        
        {/* Line from previous word to current word */}
        {previousWord && (
          <line
            x1="50%"
            y1="15%"
            x2="50%"
            y2="50%"
            stroke="url(#gradient)"
            strokeWidth="2"
            opacity="0.3"
          />
        )}
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* Previous Word Bubble (Small, Top) */}
      {previousWord && (
        <div
          className="absolute transition-all duration-500"
          style={{
            left: '50%',
            top: '5%',
            transform: 'translate(-50%, 0)',
            zIndex: 1,
          }}
        >
          <div className="bg-gradient-to-r from-purple-400/50 to-pink-400/50 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <p className="text-white font-medium text-sm">{previousWord}</p>
          </div>
        </div>
      )}

      {/* Current Word Bubble (Large, Center) */}
      <div
        className="absolute transition-all duration-500"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
        }}
      >
        <div
          className={`bg-gradient-to-r ${
            isTargetWord(currentWord)
              ? 'from-green-400 to-emerald-400'
              : 'from-purple-500 to-pink-500'
          } rounded-full px-12 py-8 shadow-2xl`}
        >
          <div className="text-center">
            <p className="text-white/80 text-sm mb-1">Current Word</p>
            <p className="text-white font-bold text-4xl">{currentWord}</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute" style={{ left: '50%', top: '75%', transform: 'translate(-50%, -50%)', zIndex: 3 }}>
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading synonyms...</p>
          </div>
        </div>
      )}

      {/* Synonym Bubbles (Medium, Bottom, Arc Pattern) */}
      {!isLoading && synonyms.length > 0 && (
        <>
          {synonyms.map((synonym, index) => {
            const pos = getSynonymPosition(index, synonyms.length);
            const isDisabled = synonym.word === 'No synonyms found' || synonym.word === 'Error loading synonyms';
            const isTarget = isTargetWord(synonym.word);
            const isSelected = selectedIndex === index;
            const shouldHide = selectedIndex !== null && selectedIndex !== index;
            
            return (
              <div
                key={index}
                className={`absolute transition-all duration-300 ${
                  shouldHide ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
                } ${isSelected ? 'scale-110' : ''}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 3,
                }}
              >
                <button
                  onClick={() => handleSynonymClick(synonym, index)}
                  disabled={isDisabled}
                  className={`bg-gradient-to-r ${
                    isTarget
                      ? 'from-green-400 to-emerald-400 ring-4 ring-green-300 animate-pulse'
                      : 'from-purple-400 to-pink-400'
                  } rounded-full px-8 py-4 shadow-xl hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  <div className="text-center max-w-[200px]">
                    <p className="text-white font-bold text-lg mb-1">{synonym.word}</p>
                    <p className="text-white/90 text-xs line-clamp-2">{synonym.definition}</p>
                  </div>
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
