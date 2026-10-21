import { forwardRef, useId } from "react";
import { describedBy, Field } from "./Field";
import styles from "./Form.module.css";

const Textarea = forwardRef(function Textarea(
  { id, label, error, hint, required, className = "", rows = 4, ...props },
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
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        className={styles.control}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        required={required}
        {...props}
      />
    </Field>
  );
});

export default Textarea;
