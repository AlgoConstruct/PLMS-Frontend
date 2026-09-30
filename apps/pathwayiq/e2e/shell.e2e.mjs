import { chromium } from "playwright";

// The landing page is public; after sign-in each user lands on /app with cards and menus from the backends.
const B = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch();
const log = (...a) => console.log("✓", ...a);

const anon = await (await browser.newContext()).newPage();
await anon.goto(`${B}/`);
await anon.getByRole("heading", { level: 1, name: /Learn with.*purpose/ }).waitFor();
await anon.getByRole("link", { name: "Sign in" }).first().click();
await anon.waitForURL(`${B}/login`);
log("landing page is public and links to sign in");

async function session(user) {
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
  await page.goto(`${B}/login`);
  await page.getByRole("button", { name: new RegExp(`^${user}`) }).click();
  await page.waitForURL(`${B}/app`);
  return page;
}

const admin = await session("superadmin");
await admin.locator('[data-card-key="admin-shortcuts"]').waitFor();
await admin.locator('[data-nav-key="iam-service-clients"]').waitFor();
await admin.locator('[data-nav-key="courses"]').waitFor();
log("super admin sees admin and learning menus, and the admin card");

const student = await session("student");
await student.locator('[data-card-key="my-classrooms"]').waitFor();
if (await student.locator('[data-card-key="admin-shortcuts"]').count()) throw new Error("student sees the admin card");
if (await student.locator('[data-nav-key="iam-roles"]').count()) throw new Error("student sees the Roles menu");
log("student sees learning cards and no admin menus");

await browser.close();
console.log("SHELL E2E PASSED");
