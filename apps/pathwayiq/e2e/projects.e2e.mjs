import { chromium } from "playwright";

// Needs IAM (:8080, dev), platform (:8082) and the app (:3000). On an older dev database run
// Platform/scripts/sync-dev-iam.py prefixes (before starting the platform) and grants (after).
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
/** Drags with small mouse steps so dnd-kit's pointer sensor (5 px activation) sees a real drag. */
async function drag(page, from, to) {
  await to.scrollIntoViewIfNeeded();
  await from.scrollIntoViewIfNeeded();
  const a = await from.boundingBox();
  const b = await to.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2, { steps: 5 });
  await page.mouse.move(b.x + b.width / 2, b.y + 40, { steps: 20 });
  await page.waitForTimeout(200);          // dnd-kit resolves the drop target on the next animation frames
  // The move is saved by a Server Action (a POST to the page); wait for it, or a reload would cancel it.
  const saved = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/board"));
  await page.mouse.up();
  await saved;
}

const teacher = await session("teacher");
const student = await session("student");

// ---------- course with a project template ----------
await teacher.goto(`${B}/app/courses`);
await teacher.getByRole("button", { name: "New course" }).click();
await pick(teacher, "Organization unit", /^IT/);
await teacher.getByRole("dialog").getByLabel("Code").fill(`RB${ts}`);
await teacher.getByRole("dialog").getByLabel("Title").fill(`Robotics ${ts}`);
await submit(teacher, "Create");
await teacher.waitForURL(/\/app\/courses\/[0-9a-f-]{36}/);
await teacher.getByRole("button", { name: "Add unit" }).click();
await teacher.getByRole("dialog").getByLabel("Title").fill("Motors");
await submit(teacher, "Add");
await teacher.getByRole("button", { name: "Project template" }).click();
await teacher.getByRole("dialog").getByLabel("Title").fill(`Robot arm ${ts}`);
await teacher.getByRole("dialog").getByLabel("Objectives").fill("Lift 1 kg\nDemo video");
await teacher.getByRole("dialog").getByLabel("Duration (days)").fill("14");
await submit(teacher, "Add");
await teacher.getByText(`Robot arm ${ts}`).waitFor();
await teacher.getByRole("button", { name: "Publish" }).click();
await submit(teacher, "Publish");
await teacher.getByText("v1 · published").waitFor();
log("teacher published a course with a project template");

// ---------- classroom, enrollment, start project ----------
await teacher.goto(`${B}/app/classrooms`);
await teacher.getByRole("button", { name: "New classroom" }).click();
await pick(teacher, "Organization unit", /^IT/);
await pick(teacher, "Course", new RegExp(`^Robotics ${ts}`));
await teacher.getByRole("dialog").getByLabel("Code").fill(`RB${ts}-A`);
await teacher.getByRole("dialog").getByLabel("Title").fill(`Robotics ${ts} A`);
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
await teacher.getByRole("link", { name: new RegExp(`Robot arm ${ts}`) }).first().waitFor();
log("teacher started an individual project for the student");

// ---------- the student works on the board ----------
await student.goto(`${B}/app/projects`);
await student.getByRole("link", { name: new RegExp(`Robot arm ${ts}`) }).first().click();
await student.waitForURL(/\/app\/c\/project\/[0-9a-f-]{36}$/);
const projectUrl = student.url();
await student.getByText("Lift 1 kg").waitFor();
await student.locator('[data-nav-key="project-board"]').click();
await student.getByRole("button", { name: "Add task to To do" }).click();
await student.getByRole("dialog").getByLabel("Title").fill("Mount the servo");
await submit(student, "Add");
const card = student.locator("[data-task-key]", { hasText: "Mount the servo" });
await card.waitFor();
await drag(student, card, student.locator('[data-column="Done"]'));
await student.locator('[data-column="Done"] [data-task-key]', { hasText: "Mount the servo" }).waitFor();
await student.reload();
await student.locator('[data-column="Done"] [data-task-key]', { hasText: "Mount the servo" }).waitFor();
log("student dragged a task to Done and it stayed after a reload");

await card.click();
await student.getByRole("dialog").getByLabel("New checklist item").fill("Buy screws");
await student.getByRole("dialog").getByRole("button", { name: "Add", exact: true }).click();
await student.getByRole("dialog").getByText("Buy screws").waitFor();
await student.keyboard.press("Escape");
log("student added a checklist item from the task dialog");

await student.goto(projectUrl);
await student.getByText("1 of 1 done · 100%").waitFor();
log("overview shows the progress");

// ---------- completing makes it read-only ----------
await teacher.goto(projectUrl);
await teacher.getByRole("button", { name: "Complete", exact: true }).click();
await submit(teacher, "Complete");      // the Complete dialog (optional final score)
await teacher.getByText(/completed and read-only/).waitFor();
await student.goto(`${projectUrl}/board`);
await student.getByText(/read-only/).waitFor();
if (await student.getByRole("button", { name: "Add task to To do" }).count()) throw new Error("completed project still editable");
log("a completed project is read-only for the student");

await browser.close();
console.log("PROJECTS E2E PASSED");
