// Regenerates src/generated/*.ts from each running backend's OpenAPI document. Commit the output.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const targets = [
  ["iam", process.env.IAM_API_URL ?? "http://localhost:8080"],
  ["platform", process.env.PLATFORM_API_URL ?? "http://localhost:8082"],
];
for (const [name, url] of targets) {
  execFileSync("pnpm", ["exec", "openapi-typescript", `${url}/v3/api-docs`, "-o", `src/generated/${name}.ts`,
    "--properties-required-by-default"], { cwd: root, stdio: "inherit" });
}
