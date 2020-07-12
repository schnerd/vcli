import React from 'react';
import memoizeOne from 'memoize-one';
import {Positioner, Position, PositionerChildrenArgs, PositionsUnion} from '../positioner';
import {PopoverBody} from './popover-body';

export interface PopoverChildrenArgs {
  toggle: () => void;
  ref: React.RefObject<HTMLElement>;
  isShown: boolean;
}

export interface PopoverProps {
  /**
   * The position the Popover is on. Smart positioning might override this.
   */
  position: PositionsUnion;

  /**
   * When true, the Popover is manually shown.
   */
  isShown?: boolean;

  /**
   * When true, the Popover is shown to begin with
   */
  initialIsShown?: boolean;

  /**
   * Open the Popover based on click or hover. Default is click.
   */
  trigger: 'click' | 'hover';

  /**
   * The content of the Popover.
   */
  content: React.ReactNode | ((args?: {close: () => void}) => React.ReactNode);

  /**
   * The target button of the Popover.
   * When a function the following arguments are passed:
   * ({ toggle: Function -> Void, getRef: Function -> Ref, isShown: Bool })
   */
  children?: React.ReactElement | ((args: PopoverChildrenArgs) => React.ReactElement);

  /**
   * Delay before showing the popover
   */
  enterDelay?: number;

  /**
   * Delay before hiding the popover
   */
  leaveDelay?: number;

  /**
   * Duration of the animation.
   */
  animationDuration?: number;

  /**
   * Function called when the Popover opens.
   */
  onOpen?: () => void;

  /**
   * Function fired when Popover closes.
   */
  onClose?: () => void;

  /**
   * Function that will be called when the enter transition is complete.
   */
  onOpenComplete?: () => void;

  /**
   * Function that will be called when the exit transition is complete.
   */
  onCloseComplete?: () => void;

  /**
   * Function that will be called when the body is clicked.
   */
  onBodyClick?: (e: MouseEvent) => void;

  /**
   * When true, bring focus inside of the Popover on open.
   */
  bringFocusInside: boolean;

  /**
   * Boolean indicating if clicking outside the dialog should close the dialog.
   */
  shouldCloseOnExternalClick: boolean;

  /**
   * Target ref object, in case the parent wants to manage the target element itself
   */
  targetRef?: React.RefObject<HTMLElement>;

  /**
   * Body ref object, in case the parent wants access to the popover body ref
   */
  bodyRef?: React.RefObject<HTMLDivElement>;

  /**
   * Override the popover body component implementation, if desired
   */
  popoverBody?: React.ComponentType<any>;
}

interface State {
  isShown: boolean;
}

export class Popover extends React.Component<PopoverProps, State> {
  static defaultProps = {
    bringFocusInside: false,
    position: Position.BOTTOM,
    animationDuration: 300,
    shouldCloseOnExternalClick: true,
    trigger: 'click',
  };

  _enterTimeout: any;
  _leaveTimeout: any;

  _targetRefDefault: React.RefObject<HTMLElement> = React.createRef<HTMLElement>();
  _bodyRefDefault: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

  createPositionerRenderProp: (_children: any) => (arg: PositionerChildrenArgs) => React.ReactNode;

  constructor(props: PopoverProps) {
    super(props);
    this.state = {
      isShown:
        typeof props.isShown === 'boolean'
          ? props.isShown
          : typeof props.initialIsShown === 'boolean'
          ? props.initialIsShown
          : false,
    };

    // We want the render prop function passed to <Positioner> as a child
    // to change if our input children change, otherwise the view may not
    // be updated (this would be less ugly with hooks)
    this.createPositionerRenderProp = memoizeOne((_children: any) => {
      return (arg: PositionerChildrenArgs) => this.renderPopoverBody(arg);
    });
  }

  componentDidMount() {
    if (this.state.isShown) {
      this.addBodyEvents();
    }
  }

  componentWillUnmount() {
    this.removeBodyEvents();
    clearTimeout(this._leaveTimeout);
    clearTimeout(this._enterTimeout);
  }

  get targetRef(): React.RefObject<HTMLElement> {
    return this.props.targetRef || this._targetRefDefault;
  }

  get bodyRef(): React.RefObject<HTMLDivElement> {
    return this.props.bodyRef || this._bodyRefDefault;
  }

  // Methods borrowed from BlueprintJS
  // https://github.com/palantir/blueprint/blob/release/2.0.0/packages/core/src/components/overlay/overlay.tsx
  bringFocusInside = () => {
    // Always delay focus manipulation to just before repaint to prevent scroll jumping
    return requestAnimationFrame(() => {
      // Container ref may be undefined between component mounting and Portal rendering
      // activeElement may be undefined in some rare cases in IE
      if (
        this.bodyRef.current == null || // eslint-disable-line eqeqeq, no-eq-null
        document.activeElement == null || // eslint-disable-line eqeqeq, no-eq-null
        !this.state.isShown
      ) {
        return;
      }

      const isFocusOutsideModal = !this.bodyRef.current.contains(document.activeElement);
      if (isFocusOutsideModal) {
        // Element marked autofocus has higher priority than the other clowns
        const autofocusElement = this.bodyRef.current.querySelector('[autofocus]');
        const wrapperElement = this.bodyRef.current.querySelector('[tabindex]');
        const buttonElements = this.bodyRef.current.querySelectorAll(
          'button, a, [role="menuitem"], [role="menuitemradio"]',
        );

        if (autofocusElement) {
          (autofocusElement as any).focus();
        } else if (wrapperElement) {
          (wrapperElement as any).focus();
        } else if (buttonElements.length > 0) {
          (buttonElements[0] as any).focus();
        }
      }
    });
  };

  bringFocusBackToTarget = () => {
    return requestAnimationFrame(() => {
      if (
        this.bodyRef.current == null || // eslint-disable-line eqeqeq, no-eq-null
        document.activeElement == null // eslint-disable-line eqeqeq, no-eq-null
      ) {
        return;
      }

      const isFocusInsideModal = this.bodyRef.current.contains(document.activeElement);

      // Bring back focus on the target.
      if (
        this.targetRef.current &&
        (document.activeElement === document.body || isFocusInsideModal)
      ) {
        this.targetRef.current.focus();
      }
    });
  };

  onBodyClick = (e: MouseEvent) => {
    // Ignore clicks on the popover or button
    if (this.targetRef.current && this.targetRef.current.contains(e.target as Node)) {
      return;
    }

    if (this.bodyRef.current && this.bodyRef.current.contains(e.target as Node)) {
      return;
    }

    // Notify body click
    if (this.props.onBodyClick) {
      this.props.onBodyClick(e);
    }

    if (this.props.shouldCloseOnExternalClick === false || this.props.isShown !== undefined) {
      return;
    }

    this.close();
  };

  onEsc = (e: KeyboardEvent) => {
    // Esc key
    if (e.keyCode === 27) {
      this.close();
    }
  };

  toggle = () => {
    if (this.state.isShown) {
      this.close();
    } else {
      this.open();
    }
  };

  open = () => {
    if (this.state.isShown) {
      return;
    }

    this.setState({isShown: true});
    this.addBodyEvents();

    if (this.props.onOpen) {
      this.props.onOpen();
    }
  };

  close = () => {
    if (!this.state.isShown) {
      return;
    }

    this.setState({isShown: false});

    this.bringFocusBackToTarget();
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  addBodyEvents() {
    document.body.addEventListener('click', this.onBodyClick, false);
    document.body.addEventListener('keydown', this.onEsc, false);
  }

  removeBodyEvents() {
    document.body.removeEventListener('click', this.onBodyClick, false);
    document.body.removeEventListener('keydown', this.onEsc, false);
  }

  handleOpenComplete = () => {
    if (this.props.bringFocusInside) this.bringFocusInside();
    if (this.props.onOpenComplete) {
      this.props.onOpenComplete();
    }
  };

  handleCloseComplete = () => {
    if (this.props.onCloseComplete) {
      this.props.onCloseComplete();
    }
  };

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      this.bringFocusInside();
    }
  };

  handleOpenHover = () => {
    clearTimeout(this._leaveTimeout);
    const {trigger, enterDelay} = this.props;
    if (trigger === 'hover') {
      if (enterDelay) {
        this._enterTimeout = setTimeout(() => {
          this.open();
        }, enterDelay);
      } else {
        this.open();
      }
    }
  };

  handleCloseHover = () => {
    clearTimeout(this._enterTimeout);
    const {trigger, leaveDelay} = this.props;
    if (trigger === 'hover') {
      if (leaveDelay) {
        this._leaveTimeout = setTimeout(() => {
          this.close();
        }, leaveDelay);
      } else {
        this.close();
      }
    }
  };

  renderTarget = ({isShown}: {isShown: boolean}) => {
    const {children, trigger} = this.props;

    /**
     * When a function is passed, you can control the Popover manually.
     */
    if (typeof children === 'function') {
      return children({
        toggle: this.toggle,
        ref: this.targetRef,
        isShown,
      });
    }

    let popoverTargetProps: Record<string, any>;
    if (trigger === 'hover') {
      popoverTargetProps = {
        onMouseEnter: this.handleOpenHover,
        onMouseLeave: this.handleCloseHover,
        ref: this.targetRef,
      };
    } else {
      popoverTargetProps = {
        onClick: this.toggle,
        onKeyDown: this.handleKeyDown,
        ref: this.targetRef,
        role: 'button',
        'aria-expanded': isShown,
        'aria-haspopup': true,
      };
    }

    /**
     * With normal usage only popover props end up on the target.
     */
    return React.cloneElement(children as any, popoverTargetProps);
  };

  renderPopoverBody = ({stylesJsx, style, state}: PositionerChildrenArgs) => {
    const {content, popoverBody = PopoverBody} = this.props;
    const BodyImpl = popoverBody;
    return (
      <BodyImpl
        stylesJsx={stylesJsx}
        style={style as any}
        ref={this.bodyRef}
        data-state={state}
        onMouseLeave={this.handleCloseHover}
      >
        {typeof content === 'function' ? content({close: this.close}) : content}
      </BodyImpl>
    );
  };

  isControlled() {
    return typeof this.props.isShown === 'boolean';
  }

  getIsShown(): boolean {
    return (this.isControlled() ? this.props.isShown : this.state.isShown) as boolean;
  }

  render() {
    const {position, animationDuration} = this.props;

    const isShown = this.getIsShown();

    const positionerRenderProp = this.createPositionerRenderProp(this.props.children);
    return (
      <>
        {this.renderTarget({isShown})}
        <Positioner
          targetRef={this.targetRef}
          bodyRef={this.bodyRef}
          isShown={isShown}
          position={position}
          animationDuration={animationDuration}
          onOpenComplete={this.handleOpenComplete}
          onCloseComplete={this.handleCloseComplete}
        >
          {positionerRenderProp}
        </Positioner>
      </>
    );
  }
}
