"use client";

import { motion } from "motion/react";
import {
  InstagramFilled,
  YoutubeFilled,
  FacebookFilled,
  LinkedinFilled,
} from "@ant-design/icons";
import ThreadsIcon from "@/components/icon/ThreadsIcon";
import { SOCIAL_LINKS } from "@/constant/socials";
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
    href: SOCIAL_LINKS.instagram,
    label: "Instagram",
    icon: <InstagramFilled />,
  },
  { href: SOCIAL_LINKS.youtube, label: "YouTube", icon: <YoutubeFilled /> },
  { href: SOCIAL_LINKS.threads, label: "Threads", icon: <ThreadsIcon /> },
  { href: SOCIAL_LINKS.facebook, label: "Facebook", icon: <FacebookFilled /> },
  { href: SOCIAL_LINKS.linkedin, label: "LinkedIn", icon: <LinkedinFilled /> },
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
