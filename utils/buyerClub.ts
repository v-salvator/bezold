import {
  CONTACT_GATE_PREFIX,
  type BuyerClubSource,
} from "@/atoms/BuyerClubAtom";
import { BUYER_CLUB_DIGITAL_CATEGORY } from "@/constant/buyerClub";

const DIGITAL_INQUIRY_SOURCE: BuyerClubSource = "digital_inquiry";

// * a digital asset has no location — buyers looking for one may skip 地區
export const isBuyerCityRequired = (category: string) =>
  category !== BUYER_CLUB_DIGITAL_CATEGORY;

export const buyerConditionsError = ({
  category,
  budgetKey,
  city,
}: {
  category: string;
  budgetKey: string;
  city: string;
}) => {
  const cityRequired = isBuyerCityRequired(category);
  if (!category || !budgetKey || (cityRequired && !city))
    return cityRequired
      ? "請完整填寫買家條件（類型、預算、地區）"
      : "請完整填寫買家條件（類型、預算）";
  return null;
};

// * entry points the visitor chose themselves (a contact lock, a digital
// * asset's inquiry button) — they never consume the daily auto-open cap
export const isVisitorOpenedSource = (source: BuyerClubSource) =>
  source.startsWith(CONTACT_GATE_PREFIX) || source === DIGITAL_INQUIRY_SOURCE;

// * sign_up / user-doc attribution: visitor-opened entry points are kept so
// * members can be traced back to them; the rest collapse to the popup
export const buyerClubSignupSource = (source: BuyerClubSource) =>
  isVisitorOpenedSource(source) ? source : "buyer_club_popup";
