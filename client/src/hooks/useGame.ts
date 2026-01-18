import { useState, useCallback, useEffect } from 'react';

export interface WordWithMetadata {
  word: string;
  definition: string;
  type: 'synonym' | 'antonym' | 'related';
}

interface GameState {
  currentWord: string;
  targetWord: string;
  path: string[];
  words: WordWithMetadata[];
  isLoading: boolean;
  isComplete: boolean;
  proximity: number; // -1.0 to 1.0, cosine similarity (hot to cold thermometer)
  clickCount: number; // total node clicks
  shortestPath?: string[];
  shortestPathString?: string;
  optimalDistance?: number;
}

export function useGame(
  startWord: string,
  targetWord: string,
  gameId: string,
  shortestPath?: string[],
  shortestPathString?: string,
  optimalDistance?: number
) {
  // If shortestPath is not provided but shortestPathString is, split and trim it
  let derivedShortestPath: string[] | undefined = shortestPath;
  if ((!shortestPath || shortestPath.length === 0) && shortestPathString) {
    derivedShortestPath = shortestPathString.split('->').map(w => w.trim()).filter(Boolean);
  }
  // If optimalDistance is not provided, derive from path
  let derivedOptimalDistance = optimalDistance;
  if (derivedOptimalDistance === undefined && derivedShortestPath) {
    derivedOptimalDistance = derivedShortestPath.length > 0 ? derivedShortestPath.length - 1 : -1;
  }

  // Log the shortest path, string, and optimal distance at first instance
  if (derivedShortestPath || shortestPathString || derivedOptimalDistance !== undefined) {
    console.log('[useGame] Shortest path:', derivedShortestPath);
    console.log('[useGame] Shortest path string:', shortestPathString);
    console.log('[useGame] Optimal distance:', derivedOptimalDistance);
  }
  const [state, setState] = useState<GameState>({
    currentWord: startWord,
    targetWord,
    path: [startWord],
    words: [],
    isLoading: false,
    isComplete: false,
    proximity: 0,
    clickCount: 0,
    shortestPath: derivedShortestPath,
    shortestPathString,
    optimalDistance: derivedOptimalDistance,
  });

  // No duplicate /api/start call. Shortest path is passed in props/state.

  const calculateProximity = useCallback(async (word: string): Promise<number> => {
    try {
      const response = await fetch('/api/similarity', {
        headers: {
          'X-Game-Id': gameId,
          'X-Current-Word': word,
        },
      });

      if (!response.ok) {
        console.error('Similarity API error:', response.status, await response.text());
        return 0;
      }

      const data = await response.json();
      console.log('Similarity data:', data);

      // Use cosine similarity directly (-1.0 to 1.0)
      const similarity = typeof data.similarity === 'number' ? data.similarity : 0;
      return similarity;
    } catch (error) {
      console.error('Failed to calculate proximity:', error);
      return 0;
    }
  }, [gameId]);

  const fetchWords = useCallback(async (word: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/next', {
        headers: {
          'X-Game-Id': gameId,
          'X-Current-Word': word,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }

      const data = await response.json();

      // Map backend response to WordWithMetadata format
      const synonyms: WordWithMetadata[] = (data.synonyms || []).map((word: string) => ({
        word,
        definition: 'Synonym',
        type: 'synonym' as const,
      }));

      const antonyms: WordWithMetadata[] = (data.antonyms || []).map((word: string) => ({
        word,
        definition: 'Antonym',
        type: 'antonym' as const,
      }));

      const related: WordWithMetadata[] = (data.related || []).map((word: string) => ({
        word,
        definition: 'Related word',
        type: 'related' as const,
      }));

      const allWords = [...synonyms, ...antonyms, ...related];

      // Calculate proximity to target
      const proximity = await calculateProximity(word);

      setState(prev => ({
        ...prev,
        words: allWords.length > 0
          ? allWords
          : [{ word: 'No words found', definition: '', type: 'synonym' }],
        isLoading: false,
        proximity,
      }));
    } catch (error) {
      console.error('Failed to fetch words:', error);
      setState(prev => ({
        ...prev,
        words: [{ word: 'Error loading words', definition: '', type: 'synonym' }],
        isLoading: false
      }));
    }
  }, [gameId, calculateProximity]);

  const selectWord = useCallback((word: string) => {
    if (word === 'No words found' || word === 'Error loading words') {
      return;
    }

    setState(prev => {
      const newPath = [...prev.path, word];
      const isComplete = word.toLowerCase() === prev.targetWord.toLowerCase();
      return {
        ...prev,
        currentWord: word,
        path: newPath,
        isComplete,
        clickCount: prev.clickCount + 1,
      };
    });

    if (word.toLowerCase() !== state.targetWord.toLowerCase()) {
      fetchWords(word);
    }
  }, [state.targetWord, fetchWords]);

  const revertToWord = useCallback((word: string, index: number) => {
    setState(prev => {
      const newPath = prev.path.slice(0, index + 1);
      return {
        ...prev,
        currentWord: word,
        path: newPath,
        isComplete: false,
        clickCount: prev.clickCount + 1,
      };
    });
    fetchWords(word);
  }, [fetchWords]);

  return {
    ...state,
    fetchWords,
    selectWord,
    revertToWord,
  };
}
