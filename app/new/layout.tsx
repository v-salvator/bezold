import {
  Caveat,
  Kalam,
  Gloria_Hallelujah,
  JetBrains_Mono,
} from "next/font/google";
import styles from "./layout.module.css";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});
const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-kalam",
  display: "swap",
});
const gloria = Gloria_Hallelujah({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-gloria",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export default function NewLayout({ children }: { children: React.ReactNode }) {
  const fontVars = `${caveat.variable} ${kalam.variable} ${gloria.variable} ${jetbrains.variable}`;

  return <div className={`${styles.root} ${fontVars}`}>{children}</div>;
}
