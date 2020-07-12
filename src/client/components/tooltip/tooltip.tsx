import React, {Component} from 'react';
import {Popover} from '../popover';
import {PositionsUnion} from '../positioner';

export interface TooltipProps {
  position?: PositionsUnion;
  children: React.ReactElement;
  content: React.ReactNode;
  leaveDelay?: number;
  enterDelay?: number;
  isShown?: boolean;
  initialIsShown?: boolean;
  trigger?: 'click' | 'hover';
  shouldCloseOnExternalClick?: boolean;
}

interface TooltipBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  stylesJsx: any;
}

const TooltipBody = React.forwardRef(function TooltipBody(
  props: TooltipBodyProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const {children, stylesJsx, ...rest} = props;
  return (
    <div className="root" ref={ref} {...rest}>
      {children}
      <style jsx>{stylesJsx}</style>
      <style jsx>
        {`
          .root {
            box-shadow: 0 0 1px rgba(67, 90, 111, 0.3), 0 8px 10px -4px rgba(67, 90, 111, 0.47);
            border-radius: 3px;
            background-color: #404040;
            font-size: 12px;
            color: white;
            padding: 3px 7px;
            line-height: 1.4;
            max-width: 250px;
          }
        `}
      </style>
    </div>
  );
});

export class Tooltip extends Component<TooltipProps> {
  render() {
    const {
      position,
      children,
      content,
      enterDelay,
      leaveDelay,
      isShown,
      initialIsShown,
      trigger = 'hover',
      shouldCloseOnExternalClick = false,
    } = this.props;

    return (
      <Popover
        position={position}
        content={content}
        isShown={isShown}
        initialIsShown={initialIsShown}
        trigger={trigger}
        shouldCloseOnExternalClick={shouldCloseOnExternalClick}
        popoverBody={TooltipBody}
        enterDelay={enterDelay}
        leaveDelay={leaveDelay}
      >
        {children}
      </Popover>
    );
  }
}
