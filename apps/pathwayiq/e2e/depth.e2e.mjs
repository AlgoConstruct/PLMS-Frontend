import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

// Needs IAM (:8080, dev), platform (:8082, with file storage) and the app. Deliverable submit → changes →
// resubmit → accept with a score → complete with a final score → public showcase without scores.
const B = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const ts = Date.now().toString().slice(-6);
const browser = await chromium.launch();
const log = (...a) => console.log("✓", ...a);

async function session(user) {
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
  await page.goto(`${B}/login`);
  await page.getByRole("button", { name: new RegExp(`^${user}`) }).click();
  await page.waitForURL(`${B}/app`);
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
function file(name, text) {
  const path = join(tmpdir(), name);
  writeFileSync(path, text);
  return path;
}

const teacher = await session("teacher");
const student = await session("student");

// ---------- template with a milestone and a scored deliverable ----------
await teacher.goto(`${B}/app/courses`);
await teacher.getByRole("button", { name: "New course" }).click();
await pick(teacher, "Organization unit", /^IT/);
await teacher.getByRole("dialog").getByLabel("Code").fill(`DP${ts}`);
await teacher.getByRole("dialog").getByLabel("Title").fill(`Depth ${ts}`);
await submit(teacher, "Create");
await teacher.waitForURL(/\/app\/courses\/[0-9a-f-]{36}/);
await teacher.getByRole("button", { name: "Add unit" }).click();
await teacher.getByRole("dialog").getByLabel("Title").fill("Basics");
await submit(teacher, "Add");
await teacher.getByRole("button", { name: "Project template" }).click();
const dialog = teacher.getByRole("dialog");
await dialog.getByLabel("Title", { exact: true }).fill(`Depth project ${ts}`);
await dialog.getByRole("button", { name: "Milestone", exact: true }).click();
await dialog.getByLabel("Milestone title").fill("Prototype");
await dialog.getByLabel("Milestone due after days").fill("7");
await dialog.getByRole("button", { name: "Deliverable", exact: true }).click();
await dialog.getByLabel("Deliverable title").fill("Design report");
await dialog.getByLabel("Deliverable milestone").selectOption({ label: "Prototype" });
await dialog.getByLabel("Deliverable max score").fill("10");
await submit(teacher, "Add");
await teacher.getByText("1 milestones").waitFor();
await teacher.getByRole("button", { name: "Publish" }).click();
await submit(teacher, "Publish");
await teacher.getByText("v1 · published").waitFor();
log("teacher published a template with a milestone and a deliverable");

// ---------- classroom and project ----------
await teacher.goto(`${B}/app/classrooms`);
await teacher.getByRole("button", { name: "New classroom" }).click();
await pick(teacher, "Organization unit", /^IT/);
await pick(teacher, "Course", new RegExp(`^Depth ${ts}`));
await teacher.getByRole("dialog").getByLabel("Code").fill(`DP${ts}-A`);
await teacher.getByRole("dialog").getByLabel("Title").fill(`Depth ${ts} A`);
await submit(teacher, "Create");
await teacher.waitForURL(/\/app\/c\/classroom\/[0-9a-f-]{36}$/);
await teacher.locator('[data-nav-key="classroom-members"]').click();
await teacher.getByRole("button", { name: "Add members" }).click();
await pick(teacher, "Role", /^Student/);
await teacher.getByRole("dialog").getByRole("checkbox", { name: /^Student/ }).check();
await submit(teacher, "Add");
await teacher.getByRole("cell", { name: "Student", exact: true }).first().waitFor();
await teacher.locator('[data-nav-key="classroom-projects"]').click();
await teacher.getByRole("button", { name: "Start project" }).click();
await submit(teacher, "Create");
await teacher.getByText("1 project started").waitFor();
log("teacher started the project");

// ---------- student submits ----------
await student.goto(`${B}/app/projects`);
await student.getByRole("link", { name: new RegExp(`Depth project ${ts}`) }).first().click();
await student.waitForURL(/\/app\/c\/project\/[0-9a-f-]{36}$/);
const projectUrl = student.url();
await student.goto(`${projectUrl}/deliverables`);
let card = student.locator('[data-deliverable="Design report"]');
await card.getByLabel("Choose a file").setInputFiles(file(`draft-${ts}.txt`, "first draft\n"));
await card.locator(`[data-file="draft-${ts}.txt"]`).waitFor();
await card.getByRole("button", { name: "Submit", exact: true }).click();
await student.getByRole("dialog").getByLabel("Note").fill("First draft");
await submit(student, "Submit");
await student.locator('[data-deliverable="Design report"] [data-status="SUBMITTED"]').waitFor();
log("student uploaded a file and submitted");

// ---------- teacher requests changes ----------
await teacher.goto(`${projectUrl}/deliverables`);
await teacher.locator('[data-deliverable="Design report"]').getByRole("button", { name: "Review", exact: true }).click();
await pick(teacher, "Decision", /^Request changes/);
await teacher.getByRole("dialog").getByLabel("Feedback").fill("Please add a wiring diagram.");
await submit(teacher, "Save review");
await teacher.locator('[data-deliverable="Design report"] [data-status="CHANGES_REQUESTED"]').waitFor();
log("teacher requested changes");

// ---------- student resubmits ----------
await student.goto(`${projectUrl}/deliverables`);
card = student.locator('[data-deliverable="Design report"]');
await card.getByLabel("Choose a file").setInputFiles(file(`diagram-${ts}.txt`, "wiring diagram\n"));
await card.locator(`[data-file="diagram-${ts}.txt"]`).waitFor();
await card.getByRole("button", { name: "Submit", exact: true }).click();
await submit(student, "Submit");
await student.locator('[data-deliverable="Design report"] [data-status="SUBMITTED"]').waitFor();
log("student resubmitted");

// ---------- teacher accepts with a score, completes, publishes ----------
await teacher.goto(`${projectUrl}/deliverables`);
await teacher.locator('[data-deliverable="Design report"]').getByRole("button", { name: "Review", exact: true }).click();
await teacher.getByRole("dialog").getByLabel(/^Score/).fill("9");
await teacher.getByRole("dialog").getByLabel("Feedback").fill("Great work.");
await submit(teacher, "Save review");
await teacher.locator('[data-deliverable="Design report"] [data-status="ACCEPTED"]').waitFor();
await teacher.locator('[data-deliverable="Design report"] [data-score]', { hasText: "9 / 10" }).waitFor();
await teacher.goto(`${projectUrl}/milestones`);
await teacher.locator('[data-milestone="Prototype"]', { hasText: "Accepted" }).waitFor();
log("teacher accepted with 9/10; the milestone shows it");

await teacher.goto(projectUrl);
await teacher.getByRole("button", { name: "Complete", exact: true }).click();
await teacher.getByRole("dialog").getByLabel(/^Final score/).fill("88");
await submit(teacher, "Complete");
await teacher.locator("[data-final-score]", { hasText: "88 / 100" }).waitFor();
await teacher.getByRole("button", { name: "Publish to showcase" }).click();
await teacher.getByRole("dialog").getByLabel("Show team names").check();
await submit(teacher, "Publish");
const href = await teacher.locator("[data-showcase-link]").getAttribute("href");
log("teacher completed with 88 and published", href);

// ---------- anyone can see the showcase, without scores ----------
const visitor = await (await browser.newContext()).newPage();
await visitor.goto(`${B}${href}`);
await visitor.getByRole("heading", { name: new RegExp(`Depth project ${ts}`) }).waitFor();
await visitor.locator('[data-deliverable="Design report"]').waitFor();
const text = await visitor.locator("main").innerText();
// Scores never reach the public page (check the formats the app uses; digits alone also appear in titles).
if (/\b9 \/ 10\b|\b88 \/ 100\b|score/i.test(text)) throw new Error("the public page shows a score");
const [download] = await Promise.all([
  visitor.waitForEvent("download"),
  visitor.getByRole("link", { name: new RegExp(`diagram-${ts}.txt`) }).click(),
]);
if (download.suggestedFilename() !== `diagram-${ts}.txt`) throw new Error(`unexpected download ${download.suggestedFilename()}`);
log("an anonymous visitor sees the showcase and downloads the accepted file; no scores shown");

await browser.close();
console.log("DEPTH E2E PASSED");
