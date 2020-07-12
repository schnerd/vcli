import Position from './positions';

interface Rect {
  width: number;
  height: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface Dimensions {
  width: number;
  height: number;
}

/**
 * Function to create a Rect.
 */
function makeRect(
  {width, height}: {width: number; height: number},
  {left, top}: {left: number; top: number},
): Rect {
  const ceiledLeft = Math.ceil(left);
  const ceiledTop = Math.ceil(top);
  return {
    width,
    height,
    left: ceiledLeft,
    top: ceiledTop,
    right: ceiledLeft + width,
    bottom: ceiledTop + height,
  };
}

/**
 * Function to flip a position upside down.
 */
function flipVertical(position: string): string {
  switch (position) {
    case Position.TOP_LEFT:
      return Position.BOTTOM_LEFT;
    case Position.TOP:
    default:
      return Position.BOTTOM;
    case Position.TOP_RIGHT:
      return Position.BOTTOM_RIGHT;
    case Position.BOTTOM_LEFT:
      return Position.TOP_LEFT;
    case Position.BOTTOM:
      return Position.TOP;
    case Position.BOTTOM_RIGHT:
      return Position.TOP_RIGHT;
  }
}

/**
 * Function to flip a position
 */
function flipHorizontal(position: string): string {
  switch (position) {
    case Position.LEFT_TOP:
      return Position.RIGHT_TOP;
    case Position.LEFT:
    default:
      return Position.RIGHT;
    case Position.LEFT_BOTTOM:
      return Position.RIGHT_BOTTOM;
    case Position.RIGHT_BOTTOM:
      return Position.LEFT_BOTTOM;
    case Position.RIGHT:
      return Position.LEFT;
    case Position.RIGHT_TOP:
      return Position.LEFT_TOP;
  }
}

/**
 * Function that returns if position is aligned on top.
 */
function isAlignedOnTop(position: string): boolean {
  switch (position) {
    case Position.TOP_LEFT:
    case Position.TOP:
    case Position.TOP_RIGHT:
      return true;
    default:
      return false;
  }
}

/**
 * Function that returns if position is aligned on left.
 */
function isAlignedOnLeft(position: string): boolean {
  switch (position) {
    case Position.LEFT_TOP:
    case Position.LEFT:
    case Position.LEFT_BOTTOM:
      return true;
    default:
      return false;
  }
}

/**
 * Function that returns if position is aligned left or right.
 * @param {Position} position
 * @return {Boolean}
 */
function isAlignedHorizontal(position: string): boolean {
  switch (position) {
    case Position.LEFT:
    case Position.LEFT_TOP:
    case Position.LEFT_BOTTOM:
    case Position.RIGHT:
    case Position.RIGHT_TOP:
    case Position.RIGHT_BOTTOM:
      return true;
    default:
      return false;
  }
}

/**
 * Function that returns if a rect fits on bottom.
 */
function getFitsOnBottom(rect: Rect, viewport: Viewport, viewportOffset: number): boolean {
  return rect.bottom < viewport.height - viewportOffset;
}

/**
 * Function that returns if a rect fits on top.
 */
function getFitsOnTop(rect: Rect, viewportOffset: number): boolean {
  return rect.top > viewportOffset;
}

/**
 * Function that returns if a rect fits on right.
 */
function getFitsOnRight(rect: Rect, viewport: Viewport, viewportOffset: number): boolean {
  return rect.right < viewport.width - viewportOffset;
}

/**
 * Function that returns if a rect fits on left.
 */
function getFitsOnLeft(rect: Rect, viewportOffset: number): boolean {
  return rect.left > viewportOffset;
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin
 * Function that returns the CSS `tranform-origin` property.
 */
function getTransformOrigin({
  rect,
  position,
  dimensions,
  targetCenter,
}: {
  rect: Rect;
  position: string;
  dimensions: Dimensions;
  targetCenter: number;
}) {
  const centerY = Math.round(targetCenter - rect.top);

  if (position === Position.LEFT) {
    /* Syntax: x-offset | y-offset */
    return `${dimensions.width}px ${centerY}px`;
  }

  if (position === Position.RIGHT) {
    /* Syntax: x-offset | y-offset */
    return `0px ${centerY}px`;
  }

  const centerX = Math.round(targetCenter - rect.left);

  if (isAlignedOnTop(position)) {
    /* Syntax: x-offset | y-offset */
    return `${centerX}px ${dimensions.height}px `;
  }

  /* Syntax: x-offset | y-offset */
  return `${centerX}px 0px `;
}

/**
 * Function that takes in numbers and position and gives the final coords.
 */
export default function getFittedPosition({
  position,
  dimensions,
  targetRect,
  targetOffset,
  viewport,
  viewportOffset = 8,
}: {
  position: string;
  dimensions: Dimensions;
  targetRect: Rect;
  targetOffset: number;
  viewport: Viewport;
  viewportOffset: number;
}): {rect: Rect; position: string; transformOrigin: string} {
  const {rect, position: finalPosition} = getPosition({
    position,
    dimensions,
    targetRect,
    targetOffset,
    viewport,
    viewportOffset,
  });

  // Push rect to the right if overflowing on the left side of the viewport.
  if (rect.left < viewportOffset) {
    rect.right += Math.ceil(Math.abs(rect.left - viewportOffset));
    rect.left = Math.ceil(viewportOffset);
  }

  // Push rect to the left if overflowing on the right side of the viewport.
  if (rect.right > viewport.width - viewportOffset) {
    const delta = Math.ceil(rect.right - (viewport.width - viewportOffset));
    rect.left -= delta;
    rect.right -= delta;
  }

  // Push rect down if overflowing on the top side of the viewport.
  if (rect.top < viewportOffset) {
    rect.top += Math.ceil(Math.abs(rect.top - viewportOffset));
    rect.bottom = Math.ceil(viewportOffset);
  }

  // Push rect up if overflowing on the bottom side of the viewport.
  if (rect.bottom > viewport.height - viewportOffset) {
    const delta = Math.ceil(rect.bottom - (viewport.height - viewportOffset));
    rect.top -= delta;
    rect.bottom -= delta;
  }

  const targetCenter = isAlignedHorizontal(position)
    ? targetRect.top + targetRect.height / 2
    : targetRect.left + targetRect.width / 2;

  const transformOrigin = getTransformOrigin({
    rect,
    position: finalPosition,
    dimensions,
    targetCenter,
  });

  return {
    rect,
    position: finalPosition,
    transformOrigin,
  };
}

/**
 * Function that takes in numbers and position and gives the final coords.
 */
function getPosition({
  position,
  dimensions,
  targetRect,
  targetOffset,
  viewport,
  viewportOffset = 8,
}: {
  position: string;
  dimensions: Dimensions;
  targetRect: Rect;
  targetOffset: number;
  viewport: Viewport;
  viewportOffset: number;
}): {rect: Rect; position: string} {
  const isHorizontal = isAlignedHorizontal(position);

  // Handle left and right positions
  if (isHorizontal) {
    const isAlignedLeft = isAlignedOnLeft(position);

    const leftRect = getRect({
      position: isAlignedLeft ? position : flipHorizontal(position),
      dimensions,
      targetRect,
      targetOffset,
    });

    const rightRect = getRect({
      position: isAlignedLeft ? flipHorizontal(position) : position,
      dimensions,
      targetRect,
      targetOffset,
    });

    const fitsOnLeft = getFitsOnLeft(leftRect, viewportOffset);
    const fitsOnRight = getFitsOnRight(rightRect, viewport, viewportOffset);

    if (isAlignedLeft) {
      if (fitsOnLeft) {
        return {
          position,
          rect: leftRect,
        };
      }

      if (fitsOnRight) {
        return {
          position: flipHorizontal(position),
          rect: rightRect,
        };
      }
    } else {
      if (fitsOnRight) {
        return {
          position,
          rect: rightRect,
        };
      }

      if (fitsOnLeft) {
        return {
          position: flipHorizontal(position),
          rect: leftRect,
        };
      }
    }

    // Default to using the position with the most space
    const spaceRight = Math.abs(viewport.width - viewportOffset - rightRect.right);
    const spaceLeft = Math.abs(leftRect.left - viewportOffset);

    if (spaceRight < spaceLeft) {
      return {
        position: Position.RIGHT,
        rect: rightRect,
      };
    }

    return {
      position: Position.LEFT,
      rect: leftRect,
    };
  }

  const positionIsAlignedOnTop = isAlignedOnTop(position);
  let topRect;
  let bottomRect;

  if (positionIsAlignedOnTop) {
    topRect = getRect({
      position,
      dimensions,
      targetRect,
      targetOffset,
    });
    bottomRect = getRect({
      position: flipVertical(position),
      dimensions,
      targetRect,
      targetOffset,
    });
  } else {
    topRect = getRect({
      position: flipVertical(position),
      dimensions,
      targetRect,
      targetOffset,
    });
    bottomRect = getRect({
      position,
      dimensions,
      targetRect,
      targetOffset,
    });
  }

  const topRectFitsOnTop = getFitsOnTop(topRect, viewportOffset);

  const bottomRectFitsOnBottom = getFitsOnBottom(bottomRect, viewport, viewportOffset);

  if (positionIsAlignedOnTop) {
    if (topRectFitsOnTop) {
      return {
        position,
        rect: topRect,
      };
    }

    if (bottomRectFitsOnBottom) {
      return {
        position: flipVertical(position),
        rect: bottomRect,
      };
    }
  }

  if (!positionIsAlignedOnTop) {
    if (bottomRectFitsOnBottom) {
      return {
        position,
        rect: bottomRect,
      };
    }

    if (topRectFitsOnTop) {
      return {
        position: flipVertical(position),
        rect: topRect,
      };
    }
  }

  // Default to most spacious if there is no fit.
  const spaceBottom = Math.abs(viewport.height - viewportOffset - bottomRect.bottom);

  const spaceTop = Math.abs(topRect.top - viewportOffset);

  if (spaceBottom < spaceTop) {
    return {
      position: positionIsAlignedOnTop ? flipVertical(position) : position,
      rect: bottomRect,
    };
  }

  return {
    position: positionIsAlignedOnTop ? position : flipVertical(position),
    rect: topRect,
  };
}

/**
 * Function that takes in numbers and position and gives the final coords.
 */
function getRect({
  position,
  targetOffset,
  dimensions,
  targetRect,
}: {
  position: string;
  targetOffset: number;
  dimensions: Dimensions;
  targetRect: Rect;
}): Rect {
  let left = 0;
  switch (position) {
    case Position.LEFT:
    case Position.LEFT_TOP:
    case Position.LEFT_BOTTOM:
      left = targetRect.left - dimensions.width - targetOffset;
      break;
    case Position.RIGHT:
    case Position.RIGHT_TOP:
    case Position.RIGHT_BOTTOM:
      left = targetRect.right + targetOffset;
      break;
    case Position.TOP:
    case Position.BOTTOM:
      left = targetRect.left + targetRect.width / 2 - dimensions.width / 2;
      break;
    case Position.TOP_LEFT:
    case Position.BOTTOM_LEFT:
      left = targetRect.left;
      break;
    case Position.TOP_RIGHT:
    case Position.BOTTOM_RIGHT:
      left = targetRect.right - dimensions.width;
      break;
  }

  let top = 0;
  switch (position) {
    case Position.LEFT:
    case Position.RIGHT:
      top = targetRect.top + targetRect.height / 2 - dimensions.height / 2;
      break;
    case Position.LEFT_TOP:
    case Position.RIGHT_TOP:
      top = targetRect.top;
      break;
    case Position.LEFT_BOTTOM:
    case Position.RIGHT_BOTTOM:
      top = targetRect.bottom - dimensions.height;
      break;
    case Position.TOP:
    case Position.TOP_LEFT:
    case Position.TOP_RIGHT:
      top = targetRect.top - dimensions.height - targetOffset;
      break;
    case Position.BOTTOM:
    case Position.BOTTOM_LEFT:
    case Position.BOTTOM_RIGHT:
      top = targetRect.bottom + targetOffset;
      break;
  }

  return makeRect(dimensions, {left, top});
}
