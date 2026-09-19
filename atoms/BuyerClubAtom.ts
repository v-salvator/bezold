import { atom } from "jotai";

// Where the buyer club popup was opened from. `auto` / `url_force` / `fab` are
// the popup's own entry points; the `contact_gate_*` values come from the
// locked seller-contact block on the store detail page.
export type BuyerClubSource =
  | "auto"
  | "url_force"
  | "fab"
  | "contact_gate_blur"
  | "contact_gate_cta_phone"
  | "contact_gate_cta_line";

export const CONTACT_GATE_PREFIX = "contact_gate";

// The popup's open state lives in an atom (not component state) so the seller
// contact gate — rendered in a different subtree of the store page — can open
// it. Both sides are client components under the root <Provider>.
export const buyerClubOpenAtom = atom(false);
export const buyerClubSourceAtom = atom<BuyerClubSource>("auto");
