import { forwardRef, useEffect, useId, useState } from "react";
import { describedBy, Field } from "./Field";
import { formatCurrencyInput, parseCurrency } from "../../utils/format";
import styles from "./Form.module.css";

const CurrencyInput = forwardRef(function CurrencyInput(
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
      ? formatCurrencyInput(value)
      : "",
  );

  useEffect(() => {
    if (!focused) {
      setDisplay(
        value !== undefined && value !== null && value !== ""
          ? formatCurrencyInput(value)
          : "",
      );
    }
  }, [value, focused]);

  return (
    <Field
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
          aria-describedby={describedBy(fieldId, hint, error)}
          onFocus={() => setFocused(true)}
          onChange={(event) => {
            const raw = event.target.value;
            setDisplay(raw);
            onChange?.(parseCurrency(raw));
          }}
          onBlur={(event) => {
            setFocused(false);
            const parsed = parseCurrency(display);
            setDisplay(parsed ? formatCurrencyInput(parsed) : "");
            onChange?.(parsed);
            onBlur?.(event);
          }}
        />
      </div>
    </Field>
  );
});

export default CurrencyInput;
