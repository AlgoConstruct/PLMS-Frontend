import { chromium } from "playwright";

// Needs IAM (:8080, dev), platform (:8082) and console (:3000). On a dev database created before this change,
// run Platform/scripts/sync-dev-iam.py (prefixes before starting the platform, grants after).
const B = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const ts = Date.now().toString().slice(-6);
const browser = await chromium.launch();
const log = (...a) => console.log("✓", ...a);

async function session(user) {
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
  await page.goto(`${B}/login`);
  await page.getByRole("button", { name: new RegExp(`^${user}`) }).click();
  await page.waitForURL(`${B}/`);
  return page;
}
async function pick(page, label, option) {
  await page.getByRole("dialog").getByLabel(label, { exact: true }).click();
  await page.getByRole("option", { name: option }).first().click();
}
async function submit(page, name) {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name, exact: true }).click();
  await dialog.waitFor({ state: "detached" });
}

const teacher = await session("teacher");
const student = await session("student");

// ---------- workspaces: same page, different menus ----------
await teacher.goto(`${B}/app/workspaces`);
await teacher.getByRole("button", { name: "New workspace" }).click();
await teacher.getByRole("dialog").getByLabel("Name").fill(`Menu test ${ts}`);
await submit(teacher, "Create");
await teacher.waitForURL(/\/app\/c\/workspace\//);
const workspaceUrl = teacher.url();
await teacher.locator('[data-nav-key="workspace-members"]').waitFor();
log("owner sees Overview + Members");

await student.goto(workspaceUrl);
await student.getByText(/403 · Not permitted/).waitFor();
if (await student.locator('[data-nav-key="workspace-members"]').count()) throw new Error("non-member saw the members menu");
log("non-member sees no context menu");

// ---------- course: draft, unit, publish ----------
await teacher.goto(`${B}/app/courses`);
await teacher.getByRole("button", { name: "New course" }).click();
await pick(teacher, "Organization unit", /^IT/);
await teacher.getByRole("dialog").getByLabel("Code").fill(`DB${ts}`);
await teacher.getByRole("dialog").getByLabel("Title").fill(`Databases ${ts}`);
await submit(teacher, "Create");
await teacher.waitForURL(/\/app\/courses\/[0-9a-f-]{36}/);
await teacher.getByRole("button", { name: "Add unit" }).click();
await teacher.getByRole("dialog").getByLabel("Title").fill("Relational model");
await submit(teacher, "Add");
await teacher.getByText("Relational model").waitFor();
await teacher.getByRole("button", { name: "Publish" }).click();
await submit(teacher, "Publish");
await teacher.getByText("v1 · published").waitFor();
log("teacher published a course version");

// ---------- classroom from the course ----------
await teacher.goto(`${B}/app/classrooms`);
await teacher.getByRole("button", { name: "New classroom" }).click();
await pick(teacher, "Organization unit", /^IT/);
await pick(teacher, "Course", new RegExp(`^Databases ${ts}`));
await teacher.getByRole("dialog").getByLabel("Code").fill(`DB${ts}-A`);
await teacher.getByRole("dialog").getByLabel("Title").fill(`Databases ${ts} A`);
await submit(teacher, "Create");
await teacher.waitForURL(/\/app\/c\/classroom\/[0-9a-f-]{36}$/);
const classroomUrl = teacher.url();
log("teacher created a classroom pinned to the published version");

await teacher.locator('[data-nav-key="classroom-members"]').click();
await teacher.getByRole("button", { name: "Add members" }).click();
await pick(teacher, "Role", /^Student/);
await teacher.getByRole("dialog").getByRole("checkbox", { name: /^Student/ }).check();
await submit(teacher, "Add");
await teacher.getByRole("cell", { name: "Student", exact: true }).first().waitFor();
log("teacher enrolled the student");

await teacher.locator('[data-nav-key="classroom-assignments"]').click();
await teacher.getByRole("button", { name: "New assignment" }).click();
await teacher.getByRole("dialog").getByLabel("Title").fill("ER diagram");
await pick(teacher, "Visibility", /^Published/);
await submit(teacher, "Create");
await teacher.getByText("ER diagram").waitFor();
log("teacher published an assignment");

// ---------- the student's view of the same classroom ----------
await student.goto(classroomUrl);
await student.locator('[data-nav-key="classroom-assignments"]').click();
await student.getByText("ER diagram").waitFor();
if (await student.getByRole("button", { name: "New assignment" }).count()) throw new Error("student can create assignments");
log("student sees the assignment and no management actions");
await student.locator('[data-nav-key="classroom-content"]').click();
await student.getByText("Relational model").waitFor();
log("student reads the course content");

await browser.close();
console.log("PLATFORM E2E PASSED");
