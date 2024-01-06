"use client";
import Image from "next/image";
import { motion } from "framer-motion";

interface AnimatedImageProps {
  src: string;
  alt: string;
}

const AnimatedImage = ({ src, alt }: AnimatedImageProps) => {
  return (
    <motion.div
      className="rounded-[24px] relative w-full h-full bg-gray-200"
      // * animation
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      // * interaction
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {src ? (
        <Image className="rounded-[24px]" src={src} fill alt={alt} />
      ) : null}
    </motion.div>
  );
};

export default AnimatedImage;
