export type PrimitiveEmmitedEvents = {
  onCopy?: (payload: ClipboardEvent) => void;
  onCut?: (payload: ClipboardEvent) => void;
  onPaste?: (payload: ClipboardEvent) => void;
  onCompositionend?: (payload: CompositionEvent) => void;
  onCompositionstart?: (payload: CompositionEvent) => void;
  onCompositionupdate?: (payload: CompositionEvent) => void;
  onDrag?: (payload: DragEvent) => void;
  onDragend?: (payload: DragEvent) => void;
  onDragenter?: (payload: DragEvent) => void;
  onDragexit?: (payload: DragEvent) => void;
  onDragleave?: (payload: DragEvent) => void;
  onDragover?: (payload: DragEvent) => void;
  onDragstart?: (payload: DragEvent) => void;
  onDrop?: (payload: DragEvent) => void;
  onFocus?: (payload: FocusEvent) => void;
  onFocusin?: (payload: FocusEvent) => void;
  onFocusout?: (payload: FocusEvent) => void;
  onBlur?: (payload: FocusEvent) => void;
  onChange?: (payload: Event) => void;
  onBeforeinput?: (payload: Event) => void;
  onInput?: (payload: Event) => void;
  onReset?: (payload: Event) => void;
  onSubmit?: (payload: Event) => void;
  onInvalid?: (payload: Event) => void;
  onLoad?: (payload: Event) => void;
  onError?: (payload: Event) => void;
  onKeydown?: (payload: KeyboardEvent) => void;
  onKeypress?: (payload: KeyboardEvent) => void;
  onKeyup?: (payload: KeyboardEvent) => void;
  onAuxclick?: (payload: MouseEvent) => void;
  onClick?: (payload: MouseEvent) => void;
  onContextmenu?: (payload: MouseEvent) => void;
  onDblclick?: (payload: MouseEvent) => void;
  onMousedown?: (payload: MouseEvent) => void;
  onMouseenter?: (payload: MouseEvent) => void;
  onMouseleave?: (payload: MouseEvent) => void;
  onMousemove?: (payload: MouseEvent) => void;
  onMouseout?: (payload: MouseEvent) => void;
  onMouseover?: (payload: MouseEvent) => void;
  onMouseup?: (payload: MouseEvent) => void;
  onAbort?: (payload: Event) => void;
  onCanplay?: (payload: Event) => void;
  onCanplaythrough?: (payload: Event) => void;
  onDurationchange?: (payload: Event) => void;
  onEmptied?: (payload: Event) => void;
  onEncrypted?: (payload: Event) => void;
  onEnded?: (payload: Event) => void;
  onLoadeddata?: (payload: Event) => void;
  onLoadedmetadata?: (payload: Event) => void;
  onLoadstart?: (payload: Event) => void;
  onPause?: (payload: Event) => void;
  onPlay?: (payload: Event) => void;
  onPlaying?: (payload: Event) => void;
  onProgress?: (payload: Event) => void;
  onRatechange?: (payload: Event) => void;
  onSeeked?: (payload: Event) => void;
  onSeeking?: (payload: Event) => void;
  onStalled?: (payload: Event) => void;
  onSuspend?: (payload: Event) => void;
  onTimeupdate?: (payload: Event) => void;
  onVolumechange?: (payload: Event) => void;
  onWaiting?: (payload: Event) => void;
  onSelect?: (payload: Event) => void;
  onScroll?: (payload: Event) => void;
  onScrollend?: (payload: Event) => void;
  onTouchcancel?: (payload: TouchEvent) => void;
  onTouchend?: (payload: TouchEvent) => void;
  onTouchmove?: (payload: TouchEvent) => void;
  onTouchstart?: (payload: TouchEvent) => void;
  onPointerdown?: (payload: PointerEvent) => void;
  onPointermove?: (payload: PointerEvent) => void;
  onPointerup?: (payload: PointerEvent) => void;
  onPointercancel?: (payload: PointerEvent) => void;
  onPointerenter?: (payload: PointerEvent) => void;
  onPointerleave?: (payload: PointerEvent) => void;
  onPointerover?: (payload: PointerEvent) => void;
  onPointerout?: (payload: PointerEvent) => void;
  onWheel?: (payload: WheelEvent) => void;
  onAnimationstart?: (payload: AnimationEvent) => void;
  onAnimationend?: (payload: AnimationEvent) => void;
  onAnimationiteration?: (payload: AnimationEvent) => void;
  onTransitionend?: (payload: TransitionEvent) => void;
  onTransitionstart?: (payload: TransitionEvent) => void;
};
