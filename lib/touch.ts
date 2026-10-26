// BeUI registry source: https://beui.dev/r/timeline.json → lib/touch.ts
// Retrieved 2026-10-26. Free BeUI component source, kept close to upstream so a
// future registry refresh can be diffed; only the comments that named
// components this repository does not install were trimmed.
//
// iOS and iPadOS run their own gestures on top of the page — the long-press
// selection callout and the selection it drags in with it — and they win: once
// the platform claims a touch it cancels ours mid-gesture. Surfaces that own
// their gesture have to opt out.

/**
 * Classes for a surface that *is* the control: a thumb, a drum, a stage.
 * Selection is suppressed on every input, because a drag that highlights the
 * control's own label is wrong on a mouse too.
 */
export const TOUCH_GESTURE_CLASS = "select-none [-webkit-touch-callout:none]";

/**
 * Whether this event came from a pointer that is *hovering*: not a touch, and
 * not currently pressed. A pen resting on the glass is making contact, not
 * hovering: `buttons` is the tell.
 */
export const isHoveringPointer = (event: {
  pointerType: string;
  buttons: number;
}) => event.pointerType !== "touch" && event.buttons === 0;

/**
 * Pointer capture, best effort. WebKit throws `NotFoundError` when the pointer
 * is already gone by the time the handler runs — routine on iOS, where the
 * system can claim the touch first — and an uncaught throw takes the rest of
 * the handler, the gesture included, down with it. Touch pointers carry
 * implicit capture anyway, so losing it is never fatal.
 */
export function capturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Pointer is no longer active — implicit capture still applies on touch.
  }
}

/** Release a capture taken with `capturePointer`, ignoring a stale pointer. */
export function releasePointer(element: Element, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  } catch {
    // Capture was already dropped by the browser.
  }
}
