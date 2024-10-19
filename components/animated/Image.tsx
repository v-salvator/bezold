"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/utils";

interface AnimatedImageProps {
  src: string;
  alt: string;
  isRounded?: boolean;
  className?: string;
}

const AnimatedImage = ({
  src,
  alt,
  className,
  isRounded = true,
}: AnimatedImageProps) => {
  return (
    <motion.div
      className={cn(
        "relative w-full h-full bg-gray-200 cursor-pointer",
        isRounded && "rounded-[24px]",
        className
      )}
      // * animation
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      // * interaction
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Image
        className={cn(isRounded && "rounded-[24px]")}
        src={src ? src : "/assets/bezold.png"}
        fill
        alt={alt}
      />
    </motion.div>
  );
};

export default AnimatedImage;
