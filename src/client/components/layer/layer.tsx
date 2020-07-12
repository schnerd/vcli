import React from 'react';
import LayeringOrder from './layering-order';
import LayeringContext from './layering-context';

export interface LayerProps {
  /**
   * Function that takes the current z-index and returns a React Node.
   * (zIndex) => ReactNode.
   */
  children: (zIndex: number) => React.ReactNode;
  /**
   * Set the value of the layer. This will increment for children.
   */
  value?: number;
}

const Layer = React.memo(function _Layer(props: LayerProps) {
  const {children, value = LayeringOrder.LAYERING_CONTEXT} = props;
  return (
    <LayeringContext.Consumer>
      {(previousValue) => {
        const currentValue = Math.max(value, previousValue);
        const nextValue = currentValue + 1;
        return (
          <LayeringContext.Provider value={nextValue}>
            {children(currentValue)}
          </LayeringContext.Provider>
        );
      }}
    </LayeringContext.Consumer>
  );
});

export default Layer;
