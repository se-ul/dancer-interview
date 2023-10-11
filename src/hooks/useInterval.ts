import { useEffect } from "react";

export function useInterval(callback: () => void, interval: number) {
  useEffect(() => {
    const intervalId = setInterval(callback, interval);
    return () => {
      clearInterval(intervalId);
    };
  }, [callback, interval]);
}
