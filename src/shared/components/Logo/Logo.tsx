import logoKaikan from "@/assets/logo-kaikan-cachoeira.png";
import styles from "./Logo.module.css";

interface LogoProps {
  compact?: boolean;
}

export default function Logo({ compact = false }: LogoProps) {
  return (
    <div className={`${styles.logo} ${compact ? styles.compact : ""}`.trim()}>
      <span className={styles.mark}>
        <img
          className={styles.image}
          src={logoKaikan}
          alt="Kaikan Cachoeira"
          width={1951}
          height={806}
        />
      </span>
      {!compact ? (
        <span className={styles.descriptor}>Gestão da associação</span>
      ) : null}
    </div>
  );
}
