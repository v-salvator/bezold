"use client";
import { motion } from "motion/react";
import { TextEffect } from "../motion-primitives/text-effect";
import { GlowEffect } from "../motion-primitives/glow-effect";
import Link from "next/link";

export default function ExploreButton() {
  return (
    <motion.div
      className="relative w-[96px] h-[40px] mt-[32px] mx-auto"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 1,
        delay: 2.5,
      }}
    >
      <GlowEffect
        colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
        mode="colorShift"
        blur="medium"
        duration={3}
        scale={1}
      />
      <Link
        className="relative inline-flex items-center justify-center gap-1 w-[96px] h-[40px] rounded-md bg-zinc-950 text-[16px] text-zinc-50 outline outline-1 outline-[#fff2f21f]"
        href="/store-list?category=all"
      >
        <TextEffect per="char">立即探索</TextEffect>
      </Link>
    </motion.div>
  );
}
