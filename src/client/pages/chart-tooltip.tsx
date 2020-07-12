import clsx from 'clsx';
import {useMemo} from 'react';
import {atom, useRecoilValue} from 'recoil';

export const tooltipConfigState = atom({
  key: 'tooltipConfigState',
  default: null,
});

export const tooltipVisibleState = atom({
  key: 'tooltipVisibleState',
  default: false,
});

export interface TooltipConfig {
  evt: MouseEvent;
  title: string;
  value: string;
}

export function ChartTooltip() {
  const config = useRecoilValue(tooltipConfigState) || {};
  const isVisible = useRecoilValue(tooltipVisibleState);

  const rootStyle = useMemo(() => {
    const {evt} = config;

    if (evt) {
      const tooltipXSpace = 200;
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;
      const {pageX, pageY, clientY} = evt;

      const styles: any = {};

      let top: number;
      if (clientY - 20 < 0) {
        top = 10 - clientY + pageY;
      } else if (clientY + 70 > winHeight) {
        top = pageY - clientY + winHeight - 80;
      } else {
        top = pageY - 10;
      }
      styles.top = `${top}px`;

      if (pageX + 10 + tooltipXSpace < winWidth) {
        styles.left = `${pageX + 10}px`;
      } else {
        styles.right = `${winWidth - pageX + 10}px`;
      }

      return styles;
    }
    return {};
  }, [config]);

  return (
    <>
      <div className={clsx('root', isVisible && 'visible')} style={rootStyle}>
        <div className="title">{config.title || ''}</div>
        <div className="value">{config.value || ''}</div>
      </div>
      <style jsx>{`
        .root {
          position: absolute;
          pointer-events: none;
          opacity: 0;
          transition: all 0.2s;
          padding: 8px;
          box-shadow: rgba(67, 90, 111, 0.3) 0px 0px 1px, rgba(67, 90, 111, 0.47) 0px 4px 10px -4px;
          background: #fff;
          z-index: 100;
          max-width: 200px;
        }
        .root.visible {
          opacity: 1;
        }
        .title {
          font-size: 14px;
          line-height: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--n9);
        }
        .value {
          margin-top: 4px;
          font-weight: 500;
          color: var(--n9);
          font-size: 15px;
        }
      `}</style>
    </>
  );
}
