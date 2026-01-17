import { useState, useEffect, useRef } from 'react';

export function useTimer(isActive: boolean) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const reset = () => setSeconds(0);
  
  const formattedTime = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  return { seconds, formattedTime, reset };
}
