// SEO health check: crawls every URL in the sitemap and checks canonical,
// description, Open Graph, h1, leaked non-public listings, duplicate
// descriptions, robots-vs-sitemap conflicts and the store 404 page.
//
//   npm run seo:audit                                   # http://localhost:3000
//   npm run seo:audit -- https://www.bezold.com.tw --skip h1,status
//   npm run seo:audit -- --noindex /store/abc,/store/def --json
//
// Sitemap URLs are fetched from <baseUrl> by path, so a local build whose
// NEXT_PUBLIC_APP_URL points at production is still audited locally. Each
// page's canonical must equal its sitemap URL. Exits 1 on any failure.

const DEFAULT_BASE_URL = "http://localhost:3000";
const MAX_CONNECTIONS = 8;
const REQUEST_TIMEOUT_MS = 30_000;
const MISSING_STORE_PATH = "/store/__seo_audit_missing__";

const CHECKS = {
  http: "HTTP 200",
  canonical: "canonical = own URL",
  description: "meta description present",
  og: "og:title / og:description / og:image",
  h1: "exactly one h1",
  status: "no non-public status in HTML",
  duplicateDescription: "description is unique",
  robotsSitemap: "sitemap URL not blocked by robots.txt",
  notFound: `${MISSING_STORE_PATH} returns 404`,
  noindex: "--noindex pages are noindex, nofollow",
};

const USAGE =
  "Usage: npm run seo:audit -- [baseUrl] [--skip <checks>] [--noindex <paths>] [--json]\n" +
  `Checks: ${Object.keys(CHECKS).join(", ")}`;

// * Matches both raw JSON and the escaped JSON inside the RSC payload
const NON_PUBLIC_STATUS_PATTERN =
  /\\?"status\\?":\\?"(draft|pending|rejected)\\?"/;

function parseArgs(argv) {
  const options = {
    baseUrl: DEFAULT_BASE_URL,
    skip: [],
    noindex: [],
    json: false,
  };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === "--json") options.json = true;
    else if (argument === "--skip") options.skip = splitList(argv[++index]);
    else if (argument === "--noindex")
      options.noindex = splitList(argv[++index]);
    else if (argument === "--help" || argument === "-h") {
      console.log(USAGE);
      process.exit(0);
    } else if (argument.startsWith("--")) {
      console.error(`Unknown option: ${argument}\n${USAGE}`);
      process.exit(2);
    } else options.baseUrl = argument.replace(/\/+$/, "");
  }
  const unknownChecks = options.skip.filter((check) => !(check in CHECKS));
  if (unknownChecks.length > 0) {
    console.error(
      `Unknown check in --skip: ${unknownChecks.join(", ")}\n${USAGE}`,
    );
    process.exit(2);
  }
  return options;
}

function splitList(value) {
  if (!value) {
    console.error(`Missing list value.\n${USAGE}`);
    process.exit(2);
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function fetchText(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { "user-agent": "bezold-seo-audit" },
  });
  return { status: response.status, text: await response.text() };
}

async function mapWithLimit(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex++;
        results[currentIndex] = await worker(items[currentIndex]);
      }
    },
  );
  await Promise.all(runners);
  return results;
}

function decodeEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&amp;/g, "&");
}

function parseAttributes(tag) {
  const attributes = {};
  for (const match of tag.matchAll(
    /([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g,
  )) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3]);
  }
  return attributes;
}

function parsePage(html) {
  // * Only the <head> holds metadata; RSC payload in <body> repeats it as JSON
  const head = html.split(/<\/head>/i)[0];
  const metaByKey = {};
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(tag);
    const key = attributes.name ?? attributes.property;
    if (key && !(key in metaByKey)) metaByKey[key] = attributes.content ?? "";
  }
  const canonicalTag = [...head.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => parseAttributes(tag))
    .find((attributes) => attributes.rel === "canonical");
  const titleMatch = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return {
    title: titleMatch ? decodeEntities(titleMatch[1]).trim() : undefined,
    canonical: canonicalTag?.href,
    description: metaByKey.description,
    robots: metaByKey.robots,
    ogTitle: metaByKey["og:title"],
    ogDescription: metaByKey["og:description"],
    ogImage: metaByKey["og:image"],
    h1Count: (html.match(/<h1[\s>]/gi) ?? []).length,
    nonPublicStatus: html.match(NON_PUBLIC_STATUS_PATTERN)?.[1],
  };
}

function normalizeUrl(url) {
  const parsed = new URL(url);
  if (parsed.pathname.length > 1)
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  return parsed.href;
}

function parseSitemap(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) =>
    decodeEntities(match[1].trim()),
  );
}

// * Disallow rules from the `User-agent: *` group
function parseRobotsDisallow(robotsText) {
  const disallowed = [];
  let inWildcardGroup = false;
  for (const rawLine of robotsText.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    const [field, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    if (/^user-agent$/i.test(field)) inWildcardGroup = value === "*";
    else if (inWildcardGroup && /^disallow$/i.test(field) && value)
      disallowed.push(value);
  }
  return disallowed;
}

function toLocalUrl(url, baseUrl) {
  const parsed = new URL(url);
  return `${baseUrl}${parsed.pathname}${parsed.search}`;
}

async function auditPage(sitemapUrl, baseUrl) {
  const localUrl = toLocalUrl(sitemapUrl, baseUrl);
  try {
    const { status, text } = await fetchText(localUrl);
    return {
      sitemapUrl,
      path: new URL(sitemapUrl).pathname,
      status,
      ...parsePage(text),
    };
  } catch (error) {
    return {
      sitemapUrl,
      path: new URL(sitemapUrl).pathname,
      status: 0,
      error: String(error),
    };
  }
}

function collectPageFailures(page, homeOgTitle) {
  const failures = [];
  const fail = (check, detail) =>
    failures.push({ check, url: page.path, detail });

  if (page.status !== 200) {
    fail("http", page.error ?? `status ${page.status}`);
    return failures;
  }
  if (!page.canonical) fail("canonical", "missing");
  else if (normalizeUrl(page.canonical) !== normalizeUrl(page.sitemapUrl))
    fail("canonical", `points to ${page.canonical}`);
  if (!page.description) fail("description", "missing");

  const missingOg = [
    ["og:title", page.ogTitle],
    ["og:description", page.ogDescription],
    ["og:image", page.ogImage],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missingOg.length > 0) fail("og", `missing ${missingOg.join(", ")}`);
  else if (page.path !== "/" && page.ogTitle === homeOgTitle)
    fail("og", "og:title is the home page title");

  if (page.h1Count !== 1) fail("h1", `${page.h1Count} h1`);
  if (page.nonPublicStatus)
    fail("status", `contains "status":"${page.nonPublicStatus}"`);
  return failures;
}

function collectDuplicateDescriptions(pages) {
  const pathsByDescription = new Map();
  for (const page of pages) {
    if (page.status !== 200 || !page.description) continue;
    const paths = pathsByDescription.get(page.description) ?? [];
    paths.push(page.path);
    pathsByDescription.set(page.description, paths);
  }
  return [...pathsByDescription.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([description, paths]) => ({
      check: "duplicateDescription",
      url: paths.join(", "),
      detail: `${paths.length} pages share "${description.slice(0, 40)}…"`,
    }));
}

function collectRobotsConflicts(sitemapUrls, disallowed) {
  return sitemapUrls.flatMap((url) => {
    const path = new URL(url).pathname;
    const rule = disallowed.find((prefix) => path.startsWith(prefix));
    return rule
      ? [{ check: "robotsSitemap", url: path, detail: `Disallow: ${rule}` }]
      : [];
  });
}

async function collectNotFoundFailure(baseUrl) {
  try {
    const { status } = await fetchText(`${baseUrl}${MISSING_STORE_PATH}`);
    return status === 404
      ? []
      : [
          {
            check: "notFound",
            url: MISSING_STORE_PATH,
            detail: `status ${status}`,
          },
        ];
  } catch (error) {
    return [
      { check: "notFound", url: MISSING_STORE_PATH, detail: String(error) },
    ];
  }
}

async function collectNoindexFailures(baseUrl, paths) {
  const pages = await mapWithLimit(paths, MAX_CONNECTIONS, (path) =>
    auditPage(new URL(path, baseUrl).href, baseUrl),
  );
  return pages.flatMap((page) => {
    const robots = (page.robots ?? "").toLowerCase();
    const isNoindex = robots.includes("noindex") && robots.includes("nofollow");
    if (page.status === 200 && isNoindex) return [];
    const detail =
      page.status !== 200
        ? `status ${page.status}`
        : `robots is "${page.robots ?? "(none)"}"`;
    return [{ check: "noindex", url: page.path, detail }];
  });
}

function printReport({ baseUrl, pageCount, activeChecks, skipped, failures }) {
  console.log(`SEO audit — ${baseUrl} (${pageCount} sitemap URLs)\n`);
  const labelWidth = Math.max(...activeChecks.map((check) => check.length));
  for (const check of activeChecks) {
    const count = failures.filter((failure) => failure.check === check).length;
    const mark = count === 0 ? "✓" : "✗";
    console.log(
      `${mark} ${check.padEnd(labelWidth)}  ${String(count).padStart(3)}  ${CHECKS[check]}`,
    );
  }
  if (skipped.length > 0) console.log(`\nSkipped: ${skipped.join(", ")}`);
  if (failures.length === 0) {
    console.log("\nNo failures.");
    return;
  }
  console.log(`\n${failures.length} failure(s):`);
  for (const check of activeChecks) {
    const checkFailures = failures.filter((failure) => failure.check === check);
    if (checkFailures.length === 0) continue;
    console.log(`\n[${check}]`);
    for (const failure of checkFailures)
      console.log(`  ${failure.url} — ${failure.detail}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { baseUrl } = options;

  const [robots, sitemap] = await Promise.all([
    fetchText(`${baseUrl}/robots.txt`),
    fetchText(`${baseUrl}/sitemap.xml`),
  ]);
  if (sitemap.status !== 200) {
    console.error(
      `Could not read ${baseUrl}/sitemap.xml (status ${sitemap.status})`,
    );
    process.exit(1);
  }
  const sitemapUrls = parseSitemap(sitemap.text);
  const disallowed =
    robots.status === 200 ? parseRobotsDisallow(robots.text) : [];

  const pages = await mapWithLimit(sitemapUrls, MAX_CONNECTIONS, (url) =>
    auditPage(url, baseUrl),
  );
  const homeOgTitle = pages.find((page) => page.path === "/")?.ogTitle;

  const allFailures = [
    ...pages.flatMap((page) => collectPageFailures(page, homeOgTitle)),
    ...collectDuplicateDescriptions(pages),
    ...collectRobotsConflicts(sitemapUrls, disallowed),
    ...(await collectNotFoundFailure(baseUrl)),
    ...(await collectNoindexFailures(baseUrl, options.noindex)),
  ];

  const activeChecks = Object.keys(CHECKS).filter(
    (check) =>
      !options.skip.includes(check) &&
      (check !== "noindex" || options.noindex.length > 0),
  );
  const failures = allFailures.filter((failure) =>
    activeChecks.includes(failure.check),
  );

  if (options.json) {
    const summary = Object.fromEntries(
      activeChecks.map((check) => [
        check,
        failures.filter((failure) => failure.check === check).length,
      ]),
    );
    console.log(
      JSON.stringify(
        {
          baseUrl,
          pageCount: sitemapUrls.length,
          skipped: options.skip,
          summary,
          failures,
        },
        null,
        2,
      ),
    );
  } else {
    printReport({
      baseUrl,
      pageCount: sitemapUrls.length,
      activeChecks,
      skipped: options.skip,
      failures,
    });
  }
  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
