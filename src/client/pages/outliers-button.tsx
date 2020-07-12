import clsx from 'clsx';
import {MdContentCut} from 'react-icons/md';

interface Props {
  enabled: boolean;
  onClick: () => void;
}

export function OutliersButton(props: Props) {
  return (
    <>
      <div
        className={clsx('root', props.enabled && 'enabled')}
        onClick={props.onClick}
        role="button"
        aria-label="Trim Outliers"
      >
        <MdContentCut />
      </div>
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
      `}</style>
    </>
  );
}
