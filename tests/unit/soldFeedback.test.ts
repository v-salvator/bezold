import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseSoldFeedback } from "../../utils/soldFeedback.ts";

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
