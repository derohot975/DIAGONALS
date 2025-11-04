import { useCallback, useRef, useState } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onPress?: () => void;
  delay?: number;
}

interface UseLongPressReturn {
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseUp: (event: React.MouseEvent) => void;
  onMouseLeave: (event: React.MouseEvent) => void;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  isLongPressing: boolean;
}

export const useLongPress = ({
  onLongPress,
  onPress,
  delay = 800
}: UseLongPressOptions): UseLongPressReturn => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();
  const target = useRef<EventTarget | null>(null);

  const start = useCallback((event: Event) => {
    // Previeni il comportamento di default (selezione testo, context menu, etc.)
    event.preventDefault();
    
    target.current = event.target;
    setIsLongPressing(true);
    
    timeout.current = setTimeout(() => {
      onLongPress();
      setIsLongPressing(false);
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback((event: Event, shouldTriggerPress = true) => {
    // Clear timeout
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }
    
    setIsLongPressing(false);
    
    // Se il long press non è stato completato e abbiamo un onPress, eseguilo
    if (shouldTriggerPress && onPress && target.current === event.target) {
      onPress();
    }
    
    target.current = null;
  }, [onPress]);

  return {
    onMouseDown: (event: any) => start(event),
    onMouseUp: (event: any) => clear(event),
    onMouseLeave: (event: any) => clear(event, false),
    onTouchStart: (event: any) => start(event),
    onTouchEnd: (event: any) => clear(event),
    isLongPressing
  };
};
