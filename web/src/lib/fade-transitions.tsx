// ============================================================
// Fade Transition System for Ops App
// Discord-style fadeIn/fadeOut with route transitions
// Drop-in React/TypeScript -- works with React Router v6+
// ============================================================

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
  type CSSProperties,
} from "react";

// ------------------------------------------------------------------
// 1. Core CSS Keyframes (inject once at app root)
// ------------------------------------------------------------------

const FADE_STYLES = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(-4px) scale(0.99);
    }
  }

  @keyframes fadeInSubtle {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes fadeOutSubtle {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  .fade-enter {
    animation: fadeIn 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .fade-exit {
    animation: fadeOut 200ms cubic-bezier(0.4, 0, 1, 1) forwards;
  }

  .fade-enter-subtle {
    animation: fadeInSubtle 250ms ease-out forwards;
  }

  .fade-exit-subtle {
    animation: fadeOutSubtle 180ms ease-in forwards;
  }
`;

/** Call once in your App root to inject keyframes into <head> */
export function injectFadeStyles(): void {
  if (document.getElementById("ops-fade-styles")) return;
  const style = document.createElement("style");
  style.id = "ops-fade-styles";
  style.textContent = FADE_STYLES;
  document.head.appendChild(style);
}

// ------------------------------------------------------------------
// 2. FadeTransition component
// ------------------------------------------------------------------

interface FadeTransitionProps {
  show: boolean;
  children: ReactNode;
  enterDuration?: number;
  exitDuration?: number;
  subtle?: boolean;
  onExited?: () => void;
  onEntered?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function FadeTransition({
  show,
  children,
  enterDuration = 320,
  exitDuration = 200,
  subtle = false,
  onExited,
  onEntered,
  className = "",
  style,
}: FadeTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [animClass, setAnimClass] = useState(
    show ? (subtle ? "fade-enter-subtle" : "fade-enter") : ""
  );

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setAnimClass(subtle ? "fade-enter-subtle" : "fade-enter");
      });
      const t = setTimeout(() => onEntered?.(), enterDuration);
      return () => clearTimeout(t);
    } else if (shouldRender) {
      setAnimClass(subtle ? "fade-exit-subtle" : "fade-exit");
      const t = setTimeout(() => {
        setShouldRender(false);
        onExited?.();
      }, exitDuration);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!shouldRender) return null;

  return (
    <div
      className={`${animClass} ${className}`.trim()}
      style={{
        animationDuration: animClass.includes("enter")
          ? `${enterDuration}ms`
          : `${exitDuration}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ------------------------------------------------------------------
// 3. useFade hook
// ------------------------------------------------------------------

interface UseFadeOptions {
  initialVisible?: boolean;
  enterDuration?: number;
  exitDuration?: number;
}

interface UseFadeReturn {
  visible: boolean;
  animating: boolean;
  fadeIn: () => Promise<void>;
  fadeOut: () => Promise<void>;
  crossFade: (between: () => void | Promise<void>) => Promise<void>;
}

export function useFade(options: UseFadeOptions = {}): UseFadeReturn {
  const {
    initialVisible = false,
    enterDuration = 320,
    exitDuration = 200,
  } = options;
  const [visible, setVisible] = useState(initialVisible);
  const [animating, setAnimating] = useState(false);

  const fadeIn = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      setAnimating(true);
      setVisible(true);
      setTimeout(() => {
        setAnimating(false);
        resolve();
      }, enterDuration);
    });
  }, [enterDuration]);

  const fadeOut = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      setAnimating(true);
      setVisible(false);
      setTimeout(() => {
        setAnimating(false);
        resolve();
      }, exitDuration);
    });
  }, [exitDuration]);

  const crossFade = useCallback(
    async (between: () => void | Promise<void>): Promise<void> => {
      await fadeOut();
      await between();
      await fadeIn();
    },
    [fadeIn, fadeOut]
  );

  return { visible, animating, fadeIn, fadeOut, crossFade };
}

// ------------------------------------------------------------------
// 4. PageTransition -- wraps React Router <Outlet />
//    initialPhase defaults to "idle" so the outer FadeTransition
//    handles the app-level enter; PageTransition only animates
//    subsequent route changes.
// ------------------------------------------------------------------

interface TransitionContextValue {
  requestExit: () => Promise<void>;
}

const TransitionContext = createContext<TransitionContextValue>({
  requestExit: () => Promise.resolve(),
});

export const usePageTransition = () => useContext(TransitionContext);

interface PageTransitionProps {
  children: ReactNode;
  transitionKey: string;
  exitDuration?: number;
  enterDuration?: number;
  /** Starting phase — use "idle" to skip the initial enter animation */
  initialPhase?: "enter" | "idle";
  style?: CSSProperties;
  className?: string;
}

export function PageTransition({
  children,
  transitionKey,
  exitDuration = 200,
  enterDuration = 320,
  initialPhase = "idle",
  style,
  className,
}: PageTransitionProps) {
  const [displayKey, setDisplayKey] = useState(transitionKey);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<"enter" | "exit" | "idle">(initialPhase);

  useEffect(() => {
    if (transitionKey !== displayKey) {
      setPhase("exit");
      setTimeout(() => {
        setDisplayKey(transitionKey);
        setDisplayChildren(children);
        setPhase("enter");
        setTimeout(() => setPhase("idle"), enterDuration);
      }, exitDuration);
    } else {
      setDisplayChildren(children);
    }
  }, [transitionKey, children]);

  const requestExit = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      setPhase("exit");
      setTimeout(() => {
        resolve();
      }, exitDuration);
    });
  }, [exitDuration]);

  const animClass =
    phase === "enter"
      ? "fade-enter"
      : phase === "exit"
        ? "fade-exit"
        : "";

  return (
    <TransitionContext.Provider value={{ requestExit }}>
      <div
        className={[animClass, className].filter(Boolean).join(" ")}
        style={{
          animationDuration:
            phase === "enter" ? `${enterDuration}ms` : `${exitDuration}ms`,
          ...style,
        }}
      >
        {displayChildren}
      </div>
    </TransitionContext.Provider>
  );
}
