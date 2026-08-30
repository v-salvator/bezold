import {
  Rocket,
  Flame,
  Zap,
  Settings,
  CalendarDays,
  Eye,
  Check,
} from "lucide-react";
import Section from "@/app/(new)/_components/Section";
import { cn } from "@/lib/utils";
import {
  ACCELERATION_PLANS,
  type AccelerationPlan,
  type AccelerationPlanRow,
} from "@/constant/acceleration";
import AccelerationCta from "./AccelerationCta";
import styles from "./PackageGrid.module.css";

const planIcons = {
  rocket: Rocket,
  flame: Flame,
  zap: Zap,
} as const;

function RowIcon({ icon }: { icon: AccelerationPlanRow["icon"] }) {
  if (icon === "google") {
    return <span className={styles.googleG}>G</span>;
  }
  const Icon =
    icon === "service" ? Settings : icon === "period" ? CalendarDays : Eye;
  return <Icon size={17} className={styles.rowIcon} />;
}

function PlanCard({ plan }: { plan: AccelerationPlan }) {
  const PlanIcon = planIcons[plan.icon];
  return (
    <div className={cn(styles.card, plan.featured && styles.featured)}>
      {plan.badge && <span className={styles.badge}>{plan.badge}</span>}

      <div className={styles.cardHead}>
        <span className={styles.planIcon}>
          <PlanIcon size={22} />
        </span>
        <h3 className={styles.planName}>{plan.name}</h3>
      </div>

      <div className={styles.price}>
        <span className={styles.priceUnit}>NT$</span>
        <span className={styles.priceValue}>{plan.price}</span>
      </div>

      <ul className={styles.rows}>
        {plan.rows.map((row) => (
          <li key={row.text} className={styles.row}>
            <RowIcon icon={row.icon} />
            <span>{row.text}</span>
          </li>
        ))}
      </ul>

      <div className={styles.divider} />

      <ul className={styles.features}>
        {plan.features.map((feature) => (
          <li key={feature} className={styles.feature}>
            <Check size={16} className={styles.checkIcon} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <AccelerationCta
        plan={plan.id}
        variant={plan.featured ? "default" : "ghost"}
        className={styles.cardCta}
      >
        {plan.cta}
      </AccelerationCta>
      <p className={styles.note}>一次付費・無綁約</p>
    </div>
  );
}

export default function PackageGrid() {
  return (
    <Section>
      <div className={styles.head}>
        <span className={styles.kicker}>頂讓加速包</span>
        <h2 className={styles.title}>頂讓想更快？讓更多買家看見你的刊登</h2>
        <p className={styles.sub}>
          Bezold 為你投放 Google
          關鍵字廣告，主動觸及正在找店的潛在買家。更快被看見，更快找到接手人！
        </p>
      </div>
      <div className={styles.grid}>
        {ACCELERATION_PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </Section>
  );
}
