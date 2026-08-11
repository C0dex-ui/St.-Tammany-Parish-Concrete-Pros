/**
 * Build static output into /public with the correct brand homepage.
 *
 * VERCEL_PROJECT_PRODUCTION_URL (or BRAND_HOME):
 *   new-orleans-concrete-pros → New Orleans Concrete Pros at /
 *   otherwise                 → St. Tammany Parish Concrete Pros at /
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "public");

const prodUrl = (
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  ""
).toLowerCase();

const isNola =
  prodUrl.includes("new-orleans-concrete-pros") ||
  process.env.BRAND_HOME === "nola-concrete";

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === "public" || entry.name === "scripts" || entry.name === "node_modules" || entry.name === ".git" || entry.name === ".vercel") {
      continue;
    }
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

rmrf(outDir);
copyDir(root, outDir);

// Choose homepage
const homeSrc = isNola
  ? path.join(root, "new-orleans-concrete.html")
  : path.join(root, "index.html");

fs.copyFileSync(homeSrc, path.join(outDir, "index.html"));

// Keep brand page files available for cleanUrls / cross-links
// (already copied)

console.log("[select-home] production URL:", prodUrl || "(unset)");
console.log(
  "[select-home] homepage:",
  isNola ? "New Orleans Concrete Pros" : "St. Tammany Parish Concrete Pros"
);
console.log("[select-home] output:", outDir);
