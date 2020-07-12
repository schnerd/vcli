/**
 * Layering order contains z-index values that are used through.
 * Note that the Layer component might increase the z-index for certain components.
 */
export default {
  /**
   * Used for focused buttons and controls.
   */
  FOCUSED: 2,

  /**
   * Used as the default for the LayeringContext.
   */
  LAYERING_CONTEXT: 5,

  /**
   * Used as the default for the Positioner.
   */
  POSITIONER: 10,

  /**
   * Used for the Overlay and everything that's inside such as Dialog + SideSheet.
   */
  OVERLAY: 20,

  /**
   * Used for the toasts in the toaster. Appears on top of everything else.
   */
  TOASTER: 30,
};
