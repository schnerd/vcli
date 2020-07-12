import React, {useRef, useEffect} from 'react';
import ReactDOM from 'react-dom';

const portalContainerMap = new WeakMap<Document, HTMLDivElement>();

export interface PortalProps {
  children: React.ReactNode;
}

/**
 * usePortalContainer
 * Provides a portal container for parent document, lazily creating
 * and mounting one if necessary. This allows us to utilize the portal
 * container without using the <Portal> component, which is helpful for
 * 3rd party libraries like react-select.
 * Note: Invoking this hook has DOM side effects on the client
 */
export function usePortalContainer() {
  if (typeof document === 'undefined') return null;

  let portalContainer = portalContainerMap.get(document);

  // Lazily instantiate and cache
  if (!portalContainer) {
    portalContainer = document.createElement('div');
    portalContainer.setAttribute('vcli-portal-container', '');
    document.body.append(portalContainer);
    portalContainerMap.set(document, portalContainer);
  }

  return portalContainer || null;
}

export default function Portal(props: PortalProps) {
  const {children} = props;

  const portalContainer = usePortalContainer();
  const elRef = useRef<HTMLDivElement>(null as any);

  useEffect(
    () => {
      return function unmountPortal() {
        if (portalContainer && elRef.current) {
          portalContainer.removeChild(elRef.current);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (!portalContainer) return null;
  if (!elRef.current) {
    elRef.current = (portalContainer.ownerDocument as Document).createElement('div');
    portalContainer.append(elRef.current);
  }

  return ReactDOM.createPortal(children, elRef.current);
}
