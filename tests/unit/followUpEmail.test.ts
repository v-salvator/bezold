import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  followUpEmail,
  soldConfirmationEmail,
} from "../../lib/followUp/emailTemplates.ts";

const TOKEN = "q9ZxR".padEnd(43, "a");

const physicalInput = {
  appUrl: "https://www.bezold.com.tw",
  storeId: "Xk29fLq0",
  storeName: "西螺日式拉麵店",
  sellerName: "王老闆",
  rows: [
    ["地區", "雲林縣西螺鎮"],
    ["坪數", "18 坪"],
    ["月租", "NT$ 4 萬"],
    ["頂讓金", "NT$ 45 萬"],
  ] as [string, string][],
  token: TOKEN,
};

describe("followUpEmail", () => {
  it("asks about the store in the subject", () => {
    assert.equal(
      followUpEmail(physicalInput).subject,
      "「西螺日式拉麵店」還在頂讓嗎？",
    );
  });

  it("links both answers to /listing-check with the token", () => {
    const { html, text } = followUpEmail(physicalInput);
    for (const answer of ["still_selling", "sold"]) {
      const link = `https://www.bezold.com.tw/listing-check?t=${TOKEN}&amp;answer=${answer}`;
      assert.ok(html.includes(`href="${link}"`), `html ${answer}`);
      assert.ok(text.includes(link.replace("&amp;", "&")), `text ${answer}`);
    }
  });

  it("shows every listing row it is given, and only those", () => {
    const { html } = followUpEmail({
      ...physicalInput,
      rows: [["地區", "雲林縣西螺鎮"]],
    });
    assert.ok(html.includes("雲林縣西螺鎮"));
    assert.ok(!html.includes("坪數"));
  });

  it("links the listing page", () => {
    assert.ok(
      followUpEmail(physicalInput).html.includes(
        'href="https://www.bezold.com.tw/store/Xk29fLq0"',
      ),
    );
  });

  it("greets by name, or just 您好 when there is none", () => {
    assert.ok(followUpEmail(physicalInput).html.includes("王老闆 您好，"));
    const anonymous = followUpEmail({ ...physicalInput, sellerName: "  " });
    assert.ok(anonymous.html.includes(">您好，<"));
    assert.ok(anonymous.text.startsWith("您好，"));
  });

  it("escapes store text", () => {
    const { html } = followUpEmail({
      ...physicalInput,
      storeName: '<script>alert("x")</script>',
      rows: [["地區", "A & B"]],
    });
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(html.includes("A &amp; B"));
  });

  it("loads the header image from the production site even in dev", () => {
    const { html } = followUpEmail({
      ...physicalInput,
      appUrl: "http://localhost:3000",
    });
    assert.ok(
      html.includes(
        'src="https://www.bezold.com.tw/email/bezold-email-header.png"',
      ),
    );
    assert.ok(html.includes("http://localhost:3000/listing-check?t="));
  });

  it("tells the seller a sold answer takes effect immediately", () => {
    assert.ok(followUpEmail(physicalInput).html.includes("立即"));
  });
});

describe("soldConfirmationEmail", () => {
  const soldInput = {
    appUrl: "https://www.bezold.com.tw",
    storeId: "Xk29fLq0",
    storeName: "西螺日式拉麵店",
    sellerName: "王老闆",
    soldAtLabel: "2026/11/08 14:32",
  };

  it("confirms the status change in the subject", () => {
    assert.equal(
      soldConfirmationEmail(soldInput).subject,
      "「西螺日式拉麵店」已改成已頂讓",
    );
  });

  it("tells the seller what to do if it wasn't them", () => {
    const { html, text } = soldConfirmationEmail(soldInput);
    assert.ok(html.includes("不是您本人操作的？"));
    assert.ok(text.includes("不是您本人操作"));
  });

  it("shows when it changed", () => {
    assert.ok(
      soldConfirmationEmail(soldInput).html.includes("2026/11/08 14:32"),
    );
  });

  it("escapes store text", () => {
    const { html } = soldConfirmationEmail({
      ...soldInput,
      storeName: "<b>x</b>",
    });
    assert.ok(!html.includes("<b>x</b>"));
  });
});
