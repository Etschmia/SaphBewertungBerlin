import { useEffect, RefObject } from 'react';

/**
 * Custom hook that detects clicks outside of a referenced element.
 * Commonly used for closing dropdowns, modals, and popups.
 *
 * @param ref - React ref object pointing to the element to monitor
 * @param handler - Callback function to execute when a click outside is detected
 * @param enabled - Optional flag to enable/disable the listener (default: true)
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler, enabled]);
}

/**
 * Custom hook for handling multiple refs (e.g., multiple dropdowns).
 * Closes when clicking outside ALL provided refs.
 *
 * @param refs - Array of React ref objects to monitor
 * @param handler - Callback function to execute when a click outside all refs is detected
 * @param enabled - Optional flag to enable/disable the listener (default: true)
 */
export function useClickOutsideMultiple<T extends HTMLElement>(
  refs: RefObject<T>[],
  handler: () => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideAll = refs.every(
        ref => ref.current && !ref.current.contains(event.target as Node)
      );
      if (isOutsideAll) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, handler, enabled]);
}
