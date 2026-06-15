import { execSync } from "child_process";

const API_DIR = "app\\api";
const API_DIR_BACKUP = "app\\_api_backup";

function run(cmd, ignoreErrors = false) {
  console.log(`[mobile-build] $ ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit", shell: "powershell" });
    return true;
  } catch (e) {
    if (ignoreErrors) {
      console.log(`[mobile-build] (ignored)`);
      return false;
    }
    throw e;
  }
}

async function build() {
  console.log("[mobile-build] Starting mobile build...");

  // Clean
  run("if (Test-Path .next) { Remove-Item .next -Recurse -Force }", true);
  run("if (Test-Path out) { Remove-Item out -Recurse -Force }", true);

  // Move API dir out of the way
  try {
    run(`if (Test-Path "${API_DIR_BACKUP}") { Remove-Item "${API_DIR_BACKUP}" -Recurse -Force }`, true);
    run(`if (Test-Path "${API_DIR}") { Copy-Item "${API_DIR}" "${API_DIR_BACKUP}" -Recurse; Remove-Item "${API_DIR}" -Recurse -Force }`);
    console.log("[mobile-build] API directory backed up.");
  } catch (e) {
    console.log("[mobile-build] Could not move API dir:", e.message);
  }

  try {
    // Build with BUILD_TARGET=mobile for static export
    console.log("[mobile-build] Building Next.js (static export)...");
    run("$env:BUILD_TARGET='mobile'; npx next build");

    // Verify out dir
    try {
      execSync('Test-Path "out"', { stdio: "pipe", shell: "powershell" });
    } catch {
      throw new Error("out/ directory was not created. Build may have failed.");
    }

    // Sync to Android
    console.log("[mobile-build] Syncing to Android...");
    run("npx cap sync android");

    console.log("[mobile-build] Build & sync complete!");
  } finally {
    // Restore API dir
    try {
      run(`if (Test-Path "${API_DIR_BACKUP}") { if (Test-Path "${API_DIR}") { Remove-Item "${API_DIR}" -Recurse -Force }; Copy-Item "${API_DIR_BACKUP}" "${API_DIR}" -Recurse; Remove-Item "${API_DIR_BACKUP}" -Recurse -Force }`, true);
      console.log("[mobile-build] API directory restored.");
    } catch {}
  }
}

build().catch((err) => {
  console.error("[mobile-build] Build failed:", err.message);
  try {
    execSync(`powershell -Command "if (Test-Path '${API_DIR_BACKUP}') { Remove-Item '${API_DIR}' -Recurse -ErrorAction SilentlyContinue; Copy-Item '${API_DIR_BACKUP}' '${API_DIR}' -Recurse; Remove-Item '${API_DIR_BACKUP}' -Recurse -Force }"`, { stdio: "pipe" });
  } catch {}
  process.exit(1);
});
