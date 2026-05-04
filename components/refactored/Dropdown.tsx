"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Dropdown.module.css";

export type DropdownOption = {
  label: string;
  value: string;
  count?: number;
};

export default function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "不限",
}: {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSelect(opt: DropdownOption) {
    onChange(opt.value === value ? "" : opt.value);
    setOpen(false);
    setFocusedIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " ") setOpen(true);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && focusedIndex >= 0) {
      handleSelect(options[focusedIndex]);
    }
  }

  const selected = options.find((o) => o.value === value) ?? null;
  const displayValue = selected?.label ?? placeholder;
  const isSet = selected !== null;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.label}>{label}</span>
        <span className={`${styles.value} ${isSet ? styles.valueSet : ""}`}>
          {displayValue}
        </span>
        <span className={`${styles.caret} ${open ? styles.caretOpen : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className={styles.menu} role="listbox">
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isFocused = focusedIndex === i;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className={`${styles.option} ${isSelected ? styles.optionSelected : ""} ${isFocused ? styles.optionFocused : ""}`}
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
                {opt.count !== undefined && !isSelected && (
                  <span className={styles.count}>{opt.count}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
