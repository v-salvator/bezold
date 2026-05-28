"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { useInView } from "motion/react";

const AnimatedNTValue = ({
  targetValue,
  initialValue = 0,
}: {
  targetValue: number;
  initialValue?: number;
}) => {
  const [value, setValue] = useState(initialValue);
  const ref = useRef(null);
  const isInView = useInView(ref);

  if (isInView && value === initialValue) {
    setValue(targetValue);
  }

  return (
    <span ref={ref}>
      NT$&nbsp;
      <AnimatedNumber
        value={value}
        springOptions={{
          bounce: 0,
          duration: 1200,
        }}
      />
    </span>
  );
};

export default AnimatedNTValue;
