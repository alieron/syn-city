import { useState, useCallback } from 'react';

interface SynonymWithDefinition {
  word: string;
  definition: string;
}

interface GameState {
  currentWord: string;
  targetWord: string;
  path: string[];
  synonyms: SynonymWithDefinition[];
  isLoading: boolean;
  isComplete: boolean;
}

export function useGame(startWord: string, targetWord: string) {
  const [state, setState] = useState<GameState>({
    currentWord: startWord,
    targetWord,
    path: [startWord],
    synonyms: [],
    isLoading: false,
    isComplete: false,
  });

  const fetchSynonyms = useCallback(async (word: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Fetch synonyms
      const synonymResponse = await fetch(
        `https://api.datamuse.com/words?rel_syn=${word}&max=8&md=d`
      );
      const synonymData = await synonymResponse.json();
      
      // Map to include definitions (if available)
      const synonymsWithDefs: SynonymWithDefinition[] = synonymData.map((item: any) => ({
        word: item.word,
        definition: item.defs && item.defs.length > 0 
          ? item.defs[0].replace(/^\w+\t/, '') // Remove part of speech prefix
          : 'No definition available'
      }));
      
      setState(prev => ({
        ...prev,
        synonyms: synonymsWithDefs.length > 0 
          ? synonymsWithDefs 
          : [{ word: 'No synonyms found', definition: '' }],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to fetch synonyms:', error);
      setState(prev => ({ 
        ...prev, 
        synonyms: [{ word: 'Error loading synonyms', definition: '' }],
        isLoading: false 
      }));
    }
  }, []);

  const selectWord = useCallback((word: string) => {
    if (word === 'No synonyms found' || word === 'Error loading synonyms') {
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
      };
    });
    
    if (word.toLowerCase() !== state.targetWord.toLowerCase()) {
      fetchSynonyms(word);
    }
  }, [state.targetWord, fetchSynonyms]);

  return {
    ...state,
    fetchSynonyms,
    selectWord,
  };
}
