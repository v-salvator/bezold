import styles from "./highlighter.module.css";

const Highlighter = ({ cards }: { cards: React.ReactNode[] }) => {
  return (
    <div className={styles.highlighter}>
      {cards.map((card, index) => (
        <div className={styles.card} key={index}>
          {card}
        </div>
      ))}
    </div>
  );
};

export default Highlighter;
