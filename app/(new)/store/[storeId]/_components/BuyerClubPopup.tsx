"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAtom } from "jotai";
import { onAuthStateChanged } from "firebase/auth";
import { auth, trackEvent } from "@/firebase/client";
import Dropdown from "@/components/refactored/Dropdown";
import FormField from "@/components/refactored/FormField";
import EyeIcon from "@/app/(new)/_components/EyeIcon";
import { cityItems, amountItems } from "@/components/SearchFilter/DropDowns";
import { STORE_CATEGORIES } from "@/constant/storeType";
import {
  buyerClubOpenAtom,
  buyerClubSourceAtom,
  CONTACT_GATE_PREFIX,
} from "@/atoms/BuyerClubAtom";
import {
  BUYER_CLUB_COPY,
  BUYER_CLUB_SHARED_BENEFITS,
} from "@/constant/buyerClub";
import {
  signup,
  AUTH_ERRORS,
  getStrength,
  isValidEmail,
  strengthColors,
  strengthLabels,
} from "@/lib/auth/signup";
import styles from "./BuyerClubPopup.module.css";

const SUPPRESS_KEY = "buyerClubPopupSeen";

const categoryOptions = STORE_CATEGORIES.map((item) => ({
  label: item.label,
  value: item.key,
}));
const cityOptions = cityItems.map((item) => ({
  label: item.label as string,
  value: item.key,
}));
const amountOptions = amountItems.map((item) => ({
  label: item.label,
  value: item.key,
}));

function todayKey(): string {
  // Local YYYY-MM-DD, not UTC — the once-per-day boundary must fall at the
  // visitor's local midnight. toISOString() would roll over at 00:00 UTC
  // (08:00 in Taiwan), re-opening the popup mid-morning after a dismiss.
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function suppressedToday(): boolean {
  try {
    return localStorage.getItem(SUPPRESS_KEY) === todayKey();
  } catch {
    return false;
  }
}

function markSuppressed(): void {
  try {
    localStorage.setItem(SUPPRESS_KEY, todayKey());
  } catch {
    // Private mode / storage disabled — popup just won't be suppressed. Fine.
  }
}

export default function BuyerClubPopup({ forceOpen }: { forceOpen: boolean }) {
  // Gate everything on the FIRST resolved auth callback — reading
  // auth.currentUser synchronously would flash the popup for logged-in members
  // while Firebase restores the persisted session.
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Open state + entry point live in atoms so the seller contact gate — a
  // sibling subtree on the same page — can open this popup.
  const [open, setOpen] = useAtom(buyerClubOpenAtom);
  const [source, setSource] = useAtom(buyerClubSourceAtom);
  const pathname = usePathname();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [category, setCategory] = useState("");
  const [budgetKey, setBudgetKey] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const loggedIn = Boolean(firebaseUser);
      setIsLoggedIn(loggedIn);
      setAuthReady(true);
      if (loggedIn) {
        setOpen(false);
        return;
      }
      // Logged-out visitor: force-open (paid ad link) bypasses the daily cap;
      // organic visits respect it.
      const shouldOpen = forceOpen || !suppressedToday();
      const autoSource = forceOpen ? "url_force" : "auto";
      setSource(autoSource);
      setOpen(shouldOpen);
      if (shouldOpen) {
        // An organic auto-open counts as today's one showing — mark it now so
        // the cap holds even if the visitor navigates away without dismissing
        // (otherwise every store page would re-open it and re-fire impressions).
        // A force-open (ad landing) deliberately doesn't consume the cap.
        if (!forceOpen) markSuppressed();
        trackEvent("buyer_club_popup_impression", { source: autoSource });
      }
    });
    return () => {
      unsubscribe();
      // The atom outlives this component — leaving it open would flash the
      // popup on the next store page before auth resolves there.
      setOpen(false);
    };
  }, [forceOpen, setOpen, setSource]);

  // Lock body scroll while the popup is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") handleDismiss();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Opened from the locked seller contact block — the copy promises what the
  // visitor actually clicked for, and the daily cap does not apply.
  const isContactGate = source.startsWith(CONTACT_GATE_PREFIX);
  const copy = BUYER_CLUB_COPY[isContactGate ? "contactGate" : "default"];
  const loginHref = isContactGate ? `/login?redirect=${pathname}` : "/login";

  function handleDismiss() {
    setOpen(false);
    // A popup the visitor opened themselves must not consume the day's
    // auto-open allowance — the cap only governs uninvited interruptions.
    if (!isContactGate) markSuppressed();
    trackEvent("buyer_club_popup_dismiss", { source });
  }

  const strength = getStrength(password);
  const emailHint =
    emailTouched && email.length > 0 && !isValidEmail(email)
      ? "請輸入有效的電子信箱格式"
      : undefined;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("請填寫稱呼");
      return;
    }
    if (!isValidEmail(email)) {
      setError("請輸入有效的電子信箱");
      return;
    }
    if (password.length < 6) {
      setError("密碼請至少使用 6 個字元");
      return;
    }
    if (!category || !budgetKey || !city) {
      setError("請完整填寫買家條件（類型、預算、地區）");
      return;
    }
    if (!phone.trim() && !lineId.trim()) {
      setError("請至少填寫一種聯繫方式（電話或 LINE ID）");
      return;
    }
    if (!terms) {
      setError("請先同意服務條款與隱私政策");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signup({
        name,
        email,
        password,
        phone,
        lineId,
        source: isContactGate ? source : "buyer_club_popup",
        fromBuyerClub: true,
        buyerProfile: {
          category,
          city,
          budgetKey,
        },
      });
      // onAuthStateChanged fires with the new user → isLoggedIn flips true and
      // the popup unmounts. Close immediately so there's no lingering frame.
      setOpen(false);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(AUTH_ERRORS[code] ?? "發生未知錯誤，請再試一次");
    } finally {
      setLoading(false);
    }
  }

  // Nothing until auth resolves, and never for logged-in members.
  if (!authReady || isLoggedIn) return null;

  if (!open) {
    return (
      <button
        type="button"
        className={styles.fab}
        onClick={() => {
          setSource("fab");
          setOpen(true);
          trackEvent("buyer_club_popup_impression", { source: "fab" });
        }}
        aria-label="尋找適合你的下一間店"
      >
        <span className={styles.fabText}>尋找適合你的下一間店</span>
        <span className={styles.fabBadge} aria-hidden="true">
          B
        </span>
      </button>
    );
  }

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="buyerClubTitle"
      onClick={handleDismiss}
    >
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleDismiss}
          aria-label="關閉"
        >
          ✕
        </button>

        <aside className={styles.aside}>
          <p className={styles.brand}>✦ BEZOLD BUYER CLUB</p>
          <h2 className={styles.asideTitle}>
            {copy.asideTitle[0]}
            <br />
            {copy.asideTitle[1]}
          </h2>
          <p className={styles.asideLede}>{copy.asideLede}</p>
          <ul className={styles.benefits}>
            {[copy.firstBenefit, ...BUYER_CLUB_SHARED_BENEFITS].map(
              (benefit, index) => (
                <li key={benefit}>
                  <span className={styles.benefitNum}>
                    {String(index + 1).padStart(2, "0")}
                  </span>{" "}
                  {benefit}
                </li>
              ),
            )}
          </ul>
          <span className={styles.watermark} aria-hidden="true">
            B
          </span>
        </aside>

        <div className={styles.formPanel}>
          {loading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>建立帳號中，請稍候...</p>
            </div>
          )}
          <h3 id="buyerClubTitle" className={styles.formTitle}>
            建立你的買家條件
          </h3>
          <p className={styles.formSub}>填寫約 1 分鐘，標示 * 為必填。</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <FormField
                id="bc-name"
                label={<RequiredLabel>稱呼</RequiredLabel>}
                placeholder="怎麼稱呼您？"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <div className={styles.field}>
                <span className={styles.fieldLabel}>
                  <RequiredLabel>想找的頂讓類型</RequiredLabel>
                </span>
                <Dropdown
                  label="類型"
                  options={categoryOptions}
                  value={category}
                  onChange={setCategory}
                  placeholder="請選擇"
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>
                  <RequiredLabel>預算範圍</RequiredLabel>
                </span>
                <Dropdown
                  label="預算"
                  options={amountOptions}
                  value={budgetKey}
                  onChange={setBudgetKey}
                  placeholder="請選擇預算範圍"
                />
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>
                  <RequiredLabel>希望地區（縣市）</RequiredLabel>
                </span>
                <Dropdown
                  label="地區"
                  options={cityOptions}
                  value={city}
                  onChange={setCity}
                  placeholder="請選擇"
                />
              </div>
            </div>

            <div>
              <span className={styles.fieldLabel}>
                <RequiredLabel>聯繫方式</RequiredLabel>
                <span className={styles.hintNote}>
                  電話與 LINE ID 至少填一項
                </span>
              </span>
              <div className={styles.row}>
                <FormField
                  id="bc-phone"
                  label="電話"
                  type="text"
                  placeholder="例：0912345678"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
                <FormField
                  id="bc-line"
                  label="LINE ID"
                  placeholder="您的 LINE ID"
                  value={lineId}
                  onChange={(event) => setLineId(event.target.value)}
                />
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.row}>
              <FormField
                id="bc-email"
                label={<RequiredLabel>登入電子信箱</RequiredLabel>}
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setEmailTouched(true)}
                hint={emailHint}
              />
              <FormField
                id="bc-password"
                label={<RequiredLabel>設定密碼</RequiredLabel>}
                type={showPassword ? "text" : "password"}
                placeholder="至少 6 個字元"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                suffix={
                  <button
                    className={styles.eyeBtn}
                    type="button"
                    aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                    onClick={() => setShowPassword((previous) => !previous)}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                }
              />
            </div>

            {password.length > 0 && (
              <div className={styles.strengthRow}>
                <div className={styles.strengthBar}>
                  {[0, 1, 2, 3].map((index) => (
                    <span
                      key={index}
                      className={styles.strengthSegment}
                      style={{
                        background:
                          index < strength
                            ? strengthColors[strength]
                            : undefined,
                      }}
                    />
                  ))}
                </div>
                <span
                  className={styles.strengthLabel}
                  style={{ color: strengthColors[strength] }}
                >
                  {strengthLabels[strength]}
                </span>
              </div>
            )}

            <label className={styles.checkboxRow}>
              <input
                className={styles.checkbox}
                type="checkbox"
                checked={terms}
                onChange={(event) => setTerms(event.target.checked)}
              />
              <span>
                我同意{" "}
                <Link
                  className={styles.termsLink}
                  href="/terms"
                  target="_blank"
                >
                  服務條款
                </Link>{" "}
                與{" "}
                <Link
                  className={styles.termsLink}
                  href="/privacy"
                  target="_blank"
                >
                  隱私政策
                </Link>
              </span>
            </label>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? copy.submitLoading : copy.submit}
            </button>

            <p className={styles.loginHint}>
              已經有帳號？{" "}
              <Link className={styles.loginLink} href={loginHref}>
                由此登入
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children} <span className={styles.required}>*</span>
    </>
  );
}
