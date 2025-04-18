import { cn } from "@/utils";
import styles from "./slider3D.module.css";

const Slider3D = ({
  cards = [],
  debug = false,
}: {
  cards?: React.ReactNode[];
  debug?: boolean;
}) => {
  return (
    <div className={styles.banner}>
      <div
        className={cn(styles.slider, debug && styles.sliderdebug)}
        style={{ "--quantity": cards.length } as React.CSSProperties}
      >
        {cards.map((card, index) => (
          <div
            className={styles.item}
            key={index}
            style={{ "--position": index } as React.CSSProperties}
          >
            {card}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider3D;
