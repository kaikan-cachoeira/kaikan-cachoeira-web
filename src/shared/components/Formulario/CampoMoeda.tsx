import type { FocusEventHandler, ReactNode } from "react";
import { forwardRef, useEffect, useId, useState } from "react";
import { descricaoPor, Campo } from "./Campo";
import { formatarEntradaMoeda, converterMoeda } from "@/shared/lib/formatacao";
import styles from "./Formulario.module.css";

export interface CampoMoedaProps {
  id?: string;
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  value?: number | string | null;
  onChange?: (value: number) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  className?: string;
  name?: string;
  disabled?: boolean;
}

const CampoMoeda = forwardRef<HTMLInputElement, CampoMoedaProps>(
  function CampoMoeda(
    {
      id,
      label,
      error,
      hint,
      required,
      value,
      onChange,
      onBlur,
      className = "",
      name,
      disabled,
    },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id || `campo-${generatedId}`;
    const [focused, setFocused] = useState(false);
    const [display, setDisplay] = useState(() =>
      value !== undefined && value !== null && value !== ""
        ? formatarEntradaMoeda(value)
        : "",
    );

    useEffect(() => {
      if (!focused) {
        setDisplay(
          value !== undefined && value !== null && value !== ""
            ? formatarEntradaMoeda(value)
            : "",
        );
      }
    }, [value, focused]);

    return (
      <Campo
        id={fieldId}
        label={label}
        error={error}
        hint={hint}
        required={required}
        className={className}
      >
        <div className={styles.currencyWrapper}>
          <span className={styles.currencyPrefix} aria-hidden="true">
            R$
          </span>
          <input
            ref={ref}
            id={fieldId}
            name={name}
            type="text"
            inputMode="decimal"
            className={`${styles.control} ${styles.currencyControl}`}
            value={display}
            disabled={disabled}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={descricaoPor(fieldId, hint, error)}
            onFocus={() => setFocused(true)}
            onChange={(event) => {
              const raw = event.target.value;
              setDisplay(raw);
              onChange?.(converterMoeda(raw));
            }}
            onBlur={(event) => {
              setFocused(false);
              const parsed = converterMoeda(display);
              setDisplay(parsed ? formatarEntradaMoeda(parsed) : "");
              onChange?.(parsed);
              onBlur?.(event);
            }}
          />
        </div>
      </Campo>
    );
  },
);

export default CampoMoeda;
