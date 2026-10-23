import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId, useState } from "react";
import Icone from "@/shared/components/Icone/Icone";
import { descricaoPor, Campo } from "./Campo";
import styles from "./Formulario.module.css";

export interface EntradaProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "id" | "required" | "className"
  > {
  id?: string;
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  inputClassName?: string;
}

const Entrada = forwardRef<HTMLInputElement, EntradaProps>(function Entrada(
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
    <Campo
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
          aria-describedby={descricaoPor(fieldId, hint, error)}
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
            <Icone name={visible ? "eye-off" : "eye"} size={20} />
          </button>
        ) : null}
      </div>
    </Campo>
  );
});

export default Entrada;
