// * no `@/` imports — tests/unit runs this file with plain `node --test`. The
// * caller formats prices and labels with the site's helpers and passes plain
// * strings in.
//
// * Mail clients drop <style>, flexbox and web fonts, so everything is tables
// * and inline styles. Design reference: docs/listing-follow-up-prototype.html

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface FollowUpEmailInput {
  appUrl: string; // * links point here (localhost in dev)
  storeId: string;
  storeName: string;
  sellerName: string; // * "" → plain 您好
  rows: [label: string, value: string][]; // * already formatted, empty ones left out
  token: string;
}

export interface SoldConfirmationInput {
  appUrl: string;
  storeId: string;
  storeName: string;
  sellerName: string;
  soldAtLabel: string; // * e.g. 2026/11/08 14:32 (Asia/Taipei)
}

// * images always come from production — mail clients can't load localhost
const ASSET_ORIGIN = "https://www.bezold.com.tw";
const HEADER_IMAGE = `${ASSET_ORIGIN}/email/bezold-email-header.png`;
const LINE_URL = "https://line.me/ti/p/~bezoldtw";

const COLOR = {
  ink: "#1c1a17",
  paper: "#f6f2e9",
  paper2: "#ece5d3",
  accent: "#b33a1d",
  muted: "#736b61",
  footerText: "#d8d0c0",
  footerDim: "#9c9384",
};

const FONT =
  "-apple-system,BlinkMacSystemFont,'PingFang TC','Noto Sans TC','Microsoft JhengHei',sans-serif";

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ESCAPES[character]);

const trimSlash = (url: string) => url.replace(/\/$/, "");

const greeting = (sellerName: string) =>
  sellerName.trim() ? `${sellerName.trim()} 您好，` : "您好，";

const shell = ({
  preheader,
  body,
}: {
  preheader: string;
  body: string;
}) => `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background:${COLOR.paper2};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.paper2}" style="background:${COLOR.paper2};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.paper}" style="max-width:600px;background:${COLOR.paper};border:1px solid ${COLOR.ink};border-radius:6px;font-family:${FONT};color:${COLOR.ink};">
  <tr><td align="center" bgcolor="${COLOR.ink}" style="background:${COLOR.ink};padding:28px 24px;border-radius:5px 5px 0 0;">
    <img src="${HEADER_IMAGE}" width="360" alt="Bezold 必售！頂讓創業平台" style="display:block;width:360px;max-width:100%;height:auto;border:0;color:${COLOR.paper};font-size:20px;font-weight:700;">
  </td></tr>
  ${body}
  <tr><td align="center" bgcolor="${COLOR.ink}" style="background:${COLOR.ink};padding:28px 24px;font-size:13px;line-height:1.9;color:${COLOR.footerText};border-radius:0 0 5px 5px;">
    Bezold 必售！｜台灣店面頂讓媒合平台<br>真實刊登 · 買賣直接聯絡
    <div style="margin:14px 0;">
      <a href="${ASSET_ORIGIN}/store-guide" style="color:${COLOR.paper};text-decoration:underline;">頂讓指南</a>
      <span style="color:#5c564d;">&nbsp;·&nbsp;</span>
      <a href="${LINE_URL}" style="color:${COLOR.paper};text-decoration:underline;">LINE 客服：bezoldtw</a>
    </div>
    <span style="font-size:12px;color:${COLOR.footerDim};">不想再收到 Bezold 的通知，回覆「取消」即可</span>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

const heading = (storeName: string, accentLine: string, eyebrow: string) => `
  <tr><td style="padding:32px 28px 0;">
    <div style="font-size:12px;letter-spacing:2px;color:${COLOR.accent};">BEZOLD&nbsp; ${eyebrow}</div>
    <div style="margin-top:12px;font-size:28px;line-height:1.35;font-weight:800;">「${escapeHtml(storeName)}」</div>
    <div style="font-size:28px;line-height:1.35;font-weight:800;color:${COLOR.accent};">${accentLine}</div>
  </td></tr>`;

const paragraph = (html: string) =>
  `<p style="margin:0 0 14px;font-size:16px;line-height:1.8;">${html}</p>`;

const infoCard = ({
  label,
  title,
  rows,
  link,
}: {
  label: string;
  title: string;
  rows: [string, string][];
  link: { href: string; label: string };
}) => `
  <tr><td style="padding:8px 28px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.paper2}" style="background:${COLOR.paper2};border:1px dashed ${COLOR.ink};border-radius:4px;">
      <tr><td style="padding:20px 22px;">
        <div style="font-size:12px;letter-spacing:2px;color:${COLOR.accent};">${label}</div>
        <div style="margin:10px 0 12px;font-size:19px;font-weight:600;">${escapeHtml(title)}</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:1.6;">
          ${rows
            .map(
              ([rowLabel, rowValue]) =>
                `<tr><td style="padding:4px 18px 4px 0;color:${COLOR.muted};white-space:nowrap;vertical-align:top;">${escapeHtml(rowLabel)}</td><td style="padding:4px 0;font-weight:700;">${escapeHtml(rowValue)}</td></tr>`,
            )
            .join("")}
        </table>
        <div style="margin-top:14px;"><a href="${link.href}" style="color:${COLOR.ink};font-weight:700;font-size:15px;text-decoration:underline;">${link.label}</a></div>
      </td></tr>
    </table>
  </td></tr>`;

// * "bulletproof" buttons: the link fills a table cell, so Outlook still
// * renders a clickable block
const primaryButton = (href: string, label: string) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;"><tr>
  <td bgcolor="${COLOR.accent}" style="background:${COLOR.accent};border:2px solid ${COLOR.ink};border-radius:4px;box-shadow:4px 4px 0 ${COLOR.ink};">
    <a href="${href}" style="display:inline-block;padding:13px 30px;font-size:17px;font-weight:800;color:#ffffff;text-decoration:none;font-family:${FONT};">${label}</a>
  </td></tr></table>`;

const secondaryButton = (href: string, label: string) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 4px;"><tr>
  <td bgcolor="#ffffff" style="background:#ffffff;border:1.5px solid ${COLOR.ink};border-radius:4px;">
    <a href="${href}" style="display:inline-block;padding:12px 26px;font-size:16px;font-weight:700;color:${COLOR.ink};text-decoration:none;font-family:${FONT};">${label}</a>
  </td></tr></table>`;

const signOff = (html: string) => `
  <tr><td style="padding:24px 28px 32px;">
    <div style="border-top:2px solid ${COLOR.ink};padding-top:22px;font-size:16px;line-height:1.8;">${html}<br><b>Bezold 團隊</b></div>
  </td></tr>`;

export const followUpEmail = (input: FollowUpEmailInput): EmailContent => {
  const appUrl = trimSlash(input.appUrl);
  const storeUrl = `${appUrl}/store/${input.storeId}`;
  // * raw URL for the text part; the HTML href needs & escaped
  const checkUrl = (answer: "still_selling" | "sold") =>
    `${appUrl}/listing-check?t=${input.token}&answer=${answer}`;
  const hello = greeting(input.sellerName);

  const html = shell({
    preheader: "點一下告訴我們，不用登入。",
    body: `
  ${heading(input.storeName, "還在頂讓嗎？", "刊登狀態確認")}
  <tr><td style="padding:24px 28px 8px;">
    ${paragraph(escapeHtml(hello))}
    ${paragraph("為了讓買家看到的資訊都是正確的，我們每 30 天會跟您確認一次刊登狀態。點下面其中一個按鈕就好，不用登入。")}
  </td></tr>
  ${infoCard({
    label: "您的刊登",
    title: input.storeName,
    rows: input.rows,
    link: { href: storeUrl, label: "查看刊登頁 →" },
  })}
  <tr><td style="padding:24px 28px 0;">
    ${primaryButton(escapeHtml(checkUrl("still_selling")), "還在頂讓 →")}
    ${secondaryButton(escapeHtml(checkUrl("sold")), "已經頂讓了")}
    <div style="margin-top:18px;font-size:13px;line-height:1.9;color:${COLOR.muted};">
      ※ 選「已經頂讓了」，刊登會立即改成「已頂讓」，之後不再寄確認信。<br>
      ※ 沒有回覆的話，刊登會照常顯示。<br>
      ※ 連結 30 天內有效，只能使用一次。
    </div>
  </td></tr>
  ${signOff("資料有變動（租金、頂讓金、照片），也可以直接回信告訴我們。")}`,
  });

  const text = [
    hello,
    "",
    `您在 Bezold 刊登的「${input.storeName}」還在頂讓嗎？為了讓買家看到的資訊都是正確的，我們每 30 天會跟您確認一次。點下面其中一個連結就好，不用登入。`,
    "",
    ...input.rows.map(([label, value]) => `${label}：${value}`),
    `刊登頁：${storeUrl}`,
    "",
    `還在頂讓：${checkUrl("still_selling")}`,
    `已經頂讓了：${checkUrl("sold")}`,
    "",
    "選「已經頂讓了」，刊登會立即改成「已頂讓」，之後不再寄確認信。沒有回覆的話，刊登會照常顯示。連結 30 天內有效，只能使用一次。",
    "",
    "資料有變動（租金、頂讓金、照片），也可以直接回信告訴我們。",
    "Bezold 團隊",
    "",
    "不想再收到 Bezold 的通知，回覆「取消」即可。",
  ].join("\n");

  return {
    subject: `「${input.storeName}」還在頂讓嗎？`,
    html,
    text,
  };
};

export const soldConfirmationEmail = (
  input: SoldConfirmationInput,
): EmailContent => {
  const storeUrl = `${trimSlash(input.appUrl)}/store/${input.storeId}`;
  const hello = greeting(input.sellerName);

  const html = shell({
    preheader: "您的刊登已改成已頂讓。如非本人操作，請直接回覆此信。",
    body: `
  ${heading(input.storeName, "恭喜成交！", "刊登狀態更新")}
  <tr><td style="padding:24px 28px 8px;">
    ${paragraph(escapeHtml(hello))}
    ${paragraph("我們已依照您的回覆，把刊登改成「已頂讓」。刊登頁會標示已頂讓，也不會再顯示您的聯絡方式，之後不會再寄確認信給您。")}
  </td></tr>
  ${infoCard({
    label: "刊登狀態",
    title: input.storeName,
    rows: [
      ["狀態", "已頂讓"],
      ["更新時間", input.soldAtLabel],
      ["更新方式", "回覆追蹤信"],
    ],
    link: { href: storeUrl, label: "查看刊登頁 →" },
  })}
  <tr><td style="padding:20px 28px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-left:4px solid ${COLOR.accent};background:#ffffff;">
      <tr><td style="padding:14px 16px;font-size:15px;line-height:1.8;">
        <b>不是您本人操作的？</b><br>請直接回覆這封信，我們會幫您恢復刊登。
      </td></tr>
    </table>
  </td></tr>
  ${signOff("謝謝您使用 Bezold，祝新的開始一切順利！")}`,
  });

  const text = [
    hello,
    "",
    `我們已依照您的回覆，把「${input.storeName}」改成「已頂讓」（${input.soldAtLabel}）。刊登頁會標示已頂讓，也不會再顯示您的聯絡方式。`,
    `刊登頁：${storeUrl}`,
    "",
    "不是您本人操作的？請直接回覆這封信，我們會幫您恢復刊登。",
    "",
    "Bezold 團隊",
  ].join("\n");

  return {
    subject: `「${input.storeName}」已改成已頂讓`,
    html,
    text,
  };
};
