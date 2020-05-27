import clsx from 'clsx';
import {useMemo} from 'react';

export interface TooltipConfig {
  x: number;
  y: number;
  title: string;
  value: string;
}

interface Props {
  config: TooltipConfig | null;
}

export function Tooltip(props: Props) {
  const {config: configMaybe} = props;
  const config: Partial<TooltipConfig> = configMaybe || {};

  const rootStyle = useMemo(() => {
    const {x, y} = config;
    if (typeof x === 'number' && typeof y === 'number') {
      return {
        top: `${y - 10}px`,
        left: `${x + 10}px`,
      };
    }
    return {};
  }, [config]);

  return (
    <>
      <div className={clsx('root', configMaybe && 'visible')} style={rootStyle}>
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
        }
        .root.visible {
          opacity: 1;
        }
        .title {
          font-size: 14px;
          line-height: 1;
          max-width: 200px;
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
