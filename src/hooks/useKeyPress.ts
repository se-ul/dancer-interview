import { useEffect } from "react";

export function useKeyPress(
  targetKey: string,
  callback: (event: KeyboardEvent) => void
) {
  useEffect(() => {
    function downHandler(event: KeyboardEvent) {
      if (event.key === targetKey) {
        callback(event);
      }
    }

    window.addEventListener("keydown", downHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  }, [targetKey, callback]);
}
