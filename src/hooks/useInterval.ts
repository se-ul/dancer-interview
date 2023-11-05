import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, interval: number) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const intervalId = setInterval(() => {
      callbackRef.current();
    }, interval);
    return () => {
      clearInterval(intervalId);
    };
  }, [interval]);
}
