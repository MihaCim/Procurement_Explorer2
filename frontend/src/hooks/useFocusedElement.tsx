import { useEffect, useState } from 'react';

const useFocusedElement = (elem?: HTMLDivElement | null) => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    const onFocus = (event: FocusEvent) => {
      setFocusedElement(event.target as HTMLElement);
    };

    if (elem) {
      elem?.addEventListener('focus', onFocus, true);
    } else {
      document.addEventListener('focus', onFocus, true);
    }

    return () => {
      if (elem) {
        elem.removeEventListener('focus', onFocus, true);
      } else {
        document.removeEventListener('focus', onFocus, true);
      }
    };
  }, [elem]);

  return focusedElement;
};

export default useFocusedElement;
