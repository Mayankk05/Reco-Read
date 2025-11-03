import { useEffect, useId, useMemo, useRef, useState } from 'react';

export default function Select({
  items = [],
  value,
  onChange,
  placeholder = 'Select…',
  ariaLabel,
  className = '',
  disabled = false,
  size = 'md', 
  placement = 'auto', 
  offset = 8, 
}) {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuPlacement, setMenuPlacement] = useState('bottom');
  const [menuMaxH, setMenuMaxH] = useState(260);
  const listboxId = useId();

  const current = useMemo(
    () => items.find((i) => i.value === value) || null,
    [items, value]
  );

  const computePlacement = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportH - rect.bottom - offset;
    const spaceAbove = rect.top - offset;
    const desired = 260;

    if (placement === 'top') {
      setMenuPlacement('top');
      setMenuMaxH(Math.max(160, Math.min(desired, spaceAbove)));
      return;
    }
    if (placement === 'bottom') {
      setMenuPlacement('bottom');
      setMenuMaxH(Math.max(160, Math.min(desired, spaceBelow)));
      return;
    }

    // auto
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      setMenuPlacement('top');
      setMenuMaxH(Math.max(160, Math.min(desired, spaceAbove)));
    } else {
      setMenuPlacement('bottom');
      setMenuMaxH(Math.max(160, Math.min(desired, spaceBelow)));
    }
  };

  useEffect(() => {
    if (!open) return;
    computePlacement();

    const onDocClick = (e) => {
      if (!triggerRef.current || !menuRef.current) return;
      if (triggerRef.current.contains(e.target) || menuRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onResizeScroll = () => {
      computePlacement();
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    window.addEventListener('resize', onResizeScroll, { passive: true });
    window.addEventListener('scroll', onResizeScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
      window.removeEventListener('resize', onResizeScroll);
      window.removeEventListener('scroll', onResizeScroll);
    };
  }, [open, placement, offset]);

  useEffect(() => {
    if (!open) return;
    const ix = items.findIndex((i) => i.value === value);
    setActiveIndex(ix >= 0 ? ix : 0);
    const first = menuRef.current?.querySelector('[role="option"]');
    first?.focus({ preventScroll: true });
  }, [open, items, value]);

  const onTriggerKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onOptionKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(items.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const it = items[activeIndex];
      if (it) {
        onChange?.(it.value);
        setOpen(false);
        triggerRef.current?.focus();
      }
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  const selectItem = (it, ix) => {
    onChange?.(it.value);
    setActiveIndex(ix);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const sizeTriggerClass = size === 'sm' ? 'select-trigger-sm' : '';
  const sizeMenuClass = size === 'sm' ? 'select-menu-sm' : '';
  const sizeOptionClass = size === 'sm' ? 'select-option-sm' : '';

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`select-trigger ${sizeTriggerClass} ${open ? 'select-trigger-open' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <span className="truncate">{current?.label || placeholder}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-neutral-600 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          className={`select-menu ${sizeMenuClass} ${menuPlacement === 'top' ? 'select-menu-top' : 'select-menu-bottom'}`}
          onKeyDown={onOptionKeyDown}
          style={{
            minWidth: triggerRef.current?.offsetWidth || undefined,
            maxHeight: menuMaxH,
          }}
        >
          {items.map((it, ix) => {
            const selected = it.value === value;
            const active = ix === activeIndex;
            return (
              <div
                key={`${String(it.value)}-${ix}`}
                role="option"
                aria-selected={selected}
                tabIndex={0}
                className={`select-option ${sizeOptionClass} ${active ? 'select-option-active' : ''} ${selected ? 'select-option-selected' : ''}`}
                onMouseEnter={() => setActiveIndex(ix)}
                onClick={() => selectItem(it, ix)}
              >
                <span className="truncate">{it.label}</span>
                {selected && (
                  <svg className="h-4 w-4 text-violet-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3-3A1 1 0 016.204 9.79l2.293 2.293 6.793-6.793a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
