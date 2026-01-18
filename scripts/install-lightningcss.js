const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function log(message) {
  process.stdout.write(`[lightningcss] ${message}\n`);
}

function installLinuxBinary() {
  const pkg = "lightningcss-linux-x64-gnu@1.30.2";
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

  const sourceBinary = path.join(
    projectRoot,
    "node_modules",
    "lightningcss-linux-x64-gnu",
    "lightningcss.linux-x64-gnu.node"
  );
  if (!fs.existsSync(sourceBinary)) {
    throw new Error("Linux binary package installed, but binary not found.");
  }

  fs.copyFileSync(sourceBinary, expectedBinary);
  log("Copied Linux binary into lightningcss package.");
}

function main() {
  if (process.platform !== "linux" || process.arch !== "x64") {
    log("Skipping install (not Linux x64).");
    return;
  }

  try {
    installLinuxBinary();
    ensureBinaryPresent();
  } catch (error) {
    log(`Failed to prepare lightningcss binary: ${error.message}`);
    process.exit(1);
  }
}

main();
