import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseSoldFeedback,
  priceRatioPercent,
  summarizeSoldFeedback,
} from "../../utils/soldFeedback.ts";

describe("parseSoldFeedback", () => {
  it("accepts a fully filled form and converts 萬 to NT$", () => {
    const result = parseSoldFeedback({
      soldDuration: "1_to_3m",
      buyerSource: "bezold",
      finalPriceWan: 40.5,
      satisfaction: 4,
      comment: "  買家是看到 Bezold 的刊登來問的  ",
    });
    assert.deepEqual(result, {
      ok: true,
      fields: {
        soldDuration: "1_to_3m",
        buyerSource: "bezold",
        finalPrice: 405_000,
        satisfaction: 4,
        comment: "買家是看到 Bezold 的刊登來問的",
      },
    });
  });

  it("turns skipped questions into null / empty", () => {
    const result = parseSoldFeedback({ satisfaction: 5 });
    assert.deepEqual(result, {
      ok: true,
      fields: {
        soldDuration: null,
        buyerSource: null,
        finalPrice: null,
        satisfaction: 5,
        comment: "",
      },
    });
  });

  it("accepts a price typed as text, and a free transfer (0)", () => {
    const typed = parseSoldFeedback({ finalPriceWan: "45" });
    assert.equal(typed.ok && typed.fields.finalPrice, 450_000);
    const free = parseSoldFeedback({ finalPriceWan: 0 });
    assert.equal(free.ok && free.fields.finalPrice, 0);
  });

  it("ignores the auth keys the two paths send", () => {
    const result = parseSoldFeedback({
      token: "x",
      storeId: "y",
      satisfaction: 3,
    });
    assert.equal(result.ok, true);
  });

  it("rejects an all-empty submission", () => {
    assert.deepEqual(parseSoldFeedback({ comment: "   ", finalPriceWan: "" }), {
      ok: false,
      error: "empty_feedback",
    });
  });

  const invalidBodies: [string, Record<string, unknown>][] = [
    ["an unknown duration", { soldDuration: "2_years" }],
    ["an unknown buyer source", { buyerSource: "facebook" }],
    ["satisfaction 0", { satisfaction: 0 }],
    ["satisfaction 6", { satisfaction: 6 }],
    ["fractional satisfaction", { satisfaction: 4.5 }],
    ["a negative price", { finalPriceWan: -1 }],
    ["an absurd price", { finalPriceWan: 100_001 }],
    ["a non-numeric price", { finalPriceWan: "四十萬" }],
    ["a 501-character comment", { comment: "好".repeat(501) }],
    ["an extra key", { satisfaction: 5, rating: 5 }],
  ];
  for (const [label, body] of invalidBodies) {
    it(`rejects ${label}`, () => {
      assert.deepEqual(parseSoldFeedback(body), {
        ok: false,
        error: "invalid_field",
      });
    });
  }

  it("counts emoji as one character toward the 500 limit", () => {
    const result = parseSoldFeedback({ comment: "👍".repeat(500) });
    assert.equal(result.ok, true);
  });

  it("rejects a body that isn't an object", () => {
    assert.deepEqual(parseSoldFeedback(null), {
      ok: false,
      error: "invalid_field",
    });
  });
});

describe("priceRatioPercent", () => {
  it("is the final price as a whole percent of the listed price", () => {
    assert.equal(
      priceRatioPercent({ finalPrice: 900_000, listedPrice: 1_000_000 }),
      90,
    );
    assert.equal(
      priceRatioPercent({ finalPrice: 520_000, listedPrice: 600_000 }),
      87,
    );
  });

  it("is null when the seller skipped the price", () => {
    assert.equal(
      priceRatioPercent({ finalPrice: null, listedPrice: 600_000 }),
      null,
    );
  });

  it("is null for 面議 / 免頂讓金 listings (listed at 0)", () => {
    assert.equal(
      priceRatioPercent({ finalPrice: 300_000, listedPrice: 0 }),
      null,
    );
  });
});

describe("summarizeSoldFeedback", () => {
  const feedback = (overrides: Record<string, unknown>) => ({
    storeId: "sold-1",
    soldDuration: null,
    buyerSource: null,
    finalPrice: null,
    listedPrice: 500_000,
    satisfaction: null,
    ...overrides,
  });
  const rows = [
    feedback({
      soldDuration: "1_to_3m",
      buyerSource: "bezold",
      satisfaction: 5,
      finalPrice: 450_000,
    }),
    feedback({
      storeId: "sold-2",
      soldDuration: "1_to_3m",
      buyerSource: "referral",
      satisfaction: 3,
    }),
    feedback({
      storeId: "sold-3",
      soldDuration: "under_1m",
      buyerSource: "bezold",
      finalPrice: 400_000,
    }),
    // * an admin switched this store back to approved; its feedback stays
    feedback({
      storeId: "reverted",
      satisfaction: 4,
      finalPrice: 300_000,
      listedPrice: 0,
    }),
  ] as Parameters<typeof summarizeSoldFeedback>[0];

  const soldStoreIds = new Set(
    Array.from({ length: 10 }, (_, index) => `sold-${index + 1}`),
  );
  const summary = summarizeSoldFeedback(rows, soldStoreIds);

  it("counts every feedback, but the fill rate only over stores still sold", () => {
    assert.equal(summary.count, 4);
    assert.equal(summary.soldWithFeedback, 3);
    assert.equal(summary.soldStoreCount, 10);
    assert.equal(summary.fillRatePercent, 30);
  });

  it("measures the Bezold share among answers that named a buyer source", () => {
    assert.deepEqual(summary.viaBezold, { count: 2, answered: 3, percent: 67 });
  });

  it("averages satisfaction over the rated feedback only", () => {
    assert.deepEqual(summary.satisfaction, { average: 4, answered: 3 });
  });

  it("averages 成交價 ÷ 刊登價 only where both prices exist", () => {
    assert.deepEqual(summary.priceRatio, { averagePercent: 85, answered: 2 });
  });

  it("counts each duration and source answer, plus the unanswered", () => {
    assert.equal(summary.durations["1_to_3m"], 2);
    assert.equal(summary.durations.under_1m, 1);
    assert.equal(summary.durations.over_6m, 0);
    assert.equal(summary.durationUnanswered, 1);
    assert.equal(summary.sources.bezold, 2);
    assert.equal(summary.sourceUnanswered, 1);
  });

  it("reports nothing to average for an empty list", () => {
    const empty = summarizeSoldFeedback([], new Set());
    assert.equal(empty.fillRatePercent, null);
    assert.equal(empty.viaBezold.percent, null);
    assert.equal(empty.satisfaction.average, null);
    assert.equal(empty.priceRatio.averagePercent, null);
  });
});
