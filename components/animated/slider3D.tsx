import styles from "./slider3D.module.css";

const Slider3D = () => {
  const quantity = 8;
  const items = Array(quantity).fill(0);
  return (
    <div className={styles.banner}>
      <div
        className={styles.slider}
        style={{ "--quantity": 8 } as React.CSSProperties}
      >
        {items.map((_, index) => (
          <div
            className={styles.item}
            key={index}
            style={{ "--position": index } as React.CSSProperties}
          >
            <div className="">HEHEHE Store card</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider3D;
