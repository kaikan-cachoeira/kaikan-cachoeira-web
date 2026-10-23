import { useEffect, useId, useRef, useState } from "react";
import Icone from "@/shared/components/Icone/Icone";
import styles from "./Formulario.module.css";

export interface OpcaoSelecaoMultipla {
  value: string;
  label: string;
}

interface SelecaoMultiplaProps {
  id?: string;
  label?: string;
  options?: OpcaoSelecaoMultipla[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function SelecaoMultipla({
  id,
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Todos",
  className = "",
}: SelecaoMultiplaProps) {
  const generatedId = useId();
  const buttonId = id || `multiselect-${generatedId}`;
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointer(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  const summary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `${selectedLabels.length} selecionados`;

  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange?.(value.filter((item) => item !== optionValue));
    } else {
      onChange?.([...value, optionValue]);
    }
  }

  return (
    <div className={`${styles.field} ${className}`} ref={wrapperRef}>
      {label ? (
        <label className={styles.label} htmlFor={buttonId}>
          {label}
        </label>
      ) : null}
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        className={styles.multiButton}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={value.length ? styles.multiValue : styles.multiPlaceholder}>
          {summary}
        </span>
        <Icone name={open ? "chevron-up" : "chevron-down"} size={18} />
      </button>
      {open ? (
        <div className={styles.multiPopover} role="group" aria-label={label}>
          <label className={styles.checkOption}>
            <input
              type="checkbox"
              checked={value.length === 0}
              onChange={() => onChange?.([])}
            />
            <span>{placeholder}</span>
          </label>
          {options.map((option) => (
            <label key={option.value} className={styles.checkOption}>
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => toggle(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
