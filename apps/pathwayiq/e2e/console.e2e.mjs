import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

// End-to-end walkthrough against a running backend (dev profile) and frontend.
// Run: npm run e2e   (first time: npx playwright install chromium)
// Env: E2E_BASE_URL (console, default :3000), E2E_IAM_URL (IAM, default :8080)
const B = process.env.E2E_BASE_URL ?? "http://localhost:3000";
// IAM itself, for checking a revealed client secret against /oauth2/token.
const IAM = process.env.E2E_IAM_URL ?? B.replace(":3000", ":8080");
const ts = Date.now().toString().slice(-6);
const shots = process.env.E2E_SCREENSHOTS ?? "e2e/screenshots";
mkdirSync(shots, { recursive: true });
const browser = await chromium.launch();
const log = (...a) => console.log("✓", ...a);

async function session(user) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
  await page.goto(`${B}/login`);
  await page.getByRole("button", { name: new RegExp(`^${user}`) }).click();
  await page.waitForURL(`${B}/app`);
  await page.getByRole("heading", { name: /Welcome/ }).waitFor();
  log(`${user} signed in`);
  return page;
}
async function pick(page, label, option) {
  await page.getByRole("dialog").getByLabel(label, { exact: true }).click();
  await page.getByRole("option", { name: option }).first().click();
}
async function toast(page, text) {
  await page.locator("[data-sonner-toast]").filter({ hasText: text }).first().waitFor({ timeout: 10000 });
  log("toast:", text);
}

// ---------- superadmin builds a new hierarchy, role and assignment ----------
let page = await session("superadmin");
await page.screenshot({ path: `${shots}/01-dashboard.png` });
await page.goto(`${B}/app/admin/hierarchy`);
await page.screenshot({ path: `${shots}/02-hierarchy.png` });
await page.getByRole("button", { name: "New organization" }).click();
await page.getByLabel("Code").fill(`E2E_${ts}`);
await page.getByLabel("Name").fill(`E2E University ${ts}`);
await page.getByRole("button", { name: "Create", exact: true }).click();
await page.waitForURL(/\/app\/admin\/hierarchy\/types\?org=/);
await toast(page, "created");
const orgId = new URL(page.url()).searchParams.get("org");

for (const [name, code, parent] of [["University", "UNIVERSITY", null], ["Faculty", "FACULTY", "University"]]) {
  await page.getByRole("button", { name: "New node type" }).click();
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Code").fill(code);
  if (parent) await pick(page, "Parent type", new RegExp(parent));
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await toast(page, `Node type ${name} created`);
}
await page.screenshot({ path: `${shots}/03-node-types.png` });

await page.goto(`${B}/app/admin/hierarchy?org=${orgId}`);
await page.getByRole("button", { name: "Add root node" }).click();
await page.getByLabel("Name").fill("E2E University");
await page.getByLabel("Code").fill("UNI");
await page.getByRole("button", { name: "Create node" }).click();
await toast(page, "E2E University created");
await page.waitForURL(/node=/);
await page.getByRole("button", { name: "Add child" }).click();
await page.getByLabel("Name").fill("Engineering");
await page.getByLabel("Code").fill("ENG");
await page.getByRole("button", { name: "Create node" }).click();
await toast(page, "Engineering created");
await page.screenshot({ path: `${shots}/04-new-tree.png` });

await page.goto(`${B}/app/admin/roles`);
await page.getByRole("button", { name: "New role" }).click();
await page.getByLabel("Code").fill(`E2E_ROLE_${ts}`);
await page.getByLabel("Name").fill("E2E Faculty Reviewer");
await page.getByRole("button", { name: "Create role" }).click();
await page.waitForURL(/\/app\/admin\/roles\/[0-9a-f-]{36}/);
await toast(page, "created");
for (const code of ["organization.read", "iam.user.read", "iam.assignment.read"]) {
  await page.locator("li").filter({ hasText: code }).getByRole("checkbox").click();
}
await page.getByRole("button", { name: "Save permissions" }).click();
await toast(page, "Saved 3 permissions");
await page.screenshot({ path: `${shots}/05-role-permissions.png` });
await page.getByRole("tab", { name: /Members/ }).click();
await page.getByRole("button", { name: "Assign role" }).click();
await pick(page, "User", /Teacher/);
await pick(page, "Scope (where)", /Engineering/);
await page.getByRole("dialog").getByRole("button", { name: "Assign" }).click();
await toast(page, "teacher is now");
await page.getByRole("tab", { name: /Members/ }).click();
await page.getByRole("cell", { name: /Teacher/ }).first().waitFor();
await page.screenshot({ path: `${shots}/06-role-members.png` });
log("role created, permissions saved, teacher assigned at Engineering");

await page.goto(`${B}/app/admin/service-clients`);
await page.getByRole("button", { name: "New service client" }).click();
await page.getByLabel("Client id").fill(`e2e-svc-${ts}`);
await page.getByLabel("Name", { exact: true }).fill("E2E service");
await page.getByLabel("Permission prefixes").fill(`e2e${ts}`);
await page.getByRole("button", { name: "Create", exact: true }).click();
const secret = await page.getByRole("textbox", { name: "Client secret" }).inputValue();
if (secret.length < 40) throw new Error("client secret was not revealed");
await page.screenshot({ path: `${shots}/09-client-secret.png` });
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("cell", { name: new RegExp(`e2e-svc-${ts}`) }).waitFor();
log("service client created, secret revealed once");

const tokenResponse = await fetch(`${IAM}/oauth2/token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded",
             Authorization: "Basic " + Buffer.from(`e2e-svc-${ts}:${secret}`).toString("base64") },
  body: "grant_type=client_credentials",
});
if (tokenResponse.status !== 200) throw new Error(`client credentials failed: ${tokenResponse.status}`);
log("revealed secret works against /oauth2/token");

await page.goto(`${B}/app/admin/audit`);
await page.getByRole("cell", { name: /iam\.client\.create/ }).first().waitFor();
await page.screenshot({ path: `${shots}/10-audit.png` });
log("audit log shows the client creation");

// ---------- teacher now sees the new tree ----------
page = await session("teacher");
await page.goto(`${B}/app/admin/hierarchy?org=${orgId}`);
await page.getByRole("link", { name: /Engineering/ }).first().waitFor();
log("teacher sees Engineering in the new organization");

// ---------- collegeadmin: scoped UI + denials ----------
page = await session("collegeadmin");
await page.goto(`${B}/app/admin/roles`);
if (await page.getByRole("button", { name: "New role" }).count()) throw new Error("college admin should not get New role");
log("collegeadmin has no New role button (needs GLOBAL)");
await page.goto(`${B}/app/admin/users`);
await page.getByRole("link", { name: /Teacher/ }).first().click();
await page.getByRole("button", { name: "Assign role" }).click();
await pick(page, "Role", /Super Administrator/);
await pick(page, "Scope (where)", /IT Department/);
await page.getByRole("dialog").getByRole("button", { name: "Assign" }).click();
await page.getByRole("dialog").getByText(/Denied/).waitFor();
await page.screenshot({ path: `${shots}/07-escalation-denied.png` });
log("escalation attempt shows inline 403");

await page.goto(`${B}/app/admin/service-clients`);
await page.getByText(/403 · Not permitted/).waitFor();
log("collegeadmin cannot manage service clients");

await page.goto(`${B}/app/admin/access?permission=organization.update&target=CUSTOM&nodeId=`);
await page.screenshot({ path: `${shots}/08-access.png` });
await browser.close();
console.log("E2E PASSED");
