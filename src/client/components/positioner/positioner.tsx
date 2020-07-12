import React, {PureComponent} from 'react';
import css from 'styled-jsx/css';
import Transition, {TransitionStatus} from 'react-transition-group/Transition';
import Portal from '../portal/portal';
import Layer from '../layer/layer';
import LayeringOrder from '../layer/layering-order';
import Position, {PositionsUnion} from './positions';
import getPosition from './get-position';

export const rootStyles = css`
  div {
    position: fixed;
    opacity: 0;
    transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.175);
    transition-property: opacity, transform;
    transform: scale(0.9) translateY(-1px);
  }
  div[data-state='entering'],
  div[data-state='entered'] {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
  }
  div[data-state='exiting'] {
    opacity: 0;
    transform: scale(1);
  }
`;

const getInitialState = (): State => ({
  top: null,
  left: null,
  transformOrigin: null,
});

export interface PositionerChildrenArgs {
  top: number | null;
  left: number | null;
  state: TransitionStatus;
  zIndex: number;
  stylesJsx: any;
  style: {
    transformOrigin: string | null;
    transitionDuration: string;
    left: number | null;
    top: number | null;
    zIndex: number;
  };
  animationDuration: number;
}

export interface PositionerProps {
  /**
   * The position the element that is being positioned is on.
   * Smart positioning might override this.
   */
  position: PositionsUnion;

  /**
   * When true, show the element being positioned.
   */
  isShown: boolean;

  /**
   * Function that returns the element being positioned.
   */
  children: (args: PositionerChildrenArgs) => React.ReactNode;

  /**
   * Function that returns the ref of the element being positioned.
   */
  bodyRef: React.RefObject<HTMLElement>;

  /**
   * Ref for element target element
   */
  targetRef: React.RefObject<HTMLElement>;

  /**
   * The minimum distance from the body to the element being positioned.
   */
  bodyOffset: number;

  /**
   * The minimum distance from the target to the element being positioned.
   */
  targetOffset: number;

  /**
   * Duration of the animation.
   */
  animationDuration: number;

  /**
   * Function that will be called when the exit transition is complete.
   */
  onCloseComplete: () => void;

  /**
   * Function that will be called when the enter transition is complete.
   */
  onOpenComplete: () => void;
}

interface State {
  left: number | null;
  top: number | null;
  transformOrigin: string | null;
}

export default class Positioner extends PureComponent<PositionerProps, State> {
  static defaultProps = {
    position: Position.BOTTOM,
    bodyOffset: 6,
    targetOffset: 6,
    animationDuration: 300,
    onOpenComplete: () => {},
    onCloseComplete: () => {},
  };

  latestAnimationFrame: number | null = null;

  constructor(props: PositionerProps, context: any) {
    super(props, context);
    this.state = getInitialState();
  }

  componentWillUnmount() {
    if (this.latestAnimationFrame) {
      cancelAnimationFrame(this.latestAnimationFrame);
    }
  }

  handleEnter = () => {
    this.update();
  };

  update = (prevHeight = 0, prevWidth = 0) => {
    const {targetRef, bodyRef} = this.props;
    if (!this.props.isShown || !targetRef.current || !bodyRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const hasEntered = bodyRef.current.getAttribute('data-state') === 'entered';

    const viewportHeight = document.documentElement.clientHeight;
    const viewportWidth = document.documentElement.clientWidth;

    let height!: number;
    let width!: number;
    if (hasEntered) {
      // Only when the animation is done should we opt-in to `getBoundingClientRect`
      const bodyRect = bodyRef.current.getBoundingClientRect();

      // https://github.com/segmentio/evergreen/issues/255
      // We need to ceil the width and height to prevent jitter when
      // the window is zoomed (when `window.devicePixelRatio` is not an integer)
      height = Math.round(bodyRect.height);
      width = Math.round(bodyRect.width);
    } else {
      // When the animation is in flight use `offsetWidth/Height` which
      // does not calculate the `transform` property as part of its result.
      // There is still change on jitter during the animation (although unoticable)
      // When the browser is zoomed in — we fix this with `Math.max`.
      height = Math.max(bodyRef.current.offsetHeight, prevHeight);
      width = Math.max(bodyRef.current.offsetWidth, prevWidth);
    }

    const {rect, transformOrigin} = getPosition({
      position: this.props.position,
      targetRect,
      targetOffset: this.props.targetOffset,
      dimensions: {
        height,
        width,
      },
      viewport: {
        width: viewportWidth,
        height: viewportHeight,
      },
      viewportOffset: this.props.bodyOffset,
    });

    this.setState(
      {
        left: rect.left,
        top: rect.top,
        transformOrigin,
      },
      () => {
        this.latestAnimationFrame = requestAnimationFrame(() => {
          this.update(height, width);
        });
      },
    );
  };

  handleExited = () => {
    this.setState(
      () => {
        return {
          ...getInitialState(),
        };
      },
      () => {
        this.props.onCloseComplete();
      },
    );
  };

  render() {
    const {isShown, children, animationDuration} = this.props;

    const {left, top, transformOrigin} = this.state;

    return (
      <Layer value={LayeringOrder.POSITIONER}>
        {(zIndex) => {
          return (
            <Transition
              appear
              in={isShown}
              timeout={animationDuration}
              onEnter={this.handleEnter}
              onEntered={this.props.onOpenComplete}
              onExited={this.handleExited}
              unmountOnExit
            >
              {(state) => (
                <Portal>
                  {children({
                    top,
                    left,
                    state,
                    zIndex,
                    stylesJsx: rootStyles,
                    style: {
                      transformOrigin,
                      transitionDuration: `${animationDuration}ms`,
                      left,
                      top,
                      zIndex,
                    },
                    animationDuration,
                  })}
                </Portal>
              )}
            </Transition>
          );
        }}
      </Layer>
    );
  }
}
