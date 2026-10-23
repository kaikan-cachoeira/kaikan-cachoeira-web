import type { ReactNode, SelectHTMLAttributes } from "react";
import { forwardRef, useId } from "react";
import Icone from "@/shared/components/Icone/Icone";
import { descricaoPor, Campo } from "./Campo";
import styles from "./Formulario.module.css";

export interface OpcaoSelecao {
  value: string;
  label: string;
}

export interface SelecaoProps
  extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "id" | "required" | "className"
  > {
  id?: string;
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  options?: OpcaoSelecao[];
  placeholder?: string;
  className?: string;
}

const Selecao = forwardRef<HTMLSelectElement, SelecaoProps>(function Selecao(
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
    <Campo
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
          aria-describedby={descricaoPor(fieldId, hint, error)}
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
        <Icone name="chevron-down" size={18} className={styles.selectIcon} />
      </div>
    </Campo>
  );
});

export default Selecao;
