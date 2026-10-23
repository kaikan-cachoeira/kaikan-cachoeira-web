import type { ReactNode, TextareaHTMLAttributes } from "react";
import { forwardRef, useId } from "react";
import { descricaoPor, Campo } from "./Campo";
import styles from "./Formulario.module.css";

interface AreaTextoProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "id" | "required" | "className"
  > {
  id?: string;
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
}

const AreaTexto = forwardRef<HTMLTextAreaElement, AreaTextoProps>(
  function AreaTexto(
    { id, label, error, hint, required, className = "", rows = 4, ...props },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id || `campo-${generatedId}`;
    return (
      <Campo
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
          aria-describedby={descricaoPor(fieldId, hint, error)}
          required={required}
          {...props}
        />
      </Campo>
    );
  },
);

export default AreaTexto;
