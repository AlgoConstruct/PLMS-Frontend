import { chromium } from "playwright";

// Two users, same workspace, different menus. Needs IAM (:8080, dev), platform (:8082) and console (:3000).
const B = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch();
const log = (...a) => console.log("✓", ...a);

async function session(user) {
  const page = await (await browser.newContext()).newPage();
  await page.goto(`${B}/login`);
  await page.getByRole("button", { name: new RegExp(`^${user}`) }).click();
  await page.waitForURL(`${B}/`);
  return page;
}

const teacher = await session("teacher");
await teacher.goto(`${B}/app/workspaces`);
await teacher.getByRole("button", { name: "New workspace" }).click();
await teacher.getByLabel("Name").fill(`Menu test ${Date.now()}`);
await teacher.getByRole("button", { name: "Create", exact: true }).click();
await teacher.waitForURL(/\/app\/c\/workspace\//);
const url = teacher.url();
await teacher.locator('[data-nav-key="workspace-members"]').waitFor();
log("owner sees Overview + Members");

const student = await session("student");
await student.goto(url);
await student.getByText(/403 · Not permitted/).waitFor();
if (await student.locator('[data-nav-key="workspace-members"]').count()) throw new Error("non-member saw the members menu");
log("non-member sees no context menu");

await browser.close();
console.log("PLATFORM E2E PASSED");
