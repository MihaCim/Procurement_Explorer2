import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useRef,
  useState,
} from 'react';

interface LayoutContextProps {
  layoutRef: React.RefObject<HTMLDivElement | null> | null;
  scrollToSection: (ref: HTMLElement | null) => void;
  isScrollWithinSection: (ref: HTMLElement | null) => boolean;
}

export const LayoutContext = createContext<LayoutContextProps>({
  layoutRef: null,
  scrollToSection: () => {},
  isScrollWithinSection: () => false,
});

export const LayoutProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const layoutRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (layoutRef.current) {
        setScrollPosition(layoutRef.current.scrollTop);
      }
    };

    const currentLayoutRef = layoutRef.current;
    if (currentLayoutRef) {
      currentLayoutRef.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentLayoutRef) {
        currentLayoutRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToSection = useCallback((ref: HTMLElement | null) => {
    console.log('ref scrolling', ref);
    if (ref && layoutRef.current) {
      const yOffset = -64; // Offset to account for fixed headers if needed
      const y =
        ref.getBoundingClientRect().top + layoutRef.current.scrollTop + yOffset;

      console.log('Scrolling to section', y);
      setTimeout(function () {
        layoutRef.current!.scrollTo({ top: y, behavior: 'smooth' });
      }, 2);
    }
  }, []);

  const isScrollWithinSection = useCallback(
    (ref: HTMLElement | null) => {
      const yOffset = -64; // Offset to account for fixed headers if needed
      if (ref && layoutRef.current) {
        const refTop = ref.offsetTop + yOffset;
        const refBottom = refTop + ref.offsetHeight;
        return scrollPosition >= refTop && scrollPosition < refBottom;
      }
      return false;
    },
    [scrollPosition],
  );

  return (
    <div
      className="relative max-w-screen-2xl flex-1 overflow-auto"
      style={{ height: 'calc(100vh - 64px)', scrollbarWidth: 'thin' }}
      ref={layoutRef}
      id="scrollablelayout"
    >
      <LayoutContext.Provider
        value={{ layoutRef, scrollToSection, isScrollWithinSection }}
      >
        {children}
      </LayoutContext.Provider>
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLayoutContext = () => React.useContext(LayoutContext);
