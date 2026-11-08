import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  followUpAnchor,
  isFollowUpDue,
  isLinkUsable,
  nextFollowUpDate,
  parseMaxPerRun,
  pickRecipient,
} from "../../utils/followUp.ts";
import {
  createToken,
  hashToken,
  isWellFormedToken,
} from "../../lib/followUp/token.ts";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-11-08T02:00:00Z");
const daysAgo = (days: number) => new Date(NOW.getTime() - days * DAY);

const approvedStore = (approvedDaysAgo: number) => ({
  status: "approved" as const,
  approvedTime: daysAgo(approvedDaysAgo),
  createTime: daysAgo(approvedDaysAgo + 5),
});

const noFollowUp = null;

const sentFollowUp = (overrides = {}) => ({
  sentCount: 1,
  lastSentTime: daysAgo(30),
  lastAnswer: null,
  lastAnswerTime: null,
  paused: false,
  ...overrides,
});

describe("followUpAnchor", () => {
  it("counts from the first approval", () => {
    const store = approvedStore(10);
    assert.equal(followUpAnchor(store), store.approvedTime);
  });

  it("falls back to createTime for stores approved before approvedTime existed", () => {
    const store = { status: "approved" as const, createTime: daysAgo(90) };
    assert.equal(followUpAnchor(store), store.createTime);
  });
});

describe("isFollowUpDue — first email", () => {
  it("is not due 59 days after approval", () => {
    assert.equal(isFollowUpDue(approvedStore(59), noFollowUp, NOW), false);
  });

  it("is due 60 days after approval", () => {
    assert.equal(isFollowUpDue(approvedStore(60), noFollowUp, NOW), true);
  });

  it("uses createTime when approvedTime is missing", () => {
    const legacyStore = {
      status: "approved" as const,
      createTime: daysAgo(61),
    };
    assert.equal(isFollowUpDue(legacyStore, noFollowUp, NOW), true);
  });

  it("treats a follow-up doc with nothing sent (paused early, no email) as first email", () => {
    const neverSent = sentFollowUp({ sentCount: 0, lastSentTime: null });
    assert.equal(isFollowUpDue(approvedStore(60), neverSent, NOW), true);
  });

  for (const status of ["pending", "rejected", "sold", "draft"] as const) {
    it(`is never due for a ${status} store`, () => {
      const store = { ...approvedStore(200), status };
      assert.equal(isFollowUpDue(store, noFollowUp, NOW), false);
    });
  }

  it("is never due when an admin paused it", () => {
    const paused = sentFollowUp({
      sentCount: 0,
      lastSentTime: null,
      paused: true,
    });
    assert.equal(isFollowUpDue(approvedStore(200), paused, NOW), false);
  });
});

describe("isFollowUpDue — repeat emails", () => {
  it("is not due 29 days after the last email", () => {
    const followUp = sentFollowUp({ lastSentTime: daysAgo(29) });
    assert.equal(isFollowUpDue(approvedStore(200), followUp, NOW), false);
  });

  it("is due 30 days after the last email when the seller didn't answer", () => {
    const followUp = sentFollowUp({ lastSentTime: daysAgo(30) });
    assert.equal(isFollowUpDue(approvedStore(200), followUp, NOW), true);
  });

  it("counts 30 days from a 「還在頂讓」 answer that came after the email", () => {
    const followUp = sentFollowUp({
      lastSentTime: daysAgo(35),
      lastAnswer: "still_selling",
      lastAnswerTime: daysAgo(20),
    });
    assert.equal(isFollowUpDue(approvedStore(200), followUp, NOW), false);
    assert.deepEqual(
      nextFollowUpDate(approvedStore(200), followUp),
      new Date(daysAgo(20).getTime() + 30 * DAY),
    );
  });

  it("keeps sending to a store whose sold answer an admin reverted", () => {
    // * a sold answer turned the store sold; an admin switched it back to approved
    const followUp = sentFollowUp({
      lastSentTime: daysAgo(40),
      lastAnswer: "sold",
      lastAnswerTime: daysAgo(39),
    });
    assert.equal(isFollowUpDue(approvedStore(200), followUp, NOW), true);
  });

  it("is never due when paused, however long ago the last email was", () => {
    const followUp = sentFollowUp({ lastSentTime: daysAgo(300), paused: true });
    assert.equal(isFollowUpDue(approvedStore(400), followUp, NOW), false);
  });
});

describe("nextFollowUpDate", () => {
  it("is 60 days after the anchor for a store never emailed", () => {
    assert.deepEqual(
      nextFollowUpDate(approvedStore(10), noFollowUp),
      new Date(daysAgo(10).getTime() + 60 * DAY),
    );
  });

  it("is null when the store will never be emailed", () => {
    assert.equal(
      nextFollowUpDate({ ...approvedStore(10), status: "sold" }, noFollowUp),
      null,
    );
    assert.equal(
      nextFollowUpDate(approvedStore(10), sentFollowUp({ paused: true })),
      null,
    );
  });
});

describe("pickRecipient", () => {
  it("prefers the seller's account email", () => {
    assert.equal(
      pickRecipient({
        userEmail: "owner@example.com",
        userInfoEmail: "old@example.com",
      }),
      "owner@example.com",
    );
  });

  it("falls back to the listing's contact email (admin-created listings)", () => {
    assert.equal(
      pickRecipient({ userEmail: "", userInfoEmail: " shop@example.com " }),
      "shop@example.com",
    );
  });

  it("returns null when there is no usable email", () => {
    assert.equal(
      pickRecipient({ userEmail: undefined, userInfoEmail: "not-an-email" }),
      null,
    );
    assert.equal(pickRecipient({}), null);
  });
});

describe("parseMaxPerRun", () => {
  it("defaults to 100", () => {
    assert.equal(parseMaxPerRun(undefined), 100);
    assert.equal(parseMaxPerRun(""), 100);
  });

  it("reads a positive whole number", () => {
    assert.equal(parseMaxPerRun("20"), 20);
  });

  it("falls back to 100 for anything else", () => {
    for (const value of ["abc", "0", "-5", "2.5"]) {
      assert.equal(parseMaxPerRun(value), 100, value);
    }
  });
});

describe("isLinkUsable", () => {
  const freshLink = {
    tokenUsed: false,
    tokenExpireTime: new Date(NOW.getTime() + DAY),
  };

  it("accepts an unused, unexpired link for an approved store", () => {
    assert.equal(isLinkUsable(freshLink, "approved", NOW), true);
  });

  it("rejects a used link", () => {
    assert.equal(
      isLinkUsable({ ...freshLink, tokenUsed: true }, "approved", NOW),
      false,
    );
  });

  it("rejects an expired link", () => {
    assert.equal(
      isLinkUsable(
        { ...freshLink, tokenExpireTime: daysAgo(1) },
        "approved",
        NOW,
      ),
      false,
    );
  });

  it("rejects a link whose store is no longer approved", () => {
    for (const status of [
      "pending",
      "rejected",
      "sold",
      "draft",
      undefined,
    ] as const) {
      assert.equal(isLinkUsable(freshLink, status, NOW), false, String(status));
    }
  });
});

describe("token", () => {
  it("creates 43-character url-safe tokens", () => {
    const token = createToken();
    assert.match(token, /^[A-Za-z0-9_-]{43}$/);
    assert.equal(isWellFormedToken(token), true);
  });

  it("never repeats a token", () => {
    const tokens = new Set(Array.from({ length: 200 }, createToken));
    assert.equal(tokens.size, 200);
  });

  it("hashes deterministically to sha256 hex", () => {
    assert.equal(hashToken("abc"), hashToken("abc"));
    assert.match(hashToken("abc"), /^[0-9a-f]{64}$/);
    assert.notEqual(hashToken("abc"), hashToken("abd"));
  });

  it("rejects malformed tokens before any lookup", () => {
    for (const value of ["", "short", "x".repeat(44), `${"a".repeat(42)}!`]) {
      assert.equal(isWellFormedToken(value), false, value);
    }
  });
});
