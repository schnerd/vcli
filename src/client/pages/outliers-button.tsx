import {useCallback, useState} from 'react';
import clsx from 'clsx';
import {MdContentCut} from 'react-icons/md';
import {Popover} from '../components/popover';
import {useLocalStorage} from '../utils/use-local-storage';

interface Props {
  enabled: boolean;
  onClick: () => void;
}

export function OutliersButton(props: Props) {
  const [hasSeenOutliersButton, setHasSeenOutliersButton] = useLocalStorage('vcliOutliersButton');
  setHasSeenOutliersButton('1');

  const [isFirstView, setIsFirstView] = useState(!hasSeenOutliersButton);
  const onPopoverClose = useCallback(() => {
    setIsFirstView(false);
  }, []);

  const renderPopoverContent = useCallback(
    ({close}) => {
      if (isFirstView) {
        return (
          <div className="outliers-pop-body">
            <div>
              Outliers were detected and automatically removed, click this icon to toggle outliers.
            </div>
            <div role="button" onClick={close} className="outliers-pop-btn">
              Got it
            </div>
          </div>
        );
      }
      return <div className="outliers-pop-body">Toggle outlier removal</div>;
    },
    [isFirstView],
  );

  return (
    <>
      <Popover
        trigger="hover"
        content={renderPopoverContent}
        initialIsShown={isFirstView}
        shouldCloseOnExternalClick={!isFirstView}
        onCloseComplete={onPopoverClose}
      >
        <div
          className={clsx('root', props.enabled && 'enabled')}
          onClick={props.onClick}
          role="button"
          aria-label="Trim Outliers"
        >
          <MdContentCut />
        </div>
      </Popover>
      <style jsx>{`
        .root {
          color: var(--n6);
          cursor: pointer;
        }
        .root:hover {
          color: var(--n7);
        }
        .enabled {
          color: var(--b8);
        }
        .enabled:hover {
          color: var(--b9);
        }
        .enabled :global(svg) {
          filter: drop-shadow(0 0 2px rgba(16, 112, 202, 0.4));
        }

        :global(.outliers-pop-body) {
          max-width: 240px;
          padding: 10px 12px;
          font-size: 14px;
          color: var(--n8);
        }
        :global(.outliers-pop-btn) {
          border: none;
          background: transparent;
          background: var(--n2);
          color: var(--b9);
          cursor: pointer;
          display: inline-block;
          margin-top: 8px;
          font-size: 14px;
          font-weight: 600;
          line-height: 1;
          outline: none;
          padding: 5px 8px;
          border-radius: 3px;
          transition: 0.3s color;
        }
        :global(.outliers-pop-btn:hover) {
          background: var(--n4);
        }
      `}</style>
    </>
  );
}
