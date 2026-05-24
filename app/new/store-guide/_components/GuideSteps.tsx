import Section from "../../_components/Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import type { SectionVariant } from "../../_components/Section";
import { cn } from "@/lib/utils";
import styles from "./GuideSteps.module.css";

export type GuideStep = {
  number: number;
  title: string;
  desc: string;
};

type Props = {
  anchorId: string;
  sectionNum: string;
  title: string;
  sub: string;
  variant: SectionVariant;
  type: "BUYER" | "SELLER";
  steps: GuideStep[];
};

export default function GuideSteps({
  anchorId,
  sectionNum,
  title,
  sub,
  variant,
  type,
  steps,
}: Props) {
  return (
    <Section variant={variant}>
      <span id={anchorId} aria-hidden="true" />
      <SectionTitle num={sectionNum} title={title} sub={sub} />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <StepCard key={step.number} step={step} type={type} />
        ))}
      </div>
    </Section>
  );
}

function StepCard({
  step,
  type,
}: {
  step: GuideStep;
  type: "BUYER" | "SELLER";
}) {
  const { number, title, desc } = step;
  return (
    <div
      className={cn(
        styles.step,
        type === "BUYER" ? styles.buyer : styles.seller,
      )}
    >
      <span className={styles.number}>{number}</span>
      <span className={styles.tag}>{type}</span>
      <h5 className={styles.title}>{title}</h5>
      <p className={styles.desc}>{desc}</p>
    </div>
  );
}
