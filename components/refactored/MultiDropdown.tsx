"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Dropdown.module.css";
import type { DropdownOption } from "./Dropdown";

export default function MultiDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "不限",
}: {
  label: string;
  options: DropdownOption[];
  value: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // * toggle membership without closing — multi-select stays open
  function handleToggle(option: DropdownOption) {
    const next = value.includes(option.value)
      ? value.filter((key) => key !== option.value)
      : [...value, option.value];
    onChange?.(next);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      if (event.key === "Enter" || event.key === " ") setOpen(true);
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((index) => Math.min(index + 1, options.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && focusedIndex >= 0) {
      handleToggle(options[focusedIndex]);
    }
  }

  // * "台北市" for one, "台北市 +2" for more — keeps the trigger compact
  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);
  const isSet = selectedLabels.length > 0;
  const displayValue = !isSet
    ? placeholder
    : selectedLabels.length === 1
      ? selectedLabels[0]
      : `${selectedLabels[0]} +${selectedLabels.length - 1}`;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((prev) => !prev)}
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
        <div className={styles.menu} role="listbox" aria-multiselectable>
          {options.map((option, index) => {
            const isSelected = value.includes(option.value);
            const isFocused = focusedIndex === index;
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={`${styles.option} ${isSelected ? styles.optionSelected : ""} ${isFocused ? styles.optionFocused : ""}`}
                onClick={() => handleToggle(option)}
              >
                {option.label}
                {option.count !== undefined && !isSelected && (
                  <span className={styles.count}>{option.count}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
