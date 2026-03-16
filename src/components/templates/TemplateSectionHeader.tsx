import styles from "./TemplateSite.module.css";

type TemplateSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function TemplateSectionHeader({ eyebrow, title, description }: TemplateSectionHeaderProps) {
  return (
    <header className={styles.sectionHeader}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionDescription}>{description}</p>
    </header>
  );
}
