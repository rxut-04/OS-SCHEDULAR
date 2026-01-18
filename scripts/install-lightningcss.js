const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function log(message) {
  process.stdout.write(`[lightningcss] ${message}\n`);
}

function installLinuxBinary(pkg) {
  log(`Installing ${pkg}...`);
  execSync(`npm install --no-save ${pkg}`, { stdio: "inherit" });
}

function ensureBinaryPresent() {
  const projectRoot = path.resolve(__dirname, "..");
  const expectedBinary = path.join(
    projectRoot,
    "node_modules",
    "lightningcss",
    "lightningcss.linux-x64-gnu.node"
  );
  if (fs.existsSync(expectedBinary)) {
    log("Binary already present.");
    return;
  }

  const sourceBinary = findBinary(
    path.join(projectRoot, "node_modules", "lightningcss-linux-x64-gnu"),
    /lightningcss\.linux-x64-gnu\.node$/
  );
  if (!sourceBinary) {
    throw new Error("Linux binary package installed, but binary not found.");
  }

  fs.copyFileSync(sourceBinary, expectedBinary);
  log(`Copied Linux binary into lightningcss package from ${sourceBinary}.`);
}

function ensureTailwindOxidePresent() {
  const projectRoot = path.resolve(__dirname, "..");
  const expectedBinary = path.join(
    projectRoot,
    "node_modules",
    "@tailwindcss",
    "oxide",
    "tailwindcss-oxide.linux-x64-gnu.node"
  );
  if (fs.existsSync(expectedBinary)) {
    log("Tailwind oxide binary already present.");
    return;
  }

  const sourceBinary = findBinary(
    path.join(projectRoot, "node_modules", "@tailwindcss", "oxide-linux-x64-gnu"),
    /tailwindcss-oxide\.linux-x64-gnu\.node$/
  );
  if (!sourceBinary) {
    throw new Error("Tailwind oxide binary package installed, but binary not found.");
  }

  fs.copyFileSync(sourceBinary, expectedBinary);
  log(`Copied Tailwind oxide binary into @tailwindcss/oxide from ${sourceBinary}.`);
}

function findBinary(rootDir, pattern) {
  if (!fs.existsSync(rootDir)) {
    return null;
  }

  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (pattern.test(entry.name)) {
        return fullPath;
      }
    }
  }

  return null;
}

function main() {
  if (process.platform !== "linux" || process.arch !== "x64") {
    log("Skipping install (not Linux x64).");
    return;
  }

  try {
    installLinuxBinary("lightningcss-linux-x64-gnu@1.30.2");
    installLinuxBinary("@tailwindcss/oxide-linux-x64-gnu@4.1.18");
    ensureBinaryPresent();
    ensureTailwindOxidePresent();
  } catch (error) {
    log(`Failed to prepare lightningcss binary: ${error.message}`);
    process.exit(1);
  }
}

main();
