import { forwardRef, useId } from "react";
import Icon from "../Icon/Icon";
import { describedBy, Field } from "./Field";
import styles from "./Form.module.css";

const Select = forwardRef(function Select(
  {
    id,
    label,
    error,
    hint,
    required,
    options = [],
    placeholder,
    className = "",
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const fieldId = id || `campo-${generatedId}`;
  return (
    <Field
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      <div className={styles.selectWrapper}>
        <select
          ref={ref}
          id={fieldId}
          className={styles.control}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy(fieldId, hint, error)}
          required={required}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={18} className={styles.selectIcon} />
      </div>
    </Field>
  );
});

export default Select;
