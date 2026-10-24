import { cn } from "@/lib/utils";
import { DIGITAL_TRANSFER_NOTES } from "@/constant/digitalAsset";
import descriptionStyles from "./StoreDescription.module.css";
import styles from "./DigitalTransferNotes.module.css";

// * fixed copy, the same on every digital asset — sellers can't edit it
export default function DigitalTransferNotes() {
  return (
    // * sits below the holder card — the card has no bottom margin of its own
    <div className={cn(descriptionStyles.section, styles.section)}>
      <h2 className={descriptionStyles.heading}>
        交易說明 <small>HOW IT WORKS</small>
      </h2>
      <ol className={styles.notes}>
        {DIGITAL_TRANSFER_NOTES.map((note, index) => (
          <li key={note.title} className={styles.note}>
            <span className={styles.index}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <b className={styles.title}>{note.title}</b>
              <p className={styles.body}>{note.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
