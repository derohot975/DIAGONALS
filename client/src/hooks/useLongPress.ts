import { useCallback, useRef, useState } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onPress?: () => void;
  delay?: number;
  scrollThreshold?: number;
}

interface UseLongPressReturn {
  handlers: {
    onMouseDown: (event: React.MouseEvent) => void;
    onMouseUp: (event: React.MouseEvent) => void;
    onMouseLeave: (event: React.MouseEvent) => void;
    onTouchStart: (event: React.TouchEvent) => void;
    onTouchMove: (event: React.TouchEvent) => void;
    onTouchEnd: (event: React.TouchEvent) => void;
  };
  isLongPressing: boolean;
}

export const useLongPress = ({
  onLongPress,
  onPress,
  delay = 800,
  scrollThreshold = 8,
}: UseLongPressOptions): UseLongPressReturn => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const didScroll = useRef(false);
  const longPressTriggered = useRef(false);

  const startTouch = useCallback((event: React.TouchEvent) => {
    // NON chiamare preventDefault() — lascia che il browser gestisca lo scroll nativamente
    didScroll.current = false;
    longPressTriggered.current = false;

    if (event.touches.length > 0) {
      startPos.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }

    setIsLongPressing(true);

    timeout.current = setTimeout(() => {
      if (!didScroll.current) {
        longPressTriggered.current = true;
        onLongPress();
      }
      setIsLongPressing(false);
    }, delay);
  }, [onLongPress, delay]);

  const onTouchMove = useCallback((event: React.TouchEvent) => {
    if (!startPos.current || event.touches.length === 0) return;

    const dx = Math.abs(event.touches[0].clientX - startPos.current.x);
    const dy = Math.abs(event.touches[0].clientY - startPos.current.y);

    if (dx > scrollThreshold || dy > scrollThreshold) {
      didScroll.current = true;
      setIsLongPressing(false);
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = undefined;
      }
    }
  }, [scrollThreshold]);

  const onTouchEnd = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }
    setIsLongPressing(false);

    if (!didScroll.current && !longPressTriggered.current && onPress) {
      onPress();
    }

    startPos.current = null;
    didScroll.current = false;
    longPressTriggered.current = false;
  }, [onPress]);

  // Mouse handlers (solo desktop)
  const onMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    longPressTriggered.current = false;
    setIsLongPressing(true);
    timeout.current = setTimeout(() => {
      longPressTriggered.current = true;
      onLongPress();
      setIsLongPressing(false);
    }, delay);
  }, [onLongPress, delay]);

  const onMouseUp = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }
    setIsLongPressing(false);
    if (!longPressTriggered.current && onPress) onPress();
    longPressTriggered.current = false;
  }, [onPress]);

  const onMouseLeave = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }
    setIsLongPressing(false);
    longPressTriggered.current = false;
  }, []);

  return {
    handlers: { onMouseDown, onMouseUp, onMouseLeave, onTouchStart: startTouch, onTouchMove, onTouchEnd },
    isLongPressing
  };
};
