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
  const target = useRef<EventTarget | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const didScroll = useRef(false);

  const start = useCallback((event: Event) => {
    event.preventDefault();
    target.current = event.target;
    didScroll.current = false;

    if (event instanceof TouchEvent && event.touches.length > 0) {
      startPos.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else {
      startPos.current = null;
    }

    setIsLongPressing(true);

    timeout.current = setTimeout(() => {
      if (!didScroll.current) {
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

  const clear = useCallback((event: Event, shouldTriggerPress = true) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }

    setIsLongPressing(false);

    if (shouldTriggerPress && !didScroll.current && onPress && target.current === event.target) {
      onPress();
    }

    target.current = null;
    startPos.current = null;
    didScroll.current = false;
  }, [onPress]);

  return {
    handlers: {
      onMouseDown: (event: any) => start(event),
      onMouseUp: (event: any) => clear(event),
      onMouseLeave: (event: any) => clear(event, false),
      onTouchStart: (event: any) => start(event),
      onTouchMove,
      onTouchEnd: (event: any) => clear(event),
    },
    isLongPressing
  };
};
