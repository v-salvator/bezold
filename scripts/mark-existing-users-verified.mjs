// One-off rollout script for email verification: marks every email/password
// account created before the deploy as verified, so existing members are not
// asked to verify. Accounts created after the cutoff are left alone — they
// went through the new verification flow.
//
// Dry run (default — lists the accounts, writes nothing):
//   node --env-file=.env scripts/mark-existing-users-verified.mjs --before 2026-10-20T00:00:00+08:00
// Apply:
//   node --env-file=.env scripts/mark-existing-users-verified.mjs --before 2026-10-20T00:00:00+08:00 --apply
//
// Reads the same FIREBASE_SERVER_* variables as firebase/configs.ts. Dev and
// prod share one Firebase project, so this touches every real account.

import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const USAGE =
  "Usage: node --env-file=.env scripts/mark-existing-users-verified.mjs --before <ISO date> [--apply]";

function parseArgs(argv) {
  const beforeIndex = argv.indexOf("--before");
  const beforeValue = beforeIndex >= 0 ? argv[beforeIndex + 1] : undefined;
  if (!beforeValue) {
    console.error(`Missing --before.\n${USAGE}`);
    process.exit(1);
  }
  const cutoff = new Date(beforeValue);
  if (Number.isNaN(cutoff.getTime())) {
    console.error(`--before is not a valid date: ${beforeValue}\n${USAGE}`);
    process.exit(1);
  }
  return { cutoff, apply: argv.includes("--apply") };
}

function maskEmail(email) {
  if (!email) return "(no email)";
  const [localPart, domain] = email.split("@");
  if (!domain) return email;
  return `${localPart.slice(0, 2)}***@${domain}`;
}

async function findUnverifiedPasswordUsers(auth, cutoff) {
  const matches = [];
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    for (const user of page.users) {
      const hasPassword = user.providerData.some(
        (provider) => provider.providerId === "password",
      );
      const createdAt = new Date(user.metadata.creationTime);
      if (hasPassword && !user.emailVerified && createdAt < cutoff) {
        matches.push(user);
      }
    }
    pageToken = page.pageToken;
  } while (pageToken);
  return matches;
}

async function main() {
  const { cutoff, apply } = parseArgs(process.argv.slice(2));

  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_SERVER_PROJECT_ID,
      clientEmail: process.env.FIREBASE_SERVER_CLIENT_EMAIL,
      // Tolerate a key stored with literal "\n" escapes in the env file.
      privateKey: process.env.FIREBASE_SERVER_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n",
      ),
    }),
  });
  const auth = getAuth(app);

  const users = await findUnverifiedPasswordUsers(auth, cutoff);
  console.log(
    `${users.length} unverified email/password account(s) created before ${cutoff.toISOString()}:`,
  );
  for (const user of users) {
    console.log(
      `  ${user.uid}  ${user.metadata.creationTime}  ${maskEmail(user.email)}`,
    );
  }

  if (!apply) {
    console.log("\nDry run — nothing written. Re-run with --apply to update.");
    return;
  }

  let updated = 0;
  const failures = [];
  for (const user of users) {
    try {
      await auth.updateUser(user.uid, { emailVerified: true });
      updated += 1;
    } catch (err) {
      failures.push({ uid: user.uid, message: err.message });
    }
  }
  console.log(`\nMarked ${updated} account(s) as verified.`);
  if (failures.length > 0) {
    console.error(`${failures.length} failed:`);
    for (const failure of failures) {
      console.error(`  ${failure.uid}: ${failure.message}`);
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
