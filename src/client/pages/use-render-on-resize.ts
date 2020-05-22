import debounce from 'lodash/debounce';
import {RefObject, useEffect, useState} from 'react';

export function useRenderOnResize(ref: RefObject<any>) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    let cb = debounce(() => {
      if (ref.current) {
        setRect(ref.current.getBoundingClientRect());
      }
    }, 100);
    window.addEventListener('resize', cb);
    return () => {
      window.removeEventListener('resize', cb);
    };
  }, []);

  return rect;
}
