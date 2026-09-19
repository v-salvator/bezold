// Copy for the buyer club popup. The form, validation and signup payload are
// identical in both variants — only the dark aside and the submit button change
// depending on where the popup was opened from:
//
//   default     — the popup opened itself (daily auto-open, FAB, ad landing)
//   contactGate — the visitor clicked a lock on the seller contact block, so
//                 the copy promises the thing they actually wanted
//
// Resolve with: source.startsWith(CONTACT_GATE_PREFIX) ? contactGate : default

export interface BuyerClubCopy {
  /** Rendered as two lines with a <br /> between them. */
  asideTitle: [string, string];
  asideLede: string;
  /** Benefits 02 and 03 are shared, only the first one changes. */
  firstBenefit: string;
  submit: string;
  submitLoading: string;
}

export const BUYER_CLUB_SHARED_BENEFITS = [
  "精準配對你的條件",
  "免費加入 · 隨時取消",
];

export const BUYER_CLUB_COPY: Record<"default" | "contactGate", BuyerClubCopy> =
  {
    default: {
      asideTitle: ["免費加入", "BEZOLD 買家俱樂部"],
      asideLede:
        "告訴我們你想找的類型、預算與地區。適合的新店上線時，第一時間通知你。",
      firstBenefit: "新案件優先通知",
      submit: "免費加入買家俱樂部 →",
      submitLoading: "建立中…",
    },
    contactGate: {
      asideTitle: ["加入後", "立刻看到聯絡方式"],
      asideLede:
        "為了保護屋主不被騷擾，聯絡方式只開放給買家俱樂部成員。加入是免費的，完成後這一頁的電話與 LINE 會立刻顯示。",
      firstBenefit: "立即解鎖本物件的電話與 LINE",
      submit: "免費加入並查看聯絡方式 →",
      submitLoading: "建立中…",
    },
  };
