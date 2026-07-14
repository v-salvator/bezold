"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/firebase/client";
import Section from "./Section";
import styles from "./Newsletter.module.css";

const BEEHIIV_FORM_ID = "8c308b72-2740-45dc-aa85-f482da8d1c69";
const BEEHIIV_LOADER = "https://subscribe-forms.beehiiv.com/v3/loader.js";

export default function Newsletter() {
  const formRef = useRef<HTMLDivElement>(null);

  // React does not execute <script> tags rendered in JSX, so the beehiiv
  // loader must be injected imperatively. It reads data-beehiiv-form and
  // renders the form inside this container.
  useEffect(() => {
    const container = formRef.current;
    if (!container || container.querySelector("script")) return;

    const script = document.createElement("script");
    script.src = BEEHIIV_LOADER;
    script.async = true;
    script.setAttribute("data-beehiiv-form", BEEHIIV_FORM_ID);
    container.appendChild(script);
  }, []);

  // Fire once when the section scrolls into view, giving us the impression
  // count to pair with beehiiv's own subscribe numbers for a conversion rate.
  // The submit itself happens inside beehiiv's cross-origin iframe, so it
  // can't be tracked from here — beehiiv's dashboard is the source of truth.
  const bandRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          trackEvent("newsletter_view", { location: "home_after_hero" });
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(band);
    return () => observer.disconnect();
  }, []);

  return (
    <Section variant="alt">
      <div ref={bandRef} className={styles.band}>
        <div className={styles.copy}>
          <h3>每週頂讓、創業資訊，第一手送進你的信箱</h3>
          <p>
            訂閱 Bezold
            週報，搶先掌握本週新上架的頂讓與轉讓商機。一週一封，隨時可取消訂閱。
          </p>
        </div>
        <div ref={formRef} className={styles.form} />
      </div>
    </Section>
  );
}
