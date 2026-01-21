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
  const binaryPkgPath = path.join(projectRoot, "node_modules", "lightningcss-linux-x64-gnu");
  
  // Try multiple possible locations for the binary
  const possibleBinaryPaths = [
    path.join(binaryPkgPath, "lightningcss.linux-x64-gnu.node"),
    path.join(binaryPkgPath, "lightningcss", "lightningcss.linux-x64-gnu.node"),
    path.join(binaryPkgPath, "node", "lightningcss.linux-x64-gnu.node"),
  ];
  
  // Also search recursively
  let sourceBinary = findBinary(binaryPkgPath, /lightningcss\.linux-x64-gnu\.node$/);
  
  // Try direct paths first
  for (const possiblePath of possibleBinaryPaths) {
    if (fs.existsSync(possiblePath)) {
      sourceBinary = possiblePath;
      break;
    }
  }
  
  if (!sourceBinary) {
    log(`Binary package path: ${binaryPkgPath}`);
    log(`Package exists: ${fs.existsSync(binaryPkgPath)}`);
    if (fs.existsSync(binaryPkgPath)) {
      log(`Package contents: ${fs.readdirSync(binaryPkgPath).join(", ")}`);
    }
    throw new Error("Linux binary package installed, but binary not found.");
  }
  
  log(`Found source binary at: ${sourceBinary}`);
  
  // Check both root and nested locations
  const locations = [
    path.join(projectRoot, "node_modules", "lightningcss"),
    path.join(projectRoot, "node_modules", "@tailwindcss", "node", "node_modules", "lightningcss"),
  ];

  for (const location of locations) {
    if (!fs.existsSync(location)) {
      continue;
    }
    
    const nodeDir = path.join(location, "node");
    const targetPath = path.join(nodeDir, "lightningcss.linux-x64-gnu.node");
    
    if (!fs.existsSync(targetPath)) {
      // Ensure directory exists
      if (!fs.existsSync(nodeDir)) {
        fs.mkdirSync(nodeDir, { recursive: true });
      }
      fs.copyFileSync(sourceBinary, targetPath);
      log(`Copied Linux binary to ${targetPath}.`);
    } else {
      log(`Binary already exists at ${targetPath}.`);
    }
  }
}

function ensureTailwindOxidePresent() {
  const projectRoot = path.resolve(__dirname, "..");
  const binaryPkgPath = path.join(projectRoot, "node_modules", "@tailwindcss", "oxide-linux-x64-gnu");
  const targetPath = path.join(
    projectRoot,
    "node_modules",
    "@tailwindcss",
    "oxide",
    "tailwindcss-oxide.linux-x64-gnu.node"
  );
  
  if (fs.existsSync(targetPath)) {
    log("Tailwind oxide binary already present.");
    return;
  }

  // Try multiple possible locations
  const possibleBinaryPaths = [
    path.join(binaryPkgPath, "tailwindcss-oxide.linux-x64-gnu.node"),
    path.join(binaryPkgPath, "tailwindcss-oxide", "tailwindcss-oxide.linux-x64-gnu.node"),
    path.join(binaryPkgPath, "node", "tailwindcss-oxide.linux-x64-gnu.node"),
  ];
  
  let sourceBinary = findBinary(binaryPkgPath, /tailwindcss-oxide\.linux-x64-gnu\.node$/);
  
  for (const possiblePath of possibleBinaryPaths) {
    if (fs.existsSync(possiblePath)) {
      sourceBinary = possiblePath;
      break;
    }
  }
  
  if (!sourceBinary) {
    log(`Binary package path: ${binaryPkgPath}`);
    log(`Package exists: ${fs.existsSync(binaryPkgPath)}`);
    if (fs.existsSync(binaryPkgPath)) {
      log(`Package contents: ${fs.readdirSync(binaryPkgPath).join(", ")}`);
    }
    throw new Error("Tailwind oxide binary package installed, but binary not found.");
  }
  
  log(`Found Tailwind oxide source binary at: ${sourceBinary}`);
  
  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  fs.copyFileSync(sourceBinary, targetPath);
  log(`Copied Tailwind oxide binary to ${targetPath}.`);
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
  // Always run on Linux x64 (including Netlify)
  if (process.platform !== "linux" || process.arch !== "x64") {
    log("Skipping install (not Linux x64).");
    return;
  }

  try {
    installLinuxBinary("lightningcss-linux-x64-gnu@1.30.2");
    installLinuxBinary("@tailwindcss/oxide-linux-x64-gnu@4.1.18");
  } catch (error) {
    log(`Warning: Failed to install binary packages: ${error.message}`);
    log("Build will continue but may be slower without native binaries.");
    return;
  }
  
  try {
    ensureBinaryPresent();
  } catch (error) {
    log(`Warning: Failed to prepare lightningcss binary: ${error.message}`);
    log("Build will continue but may be slower without native binaries.");
  }
  
  try {
    ensureTailwindOxidePresent();
  } catch (error) {
    log(`Warning: Failed to prepare Tailwind oxide binary: ${error.message}`);
    log("Build will continue but may be slower without native binaries.");
  }
}

main();
