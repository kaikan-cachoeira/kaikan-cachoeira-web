import { forwardRef, useId, useState } from "react";
import Icon from "../Icon/Icon";
import { describedBy, Field } from "./Field";
import styles from "./Form.module.css";

const Input = forwardRef(function Input(
  {
    id,
    label,
    error,
    hint,
    required,
    type = "text",
    className = "",
    inputClassName = "",
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const fieldId = id || `campo-${generatedId}`;
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword && visible ? "text" : type;

  return (
    <Field
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      <div className={isPassword ? styles.controlWithAction : undefined}>
        <input
          ref={ref}
          id={fieldId}
          type={actualType}
          className={`${styles.control} ${inputClassName}`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy(fieldId, hint, error)}
          required={required}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            className={styles.fieldAction}
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={visible}
          >
            <Icon name={visible ? "eye-off" : "eye"} size={20} />
          </button>
        ) : null}
      </div>
    </Field>
  );
});

export default Input;
