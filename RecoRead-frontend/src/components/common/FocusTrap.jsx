import { useEffect, useRef } from 'react';

/**
 * FocusTrap
 * - Traps keyboard focus within its subtree.
 * - Returns focus to the previously focused element on unmount.
 * - If no focusable element is inside, focuses the container.
 *
 * Props:
 * - children: ReactNode
 * - initialFocusRef?: ref to an element to focus first
 * - onEscape?: () => void  // called when user presses Escape
 * - className?: string
 */
export default function FocusTrap({ children, initialFocusRef, onEscape, className = '' }) {
  const containerRef = useRef(null);
  const lastFocusedRef = useRef(null);

  useEffect(() => {
    lastFocusedRef.current = document.activeElement;

    const container = containerRef.current;

    const getFocusable = () => {
      if (!container) return [];
      const nodes = container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(nodes).filter(
        (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
      );
    };

    // Focus initial target or first focusable or container
    const focusInitial = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }
      const list = getFocusable();
      if (list.length > 0) {
        list[0].focus();
      } else {
        container?.focus();
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const currentIndex = focusable.indexOf(document.activeElement);
      const lastIndex = focusable.length - 1;

      if (e.shiftKey) {
        // Shift+Tab
        if (currentIndex <= 0) {
          focusable[lastIndex].focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (currentIndex === lastIndex) {
          focusable[0].focus();
          e.preventDefault();
        }
      }
    };

    focusInitial();
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // Restore focus
      if (lastFocusedRef.current && lastFocusedRef.current.focus) {
        lastFocusedRef.current.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={className}
    >
      {children}
    </div>
  );
}