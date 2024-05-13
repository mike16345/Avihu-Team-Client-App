import { useEffect, useRef } from "react";

export default function useHold(
  longPressCallback = () => {
  },
  ms = 10
) {
  const timerId = useRef<any>(null);

  useEffect(() => {
    return () => {
      clearInterval(timerId.current);
    };
  }, []);

  return {
    onTouchStart: () => {
      longPressCallback();
      timerId.current = setInterval(() => {
        longPressCallback();
      }, ms);
    },
    onTouchEnd: () => {
      clearInterval(timerId.current);
    },
  };
}
