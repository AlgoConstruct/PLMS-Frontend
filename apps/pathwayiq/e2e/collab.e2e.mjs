import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

// Needs IAM (:8080, dev), platform (:8082, with COLLAB_S3_* for local Garage and bucket CORS) and the app.
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
async function submit(page, name) {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name, exact: true }).click();
  await dialog.waitFor({ state: "detached" });
}

const teacher = await session("teacher");
const student = await session("student");

// Teacher creates a project and adds the student as a member.
await teacher.goto(`${B}/app/projects`);
await teacher.getByRole("button", { name: "New project" }).click();
await teacher.getByRole("dialog").getByLabel("Title").fill(`Collab ${ts}`);
await submit(teacher, "Create");
await teacher.waitForURL(/\/app\/c\/project\/[0-9a-f-]{36}$/);
const projectUrl = teacher.url();
await teacher.getByRole("button", { name: "Start" }).click();
await teacher.getByRole("alertdialog").getByRole("button", { name: "Start" }).click();
await teacher.locator('[data-nav-key="project-members"]').click();
await teacher.getByRole("button", { name: "Add members" }).click();
await teacher.getByRole("dialog").getByLabel("Role", { exact: true }).click();
await teacher.getByRole("option", { name: /^Member/ }).first().click();
await teacher.getByRole("dialog").getByRole("checkbox", { name: /^Student/ }).check();
await submit(teacher, "Add");
log("teacher created a project and added the student");

// Student adds a task, comments and uploads a file on it.
await student.goto(`${projectUrl}/board`);
await student.getByRole("button", { name: "Add task to To do" }).click();
await student.getByRole("dialog").getByLabel("Title").fill("Mount the servo");
await submit(student, "Add");
await student.locator("[data-task-key]", { hasText: "Mount the servo" }).click();
await student.getByRole("tab", { name: /Comments/ }).click();
await student.getByLabel("Write a comment (Markdown)").fill("Which **servo** size?");
await student.getByRole("button", { name: "Comment", exact: true }).click();
await student.getByRole("dialog").getByText("servo").first().waitFor();
log("student commented");

const file = join(tmpdir(), `wiring-${ts}.txt`);
writeFileSync(file, "red to 5V, black to GND\n");
await student.getByRole("tab", { name: /Files/ }).click();
await student.getByLabel("Choose a file").setInputFiles(file);
await student.locator(`[data-file="wiring-${ts}.txt"]`).waitFor();
log("student uploaded a file straight to storage");

await student.getByRole("tab", { name: /History/ }).click();
await student.locator('[data-activity="file.uploaded"]').waitFor();
await student.locator('[data-activity="comment.created"]').waitFor();
log("task history shows the comment and the upload");

// Teacher sees both and the counts on the card.
await teacher.goto(`${projectUrl}/board`);
const card = teacher.locator("[data-task-key]", { hasText: "Mount the servo" });
await card.getByText("1").first().waitFor();
await card.click();
await teacher.getByRole("tab", { name: /Comments \(1\)/ }).click();
await teacher.getByRole("dialog").getByText("size?").waitFor();
await teacher.getByRole("tab", { name: /Files \(1\)/ }).click();
// The signed URL answers with Content-Disposition: attachment, so the click downloads without leaving the page.
const [download] = await Promise.all([
  teacher.waitForEvent("download"),
  teacher.getByRole("button", { name: `Download wiring-${ts}.txt` }).click(),
]);
if (download.suggestedFilename() !== `wiring-${ts}.txt`) throw new Error(`unexpected download ${download.suggestedFilename()}`);
log("teacher sees the comment and can open the file");

await teacher.goto(projectUrl);
await teacher.locator('[data-activity="comment.created"]').first().waitFor();
log("project overview shows recent activity");

await browser.close();
console.log("COLLAB E2E PASSED");
