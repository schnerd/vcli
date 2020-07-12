import React from 'react';
import LayeringOrder from './layering-order';

/**
 * Context used to manage the layering of z-indexes of components.
 */
const LayeringContext = React.createContext(LayeringOrder.LAYERING_CONTEXT);
export default LayeringContext;
