"use client";

import { motion } from "motion/react";
import {
  InstagramFilled,
  YoutubeFilled,
  FacebookFilled,
  LinkedinFilled,
} from "@ant-design/icons";
import ThreadsIcon from "@/components/icon/ThreadsIcon";
import Section from "./Section";
import styles from "./SocialBar.module.css";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
  hover: {
    y: -8,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
};

const iconVariants = {
  visible: {},
  hover: {
    scale: 1.3,
    rotate: -10,
    transition: { type: "spring", stiffness: 500, damping: 12 },
  },
};

const SOCIALS = [
  {
    href: "https://www.instagram.com/bezold.tw?igsh=enVjMDUwZWh3dnJy&utm_source=qr",
    label: "Instagram",
    icon: <InstagramFilled />,
  },
  {
    href: "https://www.youtube.com/@Bezold-v4u",
    label: "YouTube",
    icon: <YoutubeFilled />,
  },
  {
    href: "https://www.threads.com/@bezold.tw?igshid=NTc4MTIwNjQ2YQ==",
    label: "Threads",
    icon: <ThreadsIcon />,
  },
  {
    href: "https://www.facebook.com/share/19BX272yzL/?mibextid=wwXIfr",
    label: "Facebook",
    icon: <FacebookFilled />,
  },
  {
    href: "https://www.linkedin.com/in/bezold-tw-98390936b",
    label: "LinkedIn",
    icon: <LinkedinFilled />,
  },
];

export default function SocialBar() {
  return (
    <Section>
      <div className={styles.wrap}>
        <div className={styles.copy}>
          <h4>追蹤我們</h4>
          <p>第一手店面資訊 · 創業知識 · 最新消息</p>
        </div>
        <motion.div
          className={styles.icons}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {SOCIALS.map(({ href, label, icon }) => (
            <motion.a
              key={label}
              className={styles.link}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              variants={itemVariants}
              whileHover="hover"
            >
              <motion.span className={styles.iconWrap} variants={iconVariants}>
                {icon}
              </motion.span>
              <span>{label}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
