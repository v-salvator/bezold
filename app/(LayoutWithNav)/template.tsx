"use client";
import { motion } from "framer-motion";
import { useCategoryKey } from "@/hooks";

const variants = {
  hidden: { opacity: 0.4, x: -200, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
};

interface TemplateProps {
  children: React.ReactNode;
}

export default function Template({ children }: TemplateProps) {
  const categoryKey = useCategoryKey();

  return (
    <motion.main
      key={categoryKey}
      variants={variants}
      initial="hidden"
      animate="enter"
      transition={{ type: "spring", stiffness: 100 }}
    >
      {children}
    </motion.main>
  );
}
