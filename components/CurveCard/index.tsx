import styles from "./curve-card.module.css";

const CurveCard = ({ title, content }: { title: string; content: string }) => {
  return (
    <div className={styles.card}>
      <strong>{title}</strong>
      <br />
      <br />
      {content}
    </div>
  );
};

export default CurveCard;
