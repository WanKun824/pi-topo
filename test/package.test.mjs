import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

test("package manifest points to existing resources", () => {
  const pkg = readJson("package.json");
  assert.equal(pkg.name, "pi-topo");
  assert.ok(fs.existsSync(path.join(root, "index.ts")));
  for (const entry of pkg.pi.extensions) {
    assert.ok(fs.existsSync(path.join(root, entry)), `missing extension: ${entry}`);
  }
  for (const dir of [...pkg.pi.skills, ...pkg.pi.prompts]) {
    assert.ok(fs.existsSync(path.join(root, dir)), `missing resource: ${dir}`);
  }
});

test("package root only ships the /topo prompt", () => {
  const prompts = fs.readdirSync(path.join(root, "prompts")).filter((f) => f.endsWith(".md"));
  assert.deepEqual(prompts, ["topo.md"]);
});

test("embedded runner version self-check is consistent", async () => {
  const vendor = readJson("vendor/pi-subagents/package.json");
  const { readInstalledPackageVersion } = await import(
    "../vendor/pi-subagents/src/shared/package-version.js"
  );
  assert.equal(readInstalledPackageVersion(), vendor.version);
});

test("embedded runner has no broken relative imports", () => {
  const rootDir = path.join(root, "vendor", "pi-subagents");
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        walk(full);
      } else if (/\.(?:js|mjs|cjs)$/.test(entry.name)) {
        files.push(full);
      }
    }
  };
  walk(rootDir);

  const specifier = /(?:from\s+|import\s*\(\s*)["'](\.[^"']+)["']/g;
  const problems = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(specifier)) {
      const raw = match[1];
      const base = path.resolve(path.dirname(file), raw);
      const candidates = [
        base,
        `${base}.js`,
        `${base}.mjs`,
        `${base}.cjs`,
        path.join(base, "index.js"),
        path.join(base, "index.mjs"),
      ];
      if (!candidates.some((candidate) => fs.existsSync(candidate))) {
        problems.push(`${path.relative(root, file)} -> ${raw}`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

test("embedded runner runtime dependencies are declared", () => {
  const pkg = readJson("package.json");
  const vendor = readJson("vendor/pi-subagents/package.json");
  for (const dep of Object.keys(vendor.dependencies || {})) {
    assert.ok(pkg.dependencies?.[dep], `missing runtime dependency: ${dep}`);
  }
});
